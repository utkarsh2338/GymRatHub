"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Scale, Trophy, Flame, Dumbbell, Activity, Target, Lightbulb, Camera } from "lucide-react";
import type { ProgressAnalytics, PersonalRecord } from "@/lib/types";
import Link from "next/link";
import {
  buildWeightProgressFromStats,
  getWeightProgressDelta,
  getWeightProgressLabel,
  getGoalProgressPercent,
} from "@/lib/weight-utils";
import { toast } from "sonner";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import ProgressTargetSetup from "@/components/progress/ProgressTargetSetup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import { useMemo } from "react";
import type { FitnessGoal } from "@/lib/types";

// ─── Strength data ──────────────────────────────────────────────────────────
const STRENGTH_DATA = [
  { week: "W1", bench: 80, squat: 100, deadlift: 120 },
  { week: "W2", bench: 85, squat: 110, deadlift: 130 },
  { week: "W3", bench: 90, squat: 115, deadlift: 145 },
  { week: "W4", bench: 95, squat: 125, deadlift: 155 },
  { week: "W5", bench: 100, squat: 135, deadlift: 165 },
  { week: "W6", bench: 110, squat: 145, deadlift: 180 },
  { week: "W7", bench: 115, squat: 150, deadlift: 190 },
  { week: "W8", bench: 120, squat: 160, deadlift: 200 },
];

// ─── Theme tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#0a0a0a",
  card: "#1c1c1c",
  border: "#2a2a2a",
  green: "#39E609",
  blue: "#38bdf8",
  orange: "#f97316",
  purple: "#a855f7",
  textPrimary: "#ffffff",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
  chartGrid: "#222222",
  tooltipBg: "#1c1c1c",
};

// ─── Tooltip styles ──────────────────────────────────────────────────────────
const tooltipStyle = {
  background: T.tooltipBg,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  color: T.textPrimary,
  fontSize: 12,
  padding: "8px 12px",
};

