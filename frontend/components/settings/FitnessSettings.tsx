"use client";

import { useEffect, useState } from "react";
import { Dumbbell, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import { DEFAULT_FITNESS, type FitnessPreferences, type UserPreferencesResponse } from "@/lib/settings-types";
import { cardStyle, sectionTitleStyle } from "./settings-ui";

const GOALS = [
  { id: "lose_weight", label: "Lose Weight", emoji: "⚖️" },
  { id: "build_muscle", label: "Build Muscle", emoji: "💪" },
  { id: "improve_endurance", label: "Endurance", emoji: "🏃" },
  { id: "stay_active", label: "Stay Active", emoji: "✨" },
];
const LEVELS = ["beginner", "intermediate", "advanced", "athlete"];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function FitnessSettings() {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState<FitnessPreferences>(DEFAULT_FITNESS);

  const { data, isLoading } = useQuery<UserPreferencesResponse>({
    queryKey: ["userPreferences"],
    queryFn: () => api("/users/preferences"),
    enabled: isApiReady,
  });

  useEffect(() => {
    if (data?.fitness) {
      setPrefs({ ...DEFAULT_FITNESS, ...data.fitness, fitnessGoal: data.fitness.fitnessGoal ?? DEFAULT_FITNESS.fitnessGoal });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api("/users/preferences/fitness", {
        method: "PUT",
        body: JSON.stringify({
          units: prefs.units,
          fitnessLevel: prefs.fitnessLevel,
          weeklyWorkoutTarget: prefs.weeklyWorkoutTarget,
          preferredRestDay: prefs.preferredRestDay,
          fitnessGoal: prefs.fitnessGoal,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Fitness preferences saved!");
    },
    onError: () => toast.error("Failed to save fitness preferences."),
  });

  if (isLoading) return <div style={{ padding: 24, color: "#6b7280" }}>Loading fitness settings…</div>;

  return (
    <div style={cardStyle}>
      <div style={{ ...sectionTitleStyle, display: "flex", alignItems: "center", gap: 10 }}>
        <Dumbbell size={16} color="#f97316" /> Fitness Preferences
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: "#9ca3af", fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Measurement Units</p>
          <div style={{ display: "flex", gap: 10 }}>
            {(["metric", "imperial"] as const).map((u) => (
              <button key={u} type="button" onClick={() => setPrefs((p) => ({ ...p, units: u }))} style={{ padding: "9px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: `1px solid ${prefs.units === u ? "#39E609" : "#2a2a2a"}`, background: prefs.units === u ? "rgba(57,230,9,0.1)" : "#1a1a1a", color: prefs.units === u ? "#39E609" : "#6b7280" }}>
                {u === "metric" ? "Metric (kg, km)" : "Imperial (lbs, mi)"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ color: "#9ca3af", fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Primary Goal</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {GOALS.map((g) => (
              <button key={g.id} type="button" onClick={() => setPrefs((p) => ({ ...p, fitnessGoal: g.id }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: `1px solid ${prefs.fitnessGoal === g.id ? "#39E609" : "#2a2a2a"}`, background: prefs.fitnessGoal === g.id ? "rgba(57,230,9,0.08)" : "#1a1a1a", color: prefs.fitnessGoal === g.id ? "#39E609" : "#9ca3af", cursor: "pointer", fontSize: 14, fontWeight: 500, textAlign: "left" }}>
                <span style={{ fontSize: 20 }}>{g.emoji}</span> {g.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ color: "#9ca3af", fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Fitness Level</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LEVELS.map((l) => (
              <button key={l} type="button" onClick={() => setPrefs((p) => ({ ...p, fitnessLevel: l as FitnessPreferences["fitnessLevel"] }))} style={{ padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${prefs.fitnessLevel === l ? "#39E609" : "#2a2a2a"}`, background: prefs.fitnessLevel === l ? "#39E609" : "#1a1a1a", color: prefs.fitnessLevel === l ? "#000" : "#9ca3af", textTransform: "capitalize" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ color: "#9ca3af", fontSize: 12, fontWeight: 500, marginBottom: 10 }}>
            Weekly Workout Target: <span style={{ color: "#39E609", fontWeight: 700 }}>{prefs.weeklyWorkoutTarget} days</span>
          </p>
          <input type="range" min={1} max={7} value={prefs.weeklyWorkoutTarget} onChange={(e) => setPrefs((p) => ({ ...p, weeklyWorkoutTarget: Number(e.target.value) }))} style={{ width: "100%", maxWidth: 280, accentColor: "#39E609" }} />
        </div>

        <div>
          <p style={{ color: "#9ca3af", fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Preferred Rest Day</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DAYS.map((d) => (
              <button key={d} type="button" onClick={() => setPrefs((p) => ({ ...p, preferredRestDay: d }))} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${prefs.preferredRestDay === d ? "#39E609" : "#2a2a2a"}`, background: prefs.preferredRestDay === d ? "rgba(57,230,9,0.1)" : "#1a1a1a", color: prefs.preferredRestDay === d ? "#39E609" : "#6b7280", textTransform: "capitalize" }}>
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-neon" style={{ padding: "11px 24px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <Save size={16} /> {saveMutation.isPending ? "Saving…" : "Save Preferences"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
