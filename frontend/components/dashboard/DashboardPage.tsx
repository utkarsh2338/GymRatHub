"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import KPICard from "./KPICard";
import WeightProgressChart from "./WeightProgressChart";
import WeeklyActivityChart from "./WeeklyActivityChart";
import DashboardWorkoutSection from "./DashboardWorkoutSection";
import {
  buildWeightProgressFromStats,
  getWeightProgressDelta,
  getWeightProgressLabel,
  getGoalProgressPercent,
} from "@/lib/weight-utils";
import {
  buildWeeklyActivityFromPlanner,
  getWeeklyActivityTotal,
  getSparklineTrend,
  buildSparkline,
} from "@/lib/dashboard-utils";
import { useQuery } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import { useEffect, useMemo } from "react";
import type { PlannerDay } from "@/lib/types";

export default function DashboardPage() {
  const today = format(new Date(), "EEEE, MMMM d");
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const api = useApiClient();
  const isApiReady = useIsApiReady();

  const { data: userProfile, isLoading: isUserLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api("/users/profile"),
    enabled: isApiReady,
  });

  const { data: todayNutrition, isLoading: isNutritionLoading } = useQuery({
    queryKey: ["nutrition", todayDate],
    queryFn: () => api(`/nutrition?date=${todayDate}`),
    enabled: isApiReady,
  });

  const { data: plannerDays = [], isLoading: isPlannerLoading } = useQuery<PlannerDay[]>({
    queryKey: ["planner"],
    queryFn: () => api("/planner"),
    enabled: isApiReady,
  });

  useEffect(() => {
    const signupGoal = localStorage.getItem("gymrat_signup_goal");
    if (signupGoal && userProfile && !userProfile.targetConfigured) {
      localStorage.removeItem("gymrat_signup_goal");
      const goalWeights =
        {
          lose_weight: { currentWeight: 85, targetWeight: 75 },
          build_muscle: { currentWeight: 70, targetWeight: 78 },
          improve_endurance: { currentWeight: 80, targetWeight: 72 },
        }[signupGoal as "lose_weight" | "build_muscle" | "improve_endurance"] ?? {
          currentWeight: 75,
          targetWeight: 70,
        };

      api("/users/profile/target", {
        method: "PUT",
        body: JSON.stringify({ ...goalWeights, fitnessGoal: signupGoal }),
      })
        .then(() => refetchProfile())
        .catch(console.error);
    }
  }, [userProfile, api, refetchProfile]);

  const stats = userProfile?.stats ?? {
    workoutsCompleted: 0,
    streak: 0,
    caloriesBurned: 0,
    waterIntake: 0,
    weight: 0,
    weightGoal: 0,
  };

  const waterToday = todayNutrition?.water?.consumed ?? stats.waterIntake;
  const waterGoal = todayNutrition?.water?.goal ?? 3.5;

  const progressInput = useMemo(
    () => ({
      weight: stats.weight,
      weightGoal: stats.weightGoal,
      startingWeight: userProfile?.startingWeight,
      fitnessGoal: userProfile?.fitnessGoal,
    }),
    [stats.weight, stats.weightGoal, userProfile?.startingWeight, userProfile?.fitnessGoal]
  );

  const weightChartData = useMemo(
    () => buildWeightProgressFromStats(progressInput),
    [progressInput]
  );

  const weightDelta = useMemo(() => getWeightProgressDelta(progressInput), [progressInput]);
  const weightLabel = useMemo(
    () =>
      getWeightProgressLabel(
        userProfile?.fitnessGoal,
        stats.weightGoal,
        userProfile?.startingWeight
      ),
    [userProfile?.fitnessGoal, stats.weightGoal, userProfile?.startingWeight]
  );

  const goalPercent = useMemo(() => getGoalProgressPercent(progressInput), [progressInput]);

  const weightBadge = useMemo(() => {
    if (!userProfile?.targetConfigured) return "Set target";
    const sign = weightLabel === "Weight Gained" ? "+" : "−";
    return `${sign}${weightDelta} kg`;
  }, [userProfile?.targetConfigured, weightLabel, weightDelta]);

  const weightSubtitle = useMemo(() => {
    if (!userProfile?.targetConfigured) return "Configure your goal on Progress";
    return `Goal ${stats.weightGoal} kg · ${goalPercent}% complete`;
  }, [userProfile?.targetConfigured, stats.weightGoal, goalPercent]);

  const weeklyActivity = useMemo(() => {
    if (!userProfile?.targetConfigured) {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
        day,
        minutes: 0,
      }));
    }
    return buildWeeklyActivityFromPlanner(plannerDays);
  }, [plannerDays, userProfile?.targetConfigured]);

  const weeklyActivityTotal = useMemo(
    () => getWeeklyActivityTotal(weeklyActivity),
    [weeklyActivity]
  );

  const kpiCards = useMemo(() => {
    const caloriesChart = buildSparkline(stats.caloriesBurned);
    const streakChart = buildSparkline(stats.streak, 7).map((v) => Math.round(v));
    const workoutsChart = buildSparkline(stats.workoutsCompleted, 7).map((v) => Math.round(v));
    const waterChart = buildSparkline(waterToday);

    const caloriesTrend = getSparklineTrend(caloriesChart);
    const streakTrend = getSparklineTrend(streakChart);
    const workoutsTrend = getSparklineTrend(workoutsChart);
    const waterTrend = getSparklineTrend(waterChart);

    return [
      {
        label: "Calories Burned",
        value: stats.caloriesBurned,
        unit: "kcal",
        icon: "flame",
        color: "orange" as const,
        trend: caloriesTrend.trend,
        trendPercent: caloriesTrend.percent,
        chart: caloriesChart,
      },
      {
        label: "Workout Streak",
        value: stats.streak,
        unit: "Days",
        icon: "zap",
        color: "green" as const,
        trend: streakTrend.trend,
        trendPercent: streakTrend.percent,
        chart: streakChart,
      },
      {
        label: "Workouts Completed",
        value: stats.workoutsCompleted,
        unit: "",
        icon: "dumbbell",
        color: "blue" as const,
        trend: workoutsTrend.trend,
        trendPercent: workoutsTrend.percent,
        chart: workoutsChart,
      },
      {
        label: `Water Intake (${waterGoal}L goal)`,
        value: waterToday,
        unit: "L",
        icon: "droplets",
        color: "blue" as const,
        trend: waterTrend.trend,
        trendPercent: waterTrend.percent,
        chart: waterChart,
      },
    ];
  }, [stats, waterToday, waterGoal]);

  const isLoading =
    !isApiReady || isUserLoading || isNutritionLoading || isPlannerLoading;

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid rgba(57,230,9,0.1)",
            borderTopColor: "#39E609",
            animation: "dashboard-spin 0.8s linear infinite",
          }}
        />
        <span style={{ fontSize: 14, color: "#6b7280" }}>Loading dashboard...</span>
        <style>{`@keyframes dashboard-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 24 }}
      className="dashboard-content"
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(22px, 3vw, 30px)",
              color: "#fff",
            }}
          >
            Welcome back, {userProfile?.name?.split(" ")[0] || "Athlete"} 👋
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
            {today}. Let&apos;s crush today&apos;s goals.
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#1c1c1c",
            border: "1px solid #2a2a2a",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            padding: "8px 16px",
            borderRadius: 999,
            cursor: "pointer",
          }}
        >
          🤖 Ask CyroBot AI →
        </motion.button>
      </div>

      <div className="kpi-grid">
        {kpiCards.map((card, i) => (
          <KPICard key={card.label} card={card} index={i} />
        ))}
      </div>

      <div className="charts-grid">
        <WeightProgressChart
          data={weightChartData}
          badge={weightBadge}
          subtitle={weightSubtitle}
        />
        <WeeklyActivityChart data={weeklyActivity} weeklyTotal={weeklyActivityTotal} />
      </div>

      <DashboardWorkoutSection />

      <style>{`
        .dashboard-content { padding: 24px; }
        @media (min-width: 1024px) { .dashboard-content { padding: 32px; } }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 1280px) {
          .kpi-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 1024px) {
          .charts-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
