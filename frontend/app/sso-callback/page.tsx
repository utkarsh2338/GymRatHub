import SSOCallbackClient from "@/components/auth/SSOCallbackClient";

// This page relies on Clerk's client runtime (AuthenticateWithRedirectCallback),
// which needs a live <ClerkProvider>. Force dynamic rendering so it is NEVER
// statically prerendered at build time — that prerender is what crashed the
// Vercel build when the Clerk publishable key was missing/invalid.
export const dynamic = "force-dynamic";

export default function SSOCallbackPage() {
  return <SSOCallbackClient />;
}
