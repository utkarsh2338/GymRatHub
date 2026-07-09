import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid token." });
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ error: "Unauthorized: Token verification failed." });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid token payload." });
    }

    // Attach user ID to the request object
    req.auth = { userId: decoded.userId };

    // Verify user exists in the database
    const userExists = await UserModel.exists({ clerkId: decoded.userId });
    if (!userExists) {
      return res.status(401).json({ error: "Unauthorized: User not found." });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Unauthorized: An error occurred." });
  }
}

export default requireAuth;
