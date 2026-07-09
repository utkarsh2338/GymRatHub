"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import OAuthProviderIcon from "@/components/auth/OAuthProviderIcon";
import { useClerk } from "@/lib/auth-context";
import { AUTH_SUCCESS_PATH } from "@/lib/auth-redirect";

type OAuthMode = "sign-in" | "sign-up";
type OAuthStrategy = "oauth_google" | "oauth_apple";

const ENABLED_STRATEGIES: OAuthStrategy[] = ["oauth_google", "oauth_apple"];

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
  onBeforeRedirect?: () => void;
}

export default function OAuthButtons({ mode, onBeforeRedirect }: OAuthButtonsProps) {
  const { loginWithGoogle } = useClerk();
  const [gisLoaded, setGisLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).google?.accounts?.oauth2) {
      setGisLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGisLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handleOAuth = (strategy: OAuthStrategy) => {
    if (strategy === "oauth_google") {
      if (!gisLoaded || !(window as any).google?.accounts?.oauth2) {
        toast.error("Google authentication is still loading. Please try again in a moment.");
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        toast.error(
          "Google Client ID is not configured. Please define NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file.",
          { duration: 6000 }
        );
        return;
      }

      try {
        if (mode === "sign-up") {
          onBeforeRedirect?.();
        }

        const goal = typeof window !== "undefined" ? localStorage.getItem("gymrat_signup_goal") || "build_muscle" : "build_muscle";

        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              console.error("Google OAuth error:", tokenResponse.error);
              toast.error(`Google authentication error: ${tokenResponse.error}`);
              return;
            }

            if (tokenResponse.access_token) {
              toast.loading("Signing in with Google...", { id: "google-auth" });
              const success = await loginWithGoogle(tokenResponse.access_token, goal);
              if (success) {
                toast.success("Welcome back! 🎉", { id: "google-auth" });
                window.location.replace(AUTH_SUCCESS_PATH);
              } else {
                toast.error("Google login failed. Please try again.", { id: "google-auth" });
              }
            }
          },
          error_callback: (err: any) => {
            console.error("Google client error:", err);
            toast.error("Google client error occurred. Please check console for details.");
          }
        });

        client.requestAccessToken();
      } catch (err) {
        console.error("Failed to initialize Google Login client:", err);
        toast.error("Google Sign-In initialization failed.");
      }
    } else {
      toast.info("Apple Sign-In is disabled in development.");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {ENABLED_STRATEGIES.map((strategy) => {
        const providerId = strategy.replace("oauth_", "");
        const providerName = providerId.charAt(0).toUpperCase() + providerId.slice(1);

        return (
          <button
            key={strategy}
            type="button"
            onClick={() => handleOAuth(strategy)}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#39E609";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#333";
            }}
          >
            <OAuthProviderIcon providerId={providerId} />
            {providerName}
          </button>
        );
      })}
    </div>
  );
}
