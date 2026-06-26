"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import { applyAppearance, loadCachedAppearance } from "@/lib/appearance";
import type { AppearancePreferences } from "@/lib/settings-types";
import { DEFAULT_APPEARANCE } from "@/lib/settings-types";

export default function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const api = useApiClient();
  const isApiReady = useIsApiReady();

  useEffect(() => {
    const cached = loadCachedAppearance();
    if (cached) applyAppearance(cached);
  }, []);

  const { data } = useQuery<{ appearance: AppearancePreferences }>({
    queryKey: ["userPreferences"],
    queryFn: () => api("/users/preferences"),
    enabled: isApiReady,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (data?.appearance) {
      applyAppearance({ ...DEFAULT_APPEARANCE, ...data.appearance });
    }
  }, [data?.appearance]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const cached = loadCachedAppearance();
      if (cached?.theme === "auto") applyAppearance(cached);
      else if (data?.appearance?.theme === "auto") {
        applyAppearance({ ...DEFAULT_APPEARANCE, ...data.appearance });
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [data?.appearance]);

  return <>{children}</>;
}
