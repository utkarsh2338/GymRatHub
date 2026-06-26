"use client";

import { useEffect, useState, useCallback } from "react";
import { Moon, Sun, Smartphone, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import { applyAppearance } from "@/lib/appearance";
import { DEFAULT_APPEARANCE, type AppearancePreferences, type UserPreferencesResponse } from "@/lib/settings-types";
import { cardStyle, sectionTitleStyle, SettingsRow, ToggleSwitch } from "./settings-ui";

const ACCENT_COLORS = ["#39E609", "#38bdf8", "#f97316", "#a855f7", "#ef4444", "#f59e0b"];
const THEMES = [
  { id: "dark" as const, label: "Dark", icon: Moon },
  { id: "light" as const, label: "Light", icon: Sun },
  { id: "auto" as const, label: "System", icon: Smartphone },
];

export default function AppearanceSettings() {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState<AppearancePreferences>(DEFAULT_APPEARANCE);

  const { data, isLoading } = useQuery<UserPreferencesResponse>({
    queryKey: ["userPreferences"],
    queryFn: () => api("/users/preferences"),
    enabled: isApiReady,
  });

  useEffect(() => {
    if (data?.appearance) {
      const merged = { ...DEFAULT_APPEARANCE, ...data.appearance };
      setPrefs(merged);
      applyAppearance(merged);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (body: Partial<AppearancePreferences>) =>
      api("/users/preferences/appearance", { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      toast.success("Appearance saved");
    },
    onError: () => toast.error("Failed to save appearance."),
  });

  const patch = useCallback(
    (partial: Partial<AppearancePreferences>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...partial };
        applyAppearance(next);
        saveMutation.mutate(partial);
        return next;
      });
    },
    [saveMutation]
  );

  if (isLoading) return <div style={{ padding: 24, color: "#6b7280" }}>Loading appearance…</div>;

  return (
    <div style={cardStyle}>
      <p style={sectionTitleStyle}>Theme & Display</p>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          {THEMES.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} type="button" onClick={() => patch({ theme: t.id })} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 24px", borderRadius: 10, cursor: "pointer", border: `2px solid ${prefs.theme === t.id ? prefs.accentColor : "#2a2a2a"}`, background: prefs.theme === t.id ? `${prefs.accentColor}14` : "#1a1a1a", color: prefs.theme === t.id ? prefs.accentColor : "#6b7280" }}>
                <Icon size={20} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</span>
              </button>
            );
          })}
        </div>

        <p style={{ color: "#9ca3af", fontSize: 12, fontWeight: 500, marginBottom: 12 }}>Accent Color</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          {ACCENT_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => patch({ accentColor: c })} style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: "none", cursor: "pointer", outline: prefs.accentColor === c ? `3px solid ${c}` : "none", outlineOffset: 3 }} />
          ))}
        </div>

        <div style={{ height: 1, background: "#2a2a2a", margin: "0 0 16px" }} />
        <SettingsRow label="Compact Mode" description="Reduce spacing for a denser layout">
          <ToggleSwitch value={prefs.compactMode} onChange={(v) => patch({ compactMode: v })} />
        </SettingsRow>
        <SettingsRow label="Animations" description="Enable smooth transitions and micro-animations">
          <ToggleSwitch value={prefs.animations} onChange={(v) => patch({ animations: v })} />
        </SettingsRow>

        <div style={{ paddingTop: 16 }}>
          <label style={{ display: "block", fontSize: 12, color: "#9ca3af", fontWeight: 500, marginBottom: 8 }}>Language</label>
          <select value={prefs.language} onChange={(e) => patch({ language: e.target.value })} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", cursor: "pointer", width: "100%", maxWidth: 280 }}>
            {[["en", "English"], ["es", "Español"], ["fr", "Français"], ["de", "Deutsch"], ["pt", "Português"], ["ja", "日本語"], ["zh", "中文"]].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <p style={{ color: "#6b7280", fontSize: 11, marginTop: 8 }}>Language preference is saved to your account. Full UI translation coming soon.</p>
        </div>
      </div>
    </div>
  );
}
