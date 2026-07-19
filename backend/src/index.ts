import dotenv from "dotenv";
// Load environment variables before importing other modules
dotenv.config();

// Validate environment variables
import { env } from "./config/env";

// Initialize Sentry before any other imports so it can instrument all modules
import { initSentry, attachSentryErrorHandler } from "./config/sentry";
import { logger } from "./config/logger";

initSentry();

import express from "express";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db";
import apiRouter from "./routes/api";
import authRouter from "./routes/auth";
import paymentsRouter from "./routes/payments";
import progressPhotosRouter from "./routes/progressPhotos";
import { requireAuth } from "./middleware/auth";

const app = express();
const PORT = env.PORT;

// Connect to MongoDB
connectDB();

/**
 * Build the list of explicitly allowed origins.
 * FRONTEND_URL may contain a single URL or a comma-separated list, so that
 * production + any custom domains can all be allowed without code changes.
 */
const staticAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((u) => u.trim().replace(/\/+$/, ""))
    .filter(Boolean),
];

/** Allow Vercel preview/production deployments (e.g. *.vercel.app) automatically. 
 *  In development, any localhost / 127.0.0.1 port is allowed so Next.js
 *  port-bumping (3000 → 3001 → 3002 …) never causes a CORS block. */
function isAllowedOrigin(origin: string): boolean {
  if (staticAllowedOrigins.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    if (
      process.env.NODE_ENV !== "production" &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    ) {
      return true;
    }
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server) that have no Origin.
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);
      logger.warn({ origin }, "[CORS] Blocked request from disallowed origin");
      return callback(null, false);
    },
    credentials: true,
  })
);

// Mount payments router BEFORE express.json() so webhook gets raw body
app.use("/api/payments", paymentsRouter);

app.use(express.json());

// Health Check Route
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Static hosting for uploads
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Auth API routes (unprotected)
app.use("/api/auth", authRouter);

// Protected API routes
app.use("/api/progress-photos", progressPhotosRouter);
app.use("/api", requireAuth, apiRouter);

// Error Handling Middleware — Sentry captures the error first, then we return JSON.
// attachSentryErrorHandler is a no-op when SENTRY_DSN is not set.
attachSentryErrorHandler(app);
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, "Unhandled server error");
  res.status(500).json({ error: "An unhandled server error occurred." });
});

// Start Server
app.listen(PORT, () => {
  logger.info(`[Server] Running on http://localhost:${PORT}`);
});