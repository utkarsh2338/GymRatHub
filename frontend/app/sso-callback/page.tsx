"use client";

import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { AUTH_SUCCESS_PATH } from "@/lib/auth-redirect";

const CALLBACK_PROPS = {
  signInUrl: "/auth",
  signUpUrl: "/auth",
  signInForceRedirectUrl: AUTH_SUCCESS_PATH,
  signUpForceRedirectUrl: AUTH_SUCCESS_PATH,
  signInFallbackRedirectUrl: AUTH_SUCCESS_PATH,
  signUpFallbackRedirectUrl: AUTH_SUCCESS_PATH,
  transferable: true as const,
};

/** Hard navigation after OAuth so middleware sees the session cookie. */
function DashboardRedirectAfterOAuth() {
  const { isLoaded, isSignedIn } = useAuth();
  const redirected = useRef(false);

  useEffect(() => {
    console.log("SSO", {
      isLoaded,
      isSignedIn,
    });
    if (!isLoaded || !isSignedIn || redirected.current) return;
    redirected.current = true;
    window.location.replace(AUTH_SUCCESS_PATH);
  }, [isLoaded, isSignedIn]);

  return null;
}

/**
 * Completes OAuth redirects started by authenticateWithRedirect on the auth page.
 */
export default function SSOCallbackPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#6b7280",
        fontSize: 14,
      }}
    >
      <AuthenticateWithRedirectCallback {...CALLBACK_PROPS} />
      <DashboardRedirectAfterOAuth />
      <span>Completing sign in…</span>
    </div>
  );
}

