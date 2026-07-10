import dotenv from "dotenv";
// Load environment variables before importing other modules
dotenv.config();

// Validate environment variables
import { env } from "./config/env";

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import apiRouter from "./routes/api";
import authRouter from "./routes/auth";
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

/** Allow Vercel preview/production deployments (e.g. *.vercel.app) automatically. */
function isAllowedOrigin(origin: string): boolean {
  if (staticAllowedOrigins.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
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
      console.warn(`[CORS] Blocked request from disallowed origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

// Health Check Route
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Auth API routes (unprotected)
app.use("/api/auth", authRouter);

// Protected API routes
app.use("/api", requireAuth, apiRouter);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Server Error:", err.stack || err);
  res.status(500).json({ error: "An unhandled server error occurred." });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});