"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import { useClerk, useAuth } from "@/lib/auth-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import { DEFAULT_PRIVACY, type PrivacyPreferences, type UserPreferencesResponse } from "@/lib/settings-types";
import { cardStyle, sectionTitleStyle, SettingsRow, ToggleSwitch } from "./settings-ui";

export default function PrivacySettings() {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();
  const { openUserProfile } = useClerk();
  const { getToken } = useAuth();
  const [prefs, setPrefs] = useState<PrivacyPreferences>(DEFAULT_PRIVACY);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useQuery<UserPreferencesResponse>({
    queryKey: ["userPreferences"],
    queryFn: () => api("/users/preferences"),
    enabled: isApiReady,
  });

  const saveMutation = useMutation({
    mutationFn: (body: Partial<PrivacyPreferences>) =>
      api("/users/preferences/privacy", {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      toast.success("Privacy preferences updated!");
    },
    onError: () => toast.error("Could not update privacy preferences."),
  });

  useEffect(() => {
    if (data?.privacy) {
      setPrefs(data.privacy);
    }
  }, [data]);

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

  const handleExportFile = async (format: "csv" | "pdf" | "json") => {
    setExporting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = await getToken();
      
      const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/users/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "pdf"
        ? `gymrathub-report-${Date.now()}.pdf`
        : format === "csv"
        ? `gymrathub-history-${Date.now()}.csv`
        : `gymrathub-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} export downloaded!`);
    } catch {
      toast.error(`Could not export ${format.toUpperCase()} data.`);
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
          <SettingsRow label="Download My Data" description="Get a copy of your GymRat Hub history and metrics">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleExportFile("pdf")}
                disabled={exporting}
                style={{
                  fontSize: 12,
                  color: "#39E609",
                  background: "rgba(57,230,9,0.08)",
                  border: "1px solid rgba(57,230,9,0.2)",
                  padding: "6px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                PDF Report
              </button>
              <button
                type="button"
                onClick={() => handleExportFile("csv")}
                disabled={exporting}
                style={{
                  fontSize: 12,
                  color: "#38bdf8",
                  background: "rgba(56,189,248,0.08)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  padding: "6px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                CSV History
              </button>
              <button
                type="button"
                onClick={() => handleExportFile("json")}
                disabled={exporting}
                style={{
                  fontSize: 12,
                  color: "#a855f7",
                  background: "rgba(168,85,247,0.08)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  padding: "6px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                JSON Export
              </button>
            </div>
          </SettingsRow>
        </div>
      </div>
    </div>
  );
}
