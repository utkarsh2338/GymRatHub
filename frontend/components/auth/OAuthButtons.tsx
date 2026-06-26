"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs/legacy";
import { OAUTH_PROVIDERS } from "@clerk/shared/oauth";
import { toast } from "sonner";
import OAuthProviderIcon from "@/components/auth/OAuthProviderIcon";

type OAuthMode = "sign-in" | "sign-up";
type OAuthStrategy = "oauth_google" | "oauth_apple";

const ENABLED_STRATEGIES: OAuthStrategy[] = ["oauth_google", "oauth_apple"];

/** Clerk OAuth must use absolute URLs or redirects land on accounts.dev/default-redirect. */
function getOAuthRedirectUrls() {
  const origin = window.location.origin;
  return {
    redirectUrl: `${origin}/sso-callback`,
    redirectUrlComplete: `${origin}/dashboard`,
  };
}

const buttonStyle: React.CSSProperties = {
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 10,
  padding: "10px 16px",
  color: "#fff",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "border-color 0.2s, opacity 0.2s",
};

interface OAuthButtonsProps {
  mode: OAuthMode;
  /** Run before redirect (e.g. persist signup goal). */
  onBeforeRedirect?: () => void;
}

function getProviderMeta(strategy: OAuthStrategy) {
  return OAUTH_PROVIDERS.find((p) => p.strategy === strategy);
}

export default function OAuthButtons({ onBeforeRedirect }: OAuthButtonsProps) {
  const { isLoaded, signIn } = useSignIn();
  const [loading, setLoading] = useState<OAuthStrategy | null>(null);

  const handleOAuth = async (strategy: OAuthStrategy) => {
    if (!isLoaded || !signIn || loading) return;

    setLoading(strategy);
    try {
      onBeforeRedirect?.();

      // Always use signIn for OAuth — Clerk signs up new users automatically.
      await signIn.authenticateWithRedirect({
        strategy,
        ...getOAuthRedirectUrls(),
      });
    } catch (err: unknown) {
      console.error(err);
      const clerkErr = err as { errors?: { message: string }[]; message?: string };
      toast.error(
        clerkErr.errors?.[0]?.message || clerkErr.message || "OAuth sign-in failed. Try again."
      );
      setLoading(null);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {ENABLED_STRATEGIES.map((strategy) => {
        const meta = getProviderMeta(strategy);
        const providerId = meta?.provider ?? strategy.replace("oauth_", "");
        const isBusy = loading === strategy;
        const disabled = !isLoaded || (loading !== null && !isBusy);

        return (
          <button
            key={strategy}
            type="button"
            disabled={disabled}
            onClick={() => handleOAuth(strategy)}
            style={{
              ...buttonStyle,
              opacity: disabled ? 0.55 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!disabled) e.currentTarget.style.borderColor = "#39E609";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#333";
            }}
          >
            <OAuthProviderIcon providerId={providerId} />
            {isBusy ? "Connecting…" : meta?.name ?? providerId}
          </button>
        );
      })}
    </div>
  );
}
