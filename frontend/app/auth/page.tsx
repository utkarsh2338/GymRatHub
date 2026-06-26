import type { Metadata } from "next";
import AuthPageClient from "@/components/auth/AuthPage";

// The auth UI relies on Clerk client hooks (useAuth/useSignIn) and a live
// <ClerkProvider>. Render it dynamically so it is never statically prerendered
// at build time — that prerender is what crashes the build when the Clerk
// publishable key is missing/invalid in the deploy environment.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In — GymRat Hub",
  description: "Login or create your GymRat Hub account to start training.",
};

export default function Page() {
  return <AuthPageClient />;
}
