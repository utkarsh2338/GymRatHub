"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Target, Flame, Clock } from "lucide-react";
import type { PlannerDay, WorkoutBlock } from "@/lib/types";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";
import WorkoutPlansManager from "@/components/workouts/WorkoutPlansManager";

const WORKOUT_TEMPLATES = [
  { name: "Push Day A", type: "Strength", duration: 65, color: "#39E609" },
  { name: "Full Strength", type: "Strength", duration: 75, color: "#38bdf8" },
  { name: "Beginner Program", type: "Beginner", duration: 45, color: "#a855f7" },
  { name: "Sandy HIIT", type: "HIIT", duration: 30, color: "#f97316" },
];

function WorkoutBlockCard({
  block,
  onRemove,
}: {
  block: WorkoutBlock;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#111111",
        borderRadius: 8,
        padding: "8px 10px",
        border: `1px solid ${block.color}40`,
        marginBottom: 6,
        gap: 6,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: block.color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            color: "#ffffff",
            fontSize: 11,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {block.name}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {block.duration > 0 && (
          <span
            style={{
              color: "#6b7280",
              fontSize: 10,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {block.duration}m
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            background: "none",
            border: "none",
            color: "#ef4444",
            fontSize: 10,
            cursor: "pointer",
            padding: "2px 4px",
          }}
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

export default function PlannerPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Fetch Planner Week Schedule
  const { data: weekData, isLoading } = useQuery<PlannerDay[]>({
    queryKey: ["plannerWeek"],
    queryFn: () => api("/planner"),
  });

  const addWorkoutMutation = useMutation({
    mutationFn: ({ dayLabel, workout }: { dayLabel: string; workout: any }) =>
      api(`/planner/${dayLabel}/workouts`, {
        method: "POST",
        body: JSON.stringify(workout),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plannerWeek"] });
      queryClient.invalidateQueries({ queryKey: ["todayWorkout"] });
    },
  });

  const removeWorkoutMutation = useMutation({
    mutationFn: ({ dayLabel, workoutId }: { dayLabel: string; workoutId: string }) =>
      api(`/planner/${dayLabel}/workouts/${workoutId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plannerWeek"] });
      queryClient.invalidateQueries({ queryKey: ["todayWorkout"] });
    },
  });

  const getTodayDayLabel = (): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date().getDay()];
  };

  const handleAddTemplate = (template: any) => {
    const todayLabel = getTodayDayLabel();
    addWorkoutMutation.mutate({
      dayLabel: todayLabel,
      workout: template,
    });
    toast.success(`Scheduled "${template.name}" for Today (${todayLabel})`);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(57,230,9,0.1)", borderTopColor: "#39E609", animation: "planner-spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 14, color: "#6b7280" }}>Loading planner calendar...</span>
        <style>{`@keyframes planner-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const week = weekData || [];
  const totalWorkouts = week.filter((d) =>
    d.workouts.some((w) => w.status !== "rest")
  ).length;
  const totalMinutes = week.reduce(
    (s, d) => s + d.workouts.reduce((ds, w) => ds + w.duration, 0),
    0
  );

  const weekLabel =
    currentWeekOffset === 0
      ? "Current"
      : currentWeekOffset > 0
      ? `+${currentWeekOffset}`
      : `${currentWeekOffset}`;

  return (
    <>
      <style>{`
        .planner-root {
          background: #0a0a0a;
          min-height: 100%;
          padding: 24px;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }
        .planner-calendar-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 8px;
        }
        .planner-calendar-inner {
          display: grid;
          grid-template-columns: repeat(7, minmax(148px, 1fr));
          gap: 10px;
          min-width: 1040px;
        }
        .planner-bottom-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .template-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .template-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 900px) {
          .planner-bottom-row {
            grid-template-columns: 2fr 1fr;
          }
        }
        @media (min-width: 768px) {
          .planner-root {
            padding: 28px 32px;
          }
        }
        .nav-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #1c1c1c;
          border: 1px solid #2a2a2a;
          color: #9ca3af;
          font-size: 12px;
          padding: 7px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .nav-btn:hover {
          border-color: rgba(57,230,9,0.4);
          color: #39E609;
        }
        .add-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #39E609;
          color: #000000;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          border: none;
          white-space: nowrap;
          letter-spacing: 0.01em;
          transition: opacity 0.15s;
        }
        .add-btn:hover { opacity: 0.88; }
        .day-add-btn {
          width: 100%;
          padding: 5px 0;
          border-radius: 6px;
          border: 1px dashed #2a2a2a;
          background: transparent;
          color: #4b5563;
          font-size: 10px;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          margin-top: 4px;
        }
        .day-add-btn:hover {
          border-color: rgba(57,230,9,0.4);
          color: #39E609;
        }
        .template-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: #111111;
          border-radius: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: transform 0.15s, border-color 0.2s;
        }
        .template-card:hover { transform: scale(1.015); }
      `}</style>

      <div className="planner-root">

        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(22px, 3vw, 30px)",
                color: "#ffffff",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Workout Planner
            </h1>
            <p
              style={{
                color: "#6b7280",
                fontSize: 13,
                marginTop: 4,
                marginBottom: 0,
              }}
            >
              Add workout plans to your calendar and track your training schedule
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <button
              className="nav-btn"
              onClick={() => setCurrentWeekOffset((o) => o - 1)}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
              Prev
            </button>

            <button
              style={{
                background: "#1c1c1c",
                border: "1px solid #2a2a2a",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 600,
                padding: "7px 14px",
                borderRadius: 8,
                cursor: "default",
                whiteSpace: "nowrap",
              }}
            >
              Week {weekLabel}
            </button>

            <button
              className="nav-btn"
              onClick={() => setCurrentWeekOffset((o) => o + 1)}
            >
              Next
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="add-btn"
              onClick={() => handleAddTemplate(WORKOUT_TEMPLATES[0])}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Quick Add Today
            </motion.button>
          </div>
        </div>

        <section style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#fff",
              margin: "0 0 12px",
            }}
          >
            Workout plans
          </h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 16px" }}>
            Import pre-built weekly programs or create custom plans, then apply them to your calendar.
          </p>
          <WorkoutPlansManager />
        </section>

        {/* ── Weekly Calendar ── */}
        <div className="planner-calendar-scroll" style={{ marginBottom: 24 }}>
          <div className="planner-calendar-inner">
            {week.map((day, idx) => {
              const activeWorkouts = day.workouts.filter((w) => w.status !== "rest");
              const todayLabel = getTodayDayLabel();
              const isToday = day.dayLabel === todayLabel;

              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  style={{
                    borderRadius: 12,
                    border: isToday
                      ? "1px solid rgba(57,230,9,0.45)"
                      : "1px solid #2a2a2a",
                    background: isToday ? "#0d1f0d" : "#1c1c1c",
                    padding: "14px 12px",
                    minHeight: 160,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    boxSizing: "border-box",
                  }}
                >
                  {/* Day header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isToday ? "#39E609" : "#9ca3af",
                          margin: 0,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {day.dayLabel}
                      </p>
                      <p
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: isToday ? "#ffffff" : "#4b5563",
                          margin: "2px 0 0 0",
                          lineHeight: 1,
                        }}
                      >
                        {new Date(day.date).getDate()}
                      </p>
                    </div>
                    {isToday && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          background: "rgba(57,230,9,0.15)",
                          color: "#39E609",
                          padding: "3px 7px",
                          borderRadius: 5,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        Today
                      </span>
                    )}
                  </div>

                  {/* Workout blocks */}
                  <div style={{ flex: 1 }}>
                    {day.workouts.map((block) => (
                      <WorkoutBlockCard
                        key={block.id}
                        block={block}
                        onRemove={() => {
                          removeWorkoutMutation.mutate({
                            dayLabel: day.dayLabel,
                            workoutId: block.id,
                          });
                        }}
                      />
                    ))}
                  </div>

                  {/* Add to day */}
                  <button
                    className="day-add-btn"
                    onClick={() => {
                      const template = WORKOUT_TEMPLATES[Math.floor(Math.random() * WORKOUT_TEMPLATES.length)];
                      addWorkoutMutation.mutate({
                        dayLabel: day.dayLabel,
                        workout: template,
                      });
                      toast.success(`Added "${template.name}" to ${day.dayLabel}`);
                    }}
                  >
                    + Add
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="planner-bottom-row">

          {/* Workout Templates */}
          <div
            style={{
              background: "#1c1c1c",
              border: "1px solid #2a2a2a",
              borderRadius: 14,
              padding: "20px 20px",
            }}
          >
            <h3
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                fontWeight: 600,
                color: "#ffffff",
                fontSize: 14,
                margin: "0 0 16px 0",
              }}
            >
              Workout Templates
            </h3>
            <div className="template-grid">
              {WORKOUT_TEMPLATES.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  className="template-card"
                  style={{ border: `1px solid ${t.color}30` }}
                  onClick={() => handleAddTemplate(t)}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        color: "#ffffff",
                        fontSize: 13,
                        fontWeight: 600,
                        margin: "0 0 3px 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.name}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: 11, margin: 0 }}>
                      {t.type} · {t.duration}min
                    </p>
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: `${t.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Plus style={{ width: 13, height: 13, color: t.color }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weekly Summary */}
          <div
            style={{
              background: "#1c1c1c",
              border: "1px solid #2a2a2a",
              borderRadius: 14,
              padding: "20px 20px",
            }}
          >
            <h3
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                fontWeight: 600,
                color: "#ffffff",
                fontSize: 14,
                margin: "0 0 16px 0",
              }}
            >
              Weekly Summary
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {
                  icon: Target,
                  label: "Workouts",
                  value: `${totalWorkouts} days`,
                  color: "#39E609",
                },
                {
                  icon: Clock,
                  label: "Total Time",
                  value: `${totalMinutes} min`,
                  color: "#38bdf8",
                },
                {
                  icon: Flame,
                  label: "Est. Calories",
                  value: `${totalWorkouts * 300} kcal`,
                  color: "#f97316",
                },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: `${s.color}18`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          style={{ width: 14, height: 14, color: s.color }}
                        />
                      </div>
                      <span style={{ color: "#9ca3af", fontSize: 13 }}>
                        {s.label}
                      </span>
                    </div>
                    <span
                      style={{
                        color: "#ffffff",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {s.value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress ring */}
            <div
              style={{
                marginTop: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative", width: 100, height: 100 }}>
                <svg
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: "rotate(-90deg)",
                  }}
                  viewBox="0 0 80 80"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="#1f1f1f"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="#39E609"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{
                      strokeDashoffset:
                        2 * Math.PI * 34 * (1 - Math.min(totalWorkouts, 7) / 7),
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(57,230,9,0.5))",
                    }}
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 18,
                      lineHeight: 1,
                    }}
                  >
                    {Math.round((Math.min(totalWorkouts, 7) / 7) * 100)}%
                  </span>
                  <span
                    style={{
                      color: "#6b7280",
                      fontSize: 10,
                      marginTop: 3,
                    }}
                  >
                    weekly goal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
