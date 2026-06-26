"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Calendar, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import type { DashboardWorkoutSchedule } from "@/lib/types";
import { findExerciseIdByName } from "@/lib/exercise-utils";
import TodayWorkoutPlan from "./TodayWorkoutPlan";
import { toast } from "sonner";

const GOAL_LABELS: Record<string, string> = {
  muscle_gain: "Muscle Gain",
  fat_loss: "Fat Loss",
  strength: "Strength",
  endurance: "Endurance",
  beginner: "Beginner",
};

const MUSCLE_COLORS: Record<string, string> = {
  Chest: "#39E609",
  Arms: "#f97316",
  Back: "#38bdf8",
  Legs: "#a855f7",
  Core: "#22d3ee",
  Shoulders: "#ec4899",
  Cardio: "#38bdf8",
  "Full Body": "#a855f7",
};

export default function DashboardWorkoutSection() {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const { data: schedule, isLoading } = useQuery<DashboardWorkoutSchedule>({
    queryKey: ["dashboardWorkoutSchedule"],
    queryFn: () => api("/workouts/dashboard-schedule"),
    enabled: isApiReady,
  });

  const activateMutation = useMutation({
    mutationFn: (templateId: string) =>
      api(`/workout-templates/${templateId}/activate`, { method: "PUT" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardWorkoutSchedule"] });
      queryClient.invalidateQueries({ queryKey: ["todayWorkout"] });
      toast.success("Active plan updated on dashboard");
    },
    onError: () => toast.error("Failed to switch plan"),
  });

  const toggleDay = (dayLabel: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayLabel)) next.delete(dayLabel);
      else next.add(dayLabel);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div
        style={{
          background: "#1c1c1c",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 32,
          textAlign: "center",
          color: "#6b7280",
          fontSize: 14,
        }}
      >
        Loading your workout plan…
      </div>
    );
  }

  if (!schedule?.activeTemplate && schedule?.templates.length === 0) {
    return (
      <div
        style={{
          background: "#1c1c1c",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <Dumbbell className="w-8 h-8 text-[#39E609] mx-auto mb-3" />
        <p style={{ color: "#fff", fontWeight: 600, marginBottom: 8 }}>No workout plan yet</p>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>
          Import a pre-built plan (e.g. Muscle Gain PPL) or create a custom plan in the Planner.
        </p>
        <Link
          href="/planner"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#39E609] hover:underline"
        >
          <Calendar className="w-4 h-4" />
          Go to Planner
        </Link>
      </div>
    );
  }

  const activeId = schedule?.activeTemplate?._id ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "#1c1c1c",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <p style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            Active plan
          </p>
          <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: "4px 0 0" }}>
            {schedule?.activeTemplate?.name ?? "Select a plan"}
          </h2>
          {schedule?.activeTemplate && (
            <p style={{ color: "#39E609", fontSize: 12, margin: "2px 0 0" }}>
              {GOAL_LABELS[schedule.activeTemplate.goalType] ?? schedule.activeTemplate.goalType}
            </p>
          )}
        </div>
        {schedule && schedule.templates.length > 0 && (
          <select
            value={activeId}
            onChange={(e) => {
              if (e.target.value) activateMutation.mutate(e.target.value);
            }}
            disabled={activateMutation.isPending}
            style={{
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              padding: "8px 12px",
              color: "#fff",
              fontSize: 13,
              minWidth: 200,
              cursor: "pointer",
            }}
          >
            {schedule.templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.exerciseCount} exercises)
              </option>
            ))}
          </select>
        )}
      </div>

      <div
        style={{
          background: "#1c1c1c",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #2a2a2a" }}>
          <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0 }}>
            Weekly schedule
          </h3>
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>
            Exercises from your plan for each day — today is highlighted
          </p>
        </div>

        <ul>
          {schedule?.week.map((day) => {
            const expanded = expandedDays.has(day.dayLabel) || day.isToday;
            const color = MUSCLE_COLORS[day.exercises[0]?.category ?? ""] ?? "#6b7280";

            return (
              <li
                key={day.dayLabel}
                style={{
                  borderBottom: "1px solid #1f1f1f",
                  background: day.isToday ? "rgba(57,230,9,0.06)" : "transparent",
                }}
              >
                <button
                  type="button"
                  onClick={() => !day.isToday && toggleDay(day.dayLabel)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    background: "none",
                    border: "none",
                    cursor: day.isRest ? "default" : "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        width: 36,
                        color: day.isToday ? "#39E609" : "#6b7280",
                      }}
                    >
                      {day.dayLabel}
                    </span>
                    <div>
                      <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: 0 }}>
                        {day.name}
                        {day.isToday && (
                          <span style={{ marginLeft: 8, fontSize: 10, color: "#39E609" }}>
                            TODAY
                          </span>
                        )}
                      </p>
                      <p style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>
                        {day.isRest
                          ? "Rest / no exercises"
                          : `${day.exerciseCount} exercise${day.exerciseCount !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  {!day.isRest && !day.isToday && (
                    expanded ? (
                      <ChevronUp size={16} color="#6b7280" />
                    ) : (
                      <ChevronDown size={16} color="#6b7280" />
                    )
                  )}
                </button>

                <AnimatePresence>
                  {expanded && !day.isRest && day.exercises.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <ul style={{ padding: "0 20px 12px 68px", margin: 0, listStyle: "none" }}>
                        {day.exercises.map((ex, i) => {
                          const libId = findExerciseIdByName(ex.name);
                          const catColor = MUSCLE_COLORS[ex.category] ?? color;
                          return (
                            <li
                              key={`${ex.exerciseId}-${i}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "6px 0",
                                fontSize: 12,
                                borderTop: i > 0 ? "1px solid #1a1a1a" : "none",
                              }}
                            >
                              {libId ? (
                                <Link
                                  href={`/workouts/${libId}`}
                                  style={{ color: "#39E609", textDecoration: "none" }}
                                >
                                  {ex.name}
                                </Link>
                              ) : (
                                <span style={{ color: "#e5e7eb" }}>{ex.name}</span>
                              )}
                              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: "#6b7280" }}>
                                  {ex.targetSets} × {ex.targetReps}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    background: `${catColor}18`,
                                    color: catColor,
                                  }}
                                >
                                  {ex.category}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>

      {schedule?.todayWorkout && schedule.todayWorkout.exercises?.length > 0 ? (
        <TodayWorkoutPlan plan={schedule.todayWorkout} />
      ) : schedule?.activeTemplate ? (
        <div
          style={{
            background: "#1c1c1c",
            border: "1px solid #2a2a2a",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          Today is a rest day in {schedule.activeTemplate.name}. Check another day above or edit your
          plan in the Planner.
        </div>
      ) : null}
    </div>
  );
}
