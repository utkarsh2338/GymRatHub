"use client";

import { useState } from "react";
import { iconImageUrl } from "@clerk/shared/constants";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92a8.78 8.78 0 0 0 2.68-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.55-1.86.88-3.04.88-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A8.99 8.99 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.73A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.17.28-1.73V4.94H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.96 4.06l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A8.99 8.99 0 0 0 .96 4.94l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
      <path d="M14.94 9.54c.02 2.11 1.86 2.82 1.88 2.83-.02.06-.29.98-.96 1.94-.58.83-1.18 1.66-2.12 1.68-.93.02-1.23-.55-2.3-.55-1.07 0-1.4.53-2.28.57-.92.04-1.62-.92-2.21-1.75-1.2-1.74-2.12-4.91-.88-7.06.61-1.08 1.7-1.76 2.88-1.78.9-.02 1.75.6 2.3.6.55 0 1.58-.74 2.67-.63.45.02 1.72.18 2.53 1.37-.07.04-1.51.88-1.49 2.63zm-2.2-5.1c.5-.6.83-1.44.74-2.27-.71.03-1.57.47-2.08 1.07-.46.53-.87 1.39-.76 2.21.8.06 1.62-.41 2.1-1.01z" />
    </svg>
  );
}

const FALLBACKS: Record<string, () => React.JSX.Element> = {
  google: GoogleIcon,
  apple: AppleIcon,
};

export default function OAuthProviderIcon({ providerId }: { providerId: string }) {
  const [useFallback, setUseFallback] = useState(false);
  const Fallback = FALLBACKS[providerId];

  if (useFallback && Fallback) {
    return <Fallback />;
  }

  return (
    <img
      src={iconImageUrl(providerId)}
      alt=""
      width={18}
      height={18}
      style={{ display: "block", flexShrink: 0 }}
      onError={() => setUseFallback(true)}
    />
  );
}
