import * as Sentry from "@sentry/node";
import { env } from "./env";
import express from "express";

/**
 * Initializes Sentry error tracking for the backend Node.js process.
 *
 * This is a no-op when SENTRY_DSN is not set — local development and
 * environments without a DSN work normally with zero overhead.
 *
 * Call this FIRST in src/index.ts (before creating the express app),
 * then call attachSentryErrorHandler(app) AFTER all routes are defined.
 */
export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    return; // Silently disabled — no DSN configured
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    // Capture 100% of transactions in development; tune down in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}

/**
 * Attaches Sentry's Express error handler to the app.
 * Must be called AFTER all routes and BEFORE any other error middleware.
 * This is a no-op when SENTRY_DSN is not set.
 */
export function attachSentryErrorHandler(app: express.Application): void {
  if (!env.SENTRY_DSN) {
    return;
  }
  Sentry.setupExpressErrorHandler(app);
}
