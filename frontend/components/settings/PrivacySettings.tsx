"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import { useClerk } from "@/lib/auth-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import { DEFAULT_PRIVACY, type PrivacyPreferences, type UserPreferencesResponse } from "@/lib/settings-types";
import { cardStyle, sectionTitleStyle, SettingsRow, ToggleSwitch } from "./settings-ui";

export default function PrivacySettings() {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();
  const { openUserProfile } = useClerk();
  const [prefs, setPrefs] = useState<PrivacyPreferences>(DEFAULT_PRIVACY);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useQuery<UserPreferencesResponse>({
    queryKey: ["userPreferences"],
    queryFn: () => api("/users/preferences"),
    enabled: isApiReady,
  });

  useEffect(() => {
    if (data?.privacy) setPrefs({ ...DEFAULT_PRIVACY, ...data.privacy });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (body: Partial<PrivacyPreferences>) =>
      api("/users/preferences/privacy", { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      toast.success("Privacy settings saved");
    },
    onError: () => toast.error("Failed to save privacy settings."),
  });

  const update = useCallback(
    (key: keyof PrivacyPreferences, value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        saveMutation.mutate({ [key]: value });
        return next;
      });
    },
    [saveMutation]
  );

  const handleExportViaApi = async () => {
    setExporting(true);
    try {
      const data = await api("/users/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gymrathub-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data export downloaded!");
    } catch {
      toast.error("Could not export data.");
    } finally {
      setExporting(false);
    }
  };

  const privacyToggles: { key: keyof PrivacyPreferences; label: string; description: string }[] = [
    { key: "publicProfile", label: "Public Profile", description: "Allow others to find and view your profile" },
    { key: "showStats", label: "Show Fitness Stats", description: "Display your workout stats on your public profile" },
    { key: "showWorkouts", label: "Share Workout History", description: "Allow followers to see your completed workouts" },
    { key: "allowMessages", label: "Allow Direct Messages", description: "Let other members send you messages" },
    { key: "activityStatus", label: "Show Activity Status", description: "Let others see when you were last active" },
  ];

  if (isLoading) return <div style={{ padding: 24, color: "#6b7280" }}>Loading privacy settings…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={cardStyle}>
        <div style={{ ...sectionTitleStyle, display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={16} color="#a855f7" /> Privacy Settings
        </div>
        <div style={{ padding: "0 20px" }}>
          {privacyToggles.map((t) => (
            <SettingsRow key={t.key} label={t.label} description={t.description}>
              <ToggleSwitch value={prefs[t.key]} onChange={(v) => update(t.key, v)} />
            </SettingsRow>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ ...sectionTitleStyle, display: "flex", alignItems: "center", gap: 10 }}>
          <Lock size={16} color="#f97316" /> Security
        </div>
        <div style={{ padding: "0 20px" }}>
          <SettingsRow label="Two-Factor Authentication" description="Manage 2FA in your secure account portal">
            <button type="button" onClick={() => openUserProfile()} style={{ fontSize: 12, color: "#39E609", background: "rgba(57,230,9,0.08)", border: "1px solid rgba(57,230,9,0.2)", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              {prefs.twoFactorEnabled ? "Manage 2FA" : "Set Up 2FA"}
            </button>
          </SettingsRow>
          <SettingsRow label="Active Sessions" description="View and revoke logged-in devices">
            <button type="button" onClick={() => openUserProfile()} style={{ fontSize: 12, color: "#39E609", background: "rgba(57,230,9,0.08)", border: "1px solid rgba(57,230,9,0.2)", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              Manage
            </button>
          </SettingsRow>
          <SettingsRow label="Download My Data" description="Get a JSON copy of all your GymRat Hub data">
            <button type="button" onClick={handleExportViaApi} disabled={exporting} style={{ fontSize: 12, color: "#38bdf8", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              {exporting ? "Exporting…" : "Export"}
            </button>
          </SettingsRow>
        </div>
      </div>
    </div>
  );
}
