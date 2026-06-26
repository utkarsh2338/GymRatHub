"use client";

import { useEffect, useState, useCallback } from "react";
import { Smartphone, Mail } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import { DEFAULT_NOTIFICATIONS, type NotificationPreferences, type UserPreferencesResponse } from "@/lib/settings-types";
import { cardStyle, sectionTitleStyle, SettingsRow, ToggleSwitch } from "./settings-ui";

export default function NotificationsSettings() {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);

  const { data, isLoading } = useQuery<UserPreferencesResponse>({
    queryKey: ["userPreferences"],
    queryFn: () => api("/users/preferences"),
    enabled: isApiReady,
  });

  useEffect(() => {
    if (data?.notifications) setPrefs({ ...DEFAULT_NOTIFICATIONS, ...data.notifications });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (body: Partial<NotificationPreferences>) =>
      api("/users/preferences/notifications", { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      toast.success("Notification preferences saved");
    },
    onError: () => toast.error("Failed to save notifications."),
  });

  const update = useCallback(
    (key: keyof NotificationPreferences, value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        saveMutation.mutate({ [key]: value });
        return next;
      });
    },
    [saveMutation]
  );

  const pushToggles: { key: keyof NotificationPreferences; label: string; description: string }[] = [
    { key: "pushWorkouts", label: "Workout Reminders", description: "Get reminded to complete your scheduled workouts" },
    { key: "pushChallenges", label: "Challenge Updates", description: "Progress notifications for active challenges" },
    { key: "pushCommunity", label: "Community Activity", description: "Likes, comments, and follows on your posts" },
    { key: "pushTrainers", label: "Trainer Messages", description: "Messages and session updates from your trainer" },
  ];

  const emailToggles: { key: keyof NotificationPreferences; label: string; description: string }[] = [
    { key: "emailWeekly", label: "Weekly Progress Report", description: "Summary of your weekly activity and achievements" },
    { key: "emailPRs", label: "New Personal Records", description: "Email when you break a personal record" },
    { key: "emailNewsletter", label: "Newsletter", description: "Fitness tips, workouts, and nutrition advice" },
    { key: "emailOffers", label: "Promotions & Offers", description: "Exclusive deals on premium features" },
  ];

  if (isLoading) return <div style={{ padding: 24, color: "#6b7280" }}>Loading notifications…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={cardStyle}>
        <div style={{ ...sectionTitleStyle, display: "flex", alignItems: "center", gap: 10 }}>
          <Smartphone size={16} color="#39E609" /> Push Notifications
        </div>
        <div style={{ padding: "0 20px" }}>
          {pushToggles.map((t) => (
            <SettingsRow key={t.key} label={t.label} description={t.description}>
              <ToggleSwitch value={prefs[t.key]} onChange={(v) => update(t.key, v)} disabled={saveMutation.isPending} />
            </SettingsRow>
          ))}
        </div>
      </div>
      <div style={cardStyle}>
        <div style={{ ...sectionTitleStyle, display: "flex", alignItems: "center", gap: 10 }}>
          <Mail size={16} color="#38bdf8" /> Email Notifications
        </div>
        <div style={{ padding: "0 20px" }}>
          {emailToggles.map((t) => (
            <SettingsRow key={t.key} label={t.label} description={t.description}>
              <ToggleSwitch value={prefs[t.key]} onChange={(v) => update(t.key, v)} disabled={saveMutation.isPending} />
            </SettingsRow>
          ))}
        </div>
      </div>
    </div>
  );
}
