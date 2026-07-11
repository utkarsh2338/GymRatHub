import pino from "pino";

/**
 * Shared structured logger for all GymRatHub backend services and routes.
 *
 * - Development: pretty-prints with colours via pino-pretty.
 * - Production: raw JSON to stdout, ready for any log aggregator
 *   (Datadog, CloudWatch, Logtail, etc.).
 *
 * Usage:
 *   import { logger } from "../config/logger";
 *   logger.info({ userId }, "Login successful");
 *   logger.error({ err }, "Unhandled payment error");
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(process.env.NODE_ENV !== "production"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

export default logger;
