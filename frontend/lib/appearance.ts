import type { AppearancePreferences } from "@/lib/settings-types";

export type ThemeMode = AppearancePreferences["theme"];
export { DEFAULT_APPEARANCE } from "@/lib/settings-types";

const STORAGE_KEY = "gymrathub-appearance";

export function resolveTheme(theme: ThemeMode): "dark" | "light" {
  if (theme === "auto") {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }
  return theme;
}

export function applyAppearance(prefs: AppearancePreferences) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const resolved = resolveTheme(prefs.theme);

  root.setAttribute("data-theme", resolved);
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
  root.style.setProperty("--color-primary", prefs.accentColor);
  root.style.setProperty("--color-primary-hover", prefs.accentColor);
  root.style.setProperty("--color-primary-muted", `${prefs.accentColor}1f`);

  root.toggleAttribute("data-compact", prefs.compactMode);
  root.toggleAttribute("data-reduced-motion", !prefs.animations);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function loadCachedAppearance(): AppearancePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppearancePreferences) : null;
  } catch {
    return null;
  }
}
