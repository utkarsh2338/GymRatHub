import SSOCallbackClient from "@/components/auth/SSOCallbackClient";

// Force dynamic so this page is NEVER statically prerendered at build time.
export const dynamic = "force-dynamic";

export default function SSOCallbackPage() {
  return <SSOCallbackClient />;
}