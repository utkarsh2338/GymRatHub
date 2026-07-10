import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string({ message: "MONGODB_URI is required" }).min(1, "MONGODB_URI cannot be empty"),
  JWT_SECRET: z.string({ message: "JWT_SECRET is required to sign session tokens securely" }).min(1, "JWT_SECRET cannot be empty"),
  YOUTUBE_API_KEY: z.string({ message: "YOUTUBE_API_KEY is required to fetch tutorial videos" }).min(1, "YOUTUBE_API_KEY cannot be empty"),
  FRONTEND_URL: z.string().default(""),
  ANTHROPIC_API_KEY: z.string().optional(),
});

const isTest = typeof process !== "undefined" && process.env.NODE_ENV === "test";

let parsedEnv: z.infer<typeof envSchema>;

try {
  const dataToParse = isTest
    ? {
        PORT: process.env.PORT || 5000,
        MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/test",
        JWT_SECRET: process.env.JWT_SECRET || "test_jwt_secret",
        YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || "test_youtube_api_key",
        FRONTEND_URL: process.env.FRONTEND_URL || "",
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
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
