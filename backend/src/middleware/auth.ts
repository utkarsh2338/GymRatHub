import { createClerkClient, verifyToken } from "@clerk/backend";
import { Request, Response, NextFunction } from "express";
import UserModel from "../models/User";
import { FRESH_USER_STATS } from "../constants/freshUser";

const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

if (!secretKey) {
  console.warn("WARNING: CLERK_SECRET_KEY is not defined in backend environment.");
}

const clerkClient = createClerkClient({
  publishableKey,
  secretKey,
});

// FRONTEND_URL may be a single URL or a comma-separated list of allowed origins.
// The Clerk session token's `azp` claim must match one of these exactly, so the
// deployed frontend origin MUST be present here (set FRONTEND_URL on the backend host).
const authorizedParties = [
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((u) => u.trim().replace(/\/+$/, "")),
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter((url): url is string => Boolean(url));

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

/**
 * In-memory set of Clerk user IDs already provisioned in MongoDB this process.
 * Lets requireAuth skip a DB lookup on every subsequent authenticated request.
 * Safe to lose on restart -- ensureUserRecord re-provisions idempotently.
 */
const provisionedUsers = new Set<string>();

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    if (!secretKey) {
      return res.status(500).json({ error: "Server misconfiguration: missing Clerk secret key." });
    }

    const decoded = await verifyToken(token, {
      secretKey,
      ...(authorizedParties.length > 0 ? { authorizedParties } : {}),
    });

    if (!decoded?.sub) {
      return res.status(401).json({ error: "Unauthorized: Invalid session" });
    }

    req.auth = { userId: decoded.sub };

    // Provision the MongoDB user record only once per server lifetime.
    // After the first request for a given user, subsequent requests skip the
    // DB lookup (and Clerk API call) entirely, removing a round-trip from the
    // critical path of every authenticated request -> noticeably faster loads.
    if (!provisionedUsers.has(decoded.sub)) {
      await ensureUserRecord(decoded.sub);
      provisionedUsers.add(decoded.sub);
    }

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(401).json({ error: "Unauthorized: Token verification failed" });
  }
}

/** Idempotent user provisioning — safe when many API requests run in parallel. */
async function ensureUserRecord(clerkId: string) {
  const existing = await UserModel.findOne({ clerkId });
  if (existing) return existing;

  let name = "GymRat Athlete";
  let email = "user@gymrathub.com";
  let avatar = "";

  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "GymRat Athlete";
    email = clerkUser.emailAddresses[0]?.emailAddress || "";
    avatar = clerkUser.imageUrl || "";
  } catch (err) {
    console.error("Failed to fetch Clerk user profile, using defaults:", err);
  }

  const defaultStats = { ...FRESH_USER_STATS };

  try {
    const user = await UserModel.findOneAndUpdate(
      { clerkId },
      {
        $setOnInsert: {
          clerkId,
          name,
          email,
          avatar,
          plan: "pro",
          stats: defaultStats,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (user) {
      console.log(`Ensured MongoDB user record for Clerk ID: ${clerkId}`);
    }
    return user;
  } catch (err: unknown) {
    const mongoErr = err as { code?: number };
    if (mongoErr.code === 11000) {
      return UserModel.findOne({ clerkId });
    }
    throw err;
  }
}
export default requireAuth;
