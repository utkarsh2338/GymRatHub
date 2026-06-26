"use client";

import { motion } from "framer-motion";
import { Play, CheckCircle, Circle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WorkoutPlan } from "@/lib/types";
import { findExerciseIdByName } from "@/lib/exercise-utils";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import type { WorkoutSession } from "@/lib/types";

interface Props {
  plan: WorkoutPlan;
}

const MUSCLE_COLORS: Record<string, string> = {
  Chest: "#39E609",
  Arms: "#f97316",
  Back: "#38bdf8",
  Legs: "#a855f7",
  Core: "#22d3ee",
  Shoulders: "#ec4899",
};

export default function TodayWorkoutPlan({ plan }: Props) {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: activeSession } = useQuery<WorkoutSession | null>({
    queryKey: ["activeWorkoutSession"],
    queryFn: () => api("/workout-sessions/active"),
    enabled: isApiReady,
  });

  const startMutation = useMutation({
    mutationFn: () =>
      api("/workout-sessions", {
        method: "POST",
        body: JSON.stringify({ source: "today" }),
      }),
    onSuccess: (session: WorkoutSession) => {
      queryClient.invalidateQueries({ queryKey: ["activeWorkoutSession"] });
      router.push(`/workout/session/${session._id}`);
    },
    onError: async (err: Error) => {
      if (err?.message?.toLowerCase().includes("active")) {
        try {
          const active = await api("/workout-sessions/active");
          if (active?._id) {
            router.push(`/workout/session/${active._id}`);
            return;
          }
        } catch {
          /* fall through */
        }
      }
      toast.error(err?.message || "Could not start workout.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: "done" | "pending" }) =>
      api(`/workouts/today/exercises/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todayWorkout"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardWorkoutSchedule"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: () => toast.error("Failed to update exercise status."),
  });

  const exercises = plan.exercises || [];
  const completedCount = exercises.filter((e) => e.status === "done").length;

  const handleStart = () => {
    if (activeSession?._id) {
      router.push(`/workout/session/${activeSession._id}`);
      return;
    }
    startMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 12, overflow: "hidden" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #2a2a2a", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ fontWeight: 600, color: "#fff", fontSize: 15 }}>Today&apos;s Workout — {plan.name}</h3>
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
            {completedCount}/{exercises.length} exercises · Log sets, weight & reps
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-neon"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 13 }}
          onClick={handleStart}
          disabled={startMutation.isPending}
        >
          {startMutation.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          {activeSession ? "Resume Workout" : "Start Workout"}
        </motion.button>
      </div>

      <div style={{ height: 3, background: "#2a2a2a", width: "100%" }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: exercises.length ? completedCount / exercises.length : 0 }}
          style={{ height: "100%", background: "#39E609", borderRadius: 999, transformOrigin: "left" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
              {["Exercise", "Sets × Reps", "Muscle Group", "Done"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 24px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exercises.map((ex, i) => {
              const muscleColor = MUSCLE_COLORS[ex.category] ?? "#6b7280";
              const isDone = ex.status === "done";
              const libraryId = findExerciseIdByName(ex.name);
              return (
                <motion.tr
                  key={ex.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  style={{ borderBottom: "1px solid #1f1f1f" }}
                >
                  <td style={{ padding: "14px 24px" }}>
                    {libraryId ? (
                      <Link
                        href={`/workouts/${libraryId}`}
                        style={{
                          fontWeight: 500,
                          color: isDone ? "#6b7280" : "#39E609",
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {ex.name}
                      </Link>
                    ) : (
                      <span style={{ fontWeight: 500, color: isDone ? "#6b7280" : "#fff", textDecoration: isDone ? "line-through" : "none" }}>
                        {ex.name}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 24px", color: "#9ca3af" }}>{ex.sets} × {ex.reps}</td>
                  <td style={{ padding: "14px 24px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: `${muscleColor}18`, color: muscleColor }}>
                      {ex.category}
                    </span>
                  </td>
                  <td style={{ padding: "14px 24px" }}>
                    <button
                      type="button"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: ex.id,
                          newStatus: isDone ? "pending" : "done",
                        })
                      }
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                      aria-label={`Toggle ${ex.name}`}
                    >
                      {isDone ? <CheckCircle size={20} color="#39E609" /> : <Circle size={20} color="#4b5563" />}
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
