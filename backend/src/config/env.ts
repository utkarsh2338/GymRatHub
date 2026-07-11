import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string({ message: "MONGODB_URI is required" }).min(1, "MONGODB_URI cannot be empty"),
  JWT_SECRET: z.string({ message: "JWT_SECRET is required to sign session tokens securely" }).min(1, "JWT_SECRET cannot be empty"),
  // Optional — tutorial search degrades gracefully without this key
  YOUTUBE_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().default(""),
  ANTHROPIC_API_KEY: z.string().optional(),
  // Stripe — defaults to mock values so local dev works without real keys
  STRIPE_SECRET_KEY: z.string().default("sk_test_mock"),
  STRIPE_WEBHOOK_SECRET: z.string().default("whsec_mock"),
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().default("price_pro_monthly_mock"),
  STRIPE_PRO_ANNUAL_PRICE_ID: z.string().default("price_pro_annual_mock"),
  STRIPE_ELITE_MONTHLY_PRICE_ID: z.string().default("price_elite_monthly_mock"),
  STRIPE_ELITE_ANNUAL_PRICE_ID: z.string().default("price_elite_annual_mock"),
  // Redis — defaults to local instance; BullMQ falls back to in-memory if unreachable
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  // Resend — optional; email queue falls back to console logging without it
  RESEND_API_KEY: z.string().optional(),
  // Sentry — optional; error tracking silently disabled without a DSN
  SENTRY_DSN: z.string().optional(),
});

const isTest = typeof process !== "undefined" && process.env.NODE_ENV === "test";

let parsedEnv: z.infer<typeof envSchema>;

try {
  const dataToParse = isTest
    ? {
        PORT: process.env.PORT || 5000,
        MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/test",
        JWT_SECRET: process.env.JWT_SECRET || "test_jwt_secret",
        YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
        FRONTEND_URL: process.env.FRONTEND_URL || "",
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        SENTRY_DSN: process.env.SENTRY_DSN,
      }
    : process.env;

  parsedEnv = envSchema.parse(dataToParse);
} catch (error) {
  if (error instanceof z.ZodError) {
    const issues = (error.issues || []).map((err) => `${err.path.join(".")}: ${err.message}`).join("\n");
    console.error("❌ Invalid environment configuration:\n" + issues);
  } else {
    console.error("❌ Environmental check failed:", error);
  }
  process.exit(1);
}

export const env = parsedEnv;
export default env;
