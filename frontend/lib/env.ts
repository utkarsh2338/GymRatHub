import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1, "NEXT_PUBLIC_GOOGLE_CLIENT_ID cannot be empty"),
});

// In CI pipelines (e.g. GitHub Actions), environment variables are mock placeholders.
// We skip validation in CI to prevent builds from failing due to missing keys,
// but enforce it during development and client-side runtime.
const isCI = typeof process !== "undefined" && process.env.CI;
const shouldValidate = !isCI && (typeof window !== "undefined" || process.env.NODE_ENV === "development");

export let env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
};

if (shouldValidate) {
  try {
    const parsed = envSchema.parse({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    env = parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n");
      console.error("❌ Frontend environment validation failed:\n" + issues);
      
      // In development or server startup, crash with a clear message
      if (typeof window === "undefined") {
        throw new Error("Invalid frontend configuration:\n" + issues);
      }
    }
  }
}

export default env;