// ─── PRCard ──────────────────────────────────────────────────────────────────
function PRCard({ pr, index }: { pr: PersonalRecord; index: number }) {
  const [celebrating, setCelebrating] = useState(false);

  const exerciseIcons: Record<string, React.ComponentType<any>> = {
    "Barbell Bench Press": Dumbbell,
    "Back Squat": Activity,
    Deadlift: Flame,
    "Overhead Press": Trophy,
  };
  const IconComponent = exerciseIcons[pr.exercise] ?? Target;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", bounce: 0.3 }}
      style={{
        position: "relative",
        background: pr.isNew
          ? "linear-gradient(135deg, #0f200f 0%, #141a0f 100%)"
          : T.card,
        border: `1px solid ${pr.isNew ? T.green + "55" : T.border}`,
        borderRadius: 16,
        padding: "20px 20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        overflow: "hidden",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
      whileHover={{ scale: 1.02 }}
    >
      {/* NEW PR badge */}
      {pr.isNew && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "absolute",
            top: -1,
            right: 16,
            background: T.green,
            color: "#000",
            fontSize: 10,
            fontWeight: 900,
            padding: "3px 10px",
            borderRadius: "0 0 10px 10px",
            letterSpacing: "0.06em",
          }}
        >
          🔥 NEW PR!
        </motion.div>
      )}

      {/* Decorative accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 3,
          background: pr.isNew
            ? `linear-gradient(90deg, ${T.green}, transparent)`
            : `linear-gradient(90deg, ${T.orange}88, transparent)`,
          borderRadius: "16px 16px 0 0",
        }}
      />

      {/* Top row: emoji + name / date */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: pr.isNew ? T.green + "22" : T.orange + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconComponent size={20} color={pr.isNew ? T.green : T.orange} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: T.textPrimary,
              fontWeight: 700,
              fontSize: 14,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {pr.exercise}
          </p>
          <p style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>
            {pr.date} · {pr.reps} rep{pr.reps > 1 ? "s" : ""}
          </p>
        </div>

        {/* Weight */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 900,
              fontSize: 28,
              lineHeight: 1,
              color: pr.isNew ? T.green : T.orange,
            }}
          >
            {pr.weight}
          </span>
          <span
            style={{
              color: T.textSecondary,
              fontSize: 13,
              fontWeight: 600,
              marginLeft: 3,
            }}
          >
            {pr.unit}
          </span>
        </div>
      </div>

      {/* Celebrate button row */}
      <div style={{ position: "relative" }}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            setCelebrating(true);
            toast.success(`🎉 Celebrating ${pr.exercise} PR!`);
            setTimeout(() => setCelebrating(false), 1500);
          }}
          style={{
            background: "none",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "5px 14px",
            color: T.textMuted,
            fontSize: 12,
            cursor: "pointer",
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = T.green;
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              T.green + "66";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = T.textMuted;
            (e.currentTarget as HTMLButtonElement).style.borderColor = T.border;
          }}
        >
          🎊 Celebrate
        </motion.button>

        <AnimatePresence>
          {celebrating && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ y: -36, opacity: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                left: 80,
                top: -2,
                color: T.green,
                fontWeight: 800,
                fontSize: 14,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              +XP 🎉
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: true });
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"weight" | "strength" | "prs">(
    "weight"
  );

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api("/users/profile"),
    enabled: isApiReady,
  });

  const { data: analytics } = useQuery<ProgressAnalytics>({
    queryKey: ["progressAnalytics"],
    queryFn: () => api("/progress/analytics"),
    enabled: isApiReady && Boolean(userProfile?.targetConfigured),
  });

  const displayPRs: PersonalRecord[] = useMemo(() => {
    const records = analytics?.personalRecords ?? [];
    const seen = new Map<string, (typeof records)[0]>();
    const typePriority: Record<string, number> = {
      max_weight: 2,
      max_volume: 1,
      max_reps: 0,
    };

    for (const p of records) {
      if (!p.exercise || p.exercise === "_session_") continue;
      const key = p.exercise.toLowerCase();
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, p);
        continue;
      }
      const pPri = typePriority[p.recordType ?? ""] ?? 0;
      const ePri = typePriority[existing.recordType ?? ""] ?? 0;
      if (pPri > ePri || (pPri === ePri && (p.weight ?? 0) > (existing.weight ?? 0))) {
        seen.set(key, p);
      }
    }

    return Array.from(seen.values())
      .slice(0, 12)
      .map((p, i) => ({
        exercise: p.exercise,
        weight: p.weight ?? 0,
        unit: "kg" as const,
        reps: p.reps ?? 0,
        date: p.date ? new Date(p.date).toLocaleDateString() : "—",
        isNew: i < 2,
        recordType: p.recordType,
        volume: p.volume,
      }));
  }, [analytics]);

  const { benchPR, squatPR, deadliftPR } = useMemo(() => {
    const bench = displayPRs.find((p) => p.exercise.toLowerCase().includes("bench"))?.weight ?? 0;
    const squat = displayPRs.find((p) => p.exercise.toLowerCase().includes("squat"))?.weight ?? 0;
    const deadlift = displayPRs.find((p) => p.exercise.toLowerCase().includes("deadlift"))?.weight ?? 0;
    return { benchPR: bench, squatPR: squat, deadliftPR: deadlift };
  }, [displayPRs]);

  const volumeChartData = useMemo(
    () => analytics?.volumeByWeek ?? [],
    [analytics]
  );

  const hasLoggedVolume = volumeChartData.some((d) => d.volume > 0);
  const strengthChartData: Array<Record<string, string | number>> = hasLoggedVolume
    ? volumeChartData.map((d) => ({ week: d.week, volume: d.volume }))
    : [];

  const targetMutation = useMutation({
    mutationFn: (body: {
      currentWeight: number;
      targetWeight: number;
      fitnessGoal: FitnessGoal;
    }) =>
      api("/users/profile/target", {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Target saved! Your progress is now personalized.");
    },
    onError: () => toast.error("Could not save your target. Try again."),
  });

  const stats = userProfile?.stats ?? {
    workoutsCompleted: 0,
    streak: 0,
    weight: 0,
    weightGoal: 0,
  };

  const progressInput = useMemo(
    () => ({
      weight: stats.weight,
      weightGoal: stats.weightGoal,
      startingWeight: userProfile?.startingWeight,
      fitnessGoal: userProfile?.fitnessGoal,
    }),
    [stats.weight, stats.weightGoal, userProfile?.startingWeight, userProfile?.fitnessGoal]
  );

  const weightChartData = useMemo(() => {
    if (!userProfile) return [];
    const start = userProfile.startingWeight ?? stats.weight;
    const current = stats.weight;

    const workouts = [...(analytics?.consistency ?? [])]
      .filter((w) => w.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (workouts.length === 0) {
      return [];
    }

    return workouts.map((w, index) => {
      const t = workouts.length > 1 ? index / (workouts.length - 1) : 1;
      const weight = Math.round((start + (current - start) * t) * 10) / 10;
      const dateObj = new Date(w.date);
      const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
      return { week: label, weight };
    });
  }, [analytics?.consistency, userProfile, stats.weight]);

  const weightDelta = useMemo(
    () => getWeightProgressDelta(progressInput),
    [progressInput]
  );

  const weightLabel = useMemo(
    () =>
      getWeightProgressLabel(
        userProfile?.fitnessGoal,
        stats.weightGoal,
        userProfile?.startingWeight
      ),
    [userProfile?.fitnessGoal, stats.weightGoal, userProfile?.startingWeight]
  );

  const goalPercent = useMemo(
    () => getGoalProgressPercent(progressInput),
    [progressInput]
  );

  const kpiCards = useMemo(
    () => [
      {
        label: "Workouts Completed",
        value: stats.workoutsCompleted,
        icon: TrendingUp,
        color: T.green,
        unit: "",
        bg: T.green + "18",
      },
      {
        label: "Weekly Volume",
        value: Math.round(analytics?.weeklyVolume ?? 0),
        icon: TrendingUp,
        color: T.purple,
        unit: "kg",
        bg: T.purple + "18",
      },
      {
        label: "Level",
        value: analytics?.level ?? 1,
        icon: Trophy,
        color: T.orange,
        unit: "",
        bg: T.orange + "18",
      },
      {
        label: weightLabel,
        value: weightDelta,
        unit: "kg",
        icon: Scale,
        color: T.blue,
        bg: T.blue + "18",
      },
      {
        label: "Goal Progress",
        value: goalPercent,
        unit: "%",
        icon: Trophy,
        color: T.orange,
        bg: T.orange + "18",
      },
      {
        label: "Streak",
        value: stats.streak,
        unit: "days",
        icon: Flame,
        color: T.purple,
        bg: T.purple + "18",
      },
    ],
    [
      stats.workoutsCompleted,
      stats.streak,
      weightLabel,
      weightDelta,
      goalPercent,
      analytics?.weeklyVolume,
      analytics?.level,
    ]
  );

  const needsTarget = isApiReady && !isLoading && userProfile && !userProfile.targetConfigured;

  const tabs: { key: "weight" | "strength" | "prs"; label: string }[] = [
    { key: "weight", label: "Weight" },
    { key: "strength", label: "Strength" },
    { key: "prs", label: "Personal Records" },
  ];

  return (
    <>
      {/* Responsive grid styles */}
      <style>{`
        .progress-kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (min-width: 768px) {
          .progress-kpi-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .progress-pr-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 560px) {
          .progress-pr-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .progress-tab-scroll {
          overflow-x: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .progress-tab-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        style={{
          minHeight: "100%",
          background: T.bg,
          padding: "28px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          boxSizing: "border-box",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", width: "100%" }}>
          <div>
            <h1
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(22px, 4vw, 30px)",
                color: T.textPrimary,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Progress Tracking
            </h1>
            <p
              style={{
                color: T.textMuted,
                fontSize: 14,
                marginTop: 4,
                marginBottom: 0,
              }}
            >
              {userProfile?.targetConfigured
                ? `Tracking toward ${stats.weightGoal} kg · ${goalPercent}% complete`
                : "Set your target to unlock personalized progress"}
            </p>
          </div>
          <Link
            href="/progress/photos"
            style={{
              background: T.green + "18",
              border: `1px solid ${T.green}40`,
              color: T.green,
              fontSize: 12,
              fontWeight: "bold",
              padding: "8px 16px",
              borderRadius: 8,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s",
            }}
          >
            <Camera className="w-4 h-4" /> Progress Photos
          </Link>
        </div>

        {needsTarget && (
          <ProgressTargetSetup
            isSaving={targetMutation.isPending}
            onSave={async (data) => {
              await targetMutation.mutateAsync(data);
            }}
          />
        )}

        {isLoading && isApiReady && (
          <div style={{ textAlign: "center", color: T.textMuted, padding: 40 }}>
            Loading your progress…
          </div>
        )}

        {!needsTarget && !isLoading && (
          <>
        {/* ── KPI Cards ── */}
        <div className="progress-kpi-grid">
          {kpiCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                style={{
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* accent bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${s.color}, transparent)`,
                    borderRadius: "16px 16px 0 0",
                  }}
                />
                {/* Icon + label */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: s.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} color={s.color} />
                  </div>
                  <span
                    style={{
                      color: T.textMuted,
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {/* Value */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 4,
                    lineHeight: 1,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 900,
                      fontSize: 36,
                      color: s.color,
                      lineHeight: 1,
                    }}
                  >
                    <AnimatedCounter value={s.value} />
                  </span>
                  {s.unit && (
                    <span
                      style={{
                        color: T.textSecondary,
                        fontSize: 14,
                        fontWeight: 600,
                        paddingBottom: 4,
                      }}
                    >
                      {s.unit}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Tabs ── */}
        <div className="progress-tab-scroll">
          <div
            style={{
              display: "inline-flex",
              gap: 4,
              background: "#111111",
              padding: 5,
              borderRadius: 14,
              border: `1px solid ${T.border}`,
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    transition:
                      "background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
                    background: isActive ? T.green : "transparent",
                    color: isActive ? "#000" : T.textMuted,
                    boxShadow: isActive
                      ? `0 2px 12px ${T.green}44`
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        T.textPrimary;
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#1c1c1c";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        T.textMuted;
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                    }
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div ref={chartRef} style={{ minWidth: 0 }}>
          {/* Weight Tab */}
          {activeTab === "weight" && (
            <motion.div
              key="weight"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 18,
                padding: "24px 24px 20px",
                minWidth: 0,
              }}
            >
              {/* Chart header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 700,
                      fontSize: 17,
                      color: T.textPrimary,
                      margin: 0,
                    }}
                  >
                    Weight Progress
                  </h3>
                  <p
                    style={{
                      color: T.textMuted,
                      fontSize: 13,
                      marginTop: 4,
                      marginBottom: 0,
                    }}
                  >
                    Last 8 weeks · Goal {stats.weightGoal} kg · Current {stats.weight} kg
                  </p>
                </div>
                <span
                  style={{
                    background: T.green + "1a",
                    color: T.green,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: `1px solid ${T.green}33`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {weightLabel === "Weight Gained" ? "+" : "−"}
                  {weightDelta} kg toward goal
                </span>
              </div>

              {/* Chart */}
              <div style={{ width: "100%", height: 280 }}>
                {weightChartData.length === 0 ? (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px dashed ${T.border}`,
                      borderRadius: 12,
                      gap: 8,
                    }}
                  >
                    <Scale size={28} color={T.textMuted} />
                    <p style={{ color: T.textMuted, fontSize: 13, margin: 0 }}>
                      Log workouts to start tracking your weight progress.
                    </p>
                  </div>
                ) : (
                  inView && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={weightChartData}
                        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="weightGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={T.green}
                              stopOpacity={0.28}
                            />
                            <stop
                              offset="95%"
                              stopColor={T.green}
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={T.chartGrid}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="week"
                          tick={{ fill: T.textMuted, fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: T.textMuted, fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          domain={["dataMin - 2", "dataMax + 2"]}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          itemStyle={{ color: T.green }}
                          labelStyle={{ color: T.textSecondary, marginBottom: 4 }}
                          formatter={(v) => [`${v} kg`, "Weight"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke={T.green}
                          strokeWidth={2.5}
                          fill="url(#weightGrad)"
                          animationDuration={1400}
                          dot={{
                            fill: T.green,
                            r: 4,
                            strokeWidth: 0,
                          }}
                          activeDot={{
                            r: 6,
                            fill: T.green,
                            stroke: "#0a0a0a",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )
                )}
              </div>

              {/* Summary row */}
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  marginTop: 18,
                  paddingTop: 16,
                  borderTop: `1px solid ${T.border}`,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "Current", value: `${stats.weight || 0} kg`, color: T.green },
                  { label: "Goal", value: `${stats.weightGoal || 0} kg`, color: T.blue },
                  { label: "Remaining", value: `${Math.max(0, Math.round(Math.abs((stats.weight || 0) - (stats.weightGoal || 0)) * 10) / 10)} kg`, color: T.orange },
                ].map((s) => (
                  <div key={s.label}>
                    <p
                      style={{
                        color: T.textMuted,
                        fontSize: 11,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 3,
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 800,
                        fontSize: 18,
                        color: s.color,
                        margin: 0,
                      }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Strength Tab */}
          {activeTab === "strength" && (
            <motion.div
              key="strength"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 18,
                padding: "24px 24px 20px",
                minWidth: 0,
              }}
            >
              {/* Chart header */}
              <div style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    color: T.textPrimary,
                    margin: 0,
                  }}
                >
                  {hasLoggedVolume ? "Training Volume" : "Strength Progress"}
                </h3>
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: 13,
                    marginTop: 4,
                    marginBottom: 0,
                  }}
                >
                  {hasLoggedVolume
                    ? "Weekly volume (kg) = weight × reps × sets"
                    : "Complete logged workouts to see your volume trends"}
                </p>
              </div>

              {/* Legend */}
              {hasLoggedVolume && (
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {[{ label: "Volume", color: T.green }].map(({ label, color }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 3,
                          borderRadius: 2,
                          background: color,
                        }}
                      />
                      <span
                        style={{
                          color: T.textSecondary,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Chart */}
              <div style={{ width: "100%", height: 280 }}>
                {!hasLoggedVolume ? (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px dashed ${T.border}`,
                      borderRadius: 12,
                      gap: 8,
                    }}
                  >
                    <TrendingUp size={28} color={T.textMuted} />
                    <p style={{ color: T.textMuted, fontSize: 13, margin: 0 }}>
                      Complete logged workouts to see your strength volume trends.
                    </p>
                  </div>
                ) : (
                  inView && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={strengthChartData}
                        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                      >
                        <defs>
                          {[{ key: "volume", color: T.green }].map(({ key, color }) => (
                            <linearGradient
                              key={key}
                              id={`grad-${key}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={color}
                                stopOpacity={0.2}
                              />
                              <stop
                                offset="95%"
                                stopColor={color}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={T.chartGrid}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="week"
                          tick={{ fill: T.textMuted, fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: T.textMuted, fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          labelStyle={{ color: T.textSecondary, marginBottom: 4 }}
                          formatter={(v, name) => [
                            `${v} kg`,
                            String(name).charAt(0).toUpperCase() +
                              String(name).slice(1),
                          ]}
                        />
                        {[{ key: "volume", color: T.green }].map(({ key, color }) => (
                          <Area
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#grad-${key})`}
                            animationDuration={1400}
                            dot={false}
                            activeDot={{
                              r: 5,
                              fill: color,
                              stroke: "#0a0a0a",
                              strokeWidth: 2,
                            }}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  )
                )}
              </div>

              {/* Latest lifts row */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 18,
                  paddingTop: 16,
                  borderTop: `1px solid ${T.border}`,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "Bench", value: benchPR > 0 ? `${benchPR} kg` : "— kg", color: T.green },
                  { label: "Squat", value: squatPR > 0 ? `${squatPR} kg` : "— kg", color: T.blue },
                  { label: "Deadlift", value: deadliftPR > 0 ? `${deadliftPR} kg` : "— kg", color: T.orange },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      minWidth: 80,
                      background: "#111",
                      border: `1px solid ${T.border}`,
                      borderRadius: 12,
                      padding: "10px 14px",
                    }}
                  >
                    <p
                      style={{
                        color: T.textMuted,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 4,
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 800,
                        fontSize: 20,
                        color: s.color,
                        margin: 0,
                      }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PRs Tab */}
          {activeTab === "prs" && (
            <motion.div
              key="prs"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* PRs header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 700,
                      fontSize: 17,
                      color: T.textPrimary,
                      margin: 0,
                    }}
                  >
                    Personal Records
                  </h3>
                  <p
                    style={{
                      color: T.textMuted,
                      fontSize: 13,
                      marginTop: 4,
                      marginBottom: 0,
                    }}
                  >
                    {displayPRs.length} records tracked ·{" "}
                    {displayPRs.filter((p) => p.isNew).length} recent PRs
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: T.orange + "18",
                    border: `1px solid ${T.orange}33`,
                    borderRadius: 10,
                    padding: "6px 14px",
                  }}
                >
                  <Trophy size={14} color={T.orange} />
                  <span
                    style={{
                      color: T.orange,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {displayPRs.length} PRs
                  </span>
                </div>
              </div>

              <div className="progress-pr-grid">
                {displayPRs.length === 0 ? (
                  <p style={{ color: T.textMuted, fontSize: 14, padding: 24 }}>
                    Log workouts with weight and reps to earn personal records.
                  </p>
                ) : (
                  displayPRs.map((pr, i) => (
                    <PRCard key={`${pr.exercise}-${i}`} pr={pr} index={i} />
                  ))
                )}
              </div>

              {/* Footer tip */}
              <div
                style={{
                  marginTop: 20,
                  background: "#111",
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Lightbulb size={18} color={T.orange} style={{ flexShrink: 0 }} />
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: 13,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  PRs are automatically recorded when you log a new max weight
                  for any exercise. Keep pushing!
                </p>
              </div>
            </motion.div>
          )}
        </div>
          </>
        )}
      </div>
    </>
  );
}
