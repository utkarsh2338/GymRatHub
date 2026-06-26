import type { ActivityEntry, PlannerDay } from "@/lib/types";

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Sum planned workout minutes per weekday from the user's planner. */
export function buildWeeklyActivityFromPlanner(days: PlannerDay[]): ActivityEntry[] {
  return DAY_ORDER.map((dayLabel) => {
    const day = days.find((d) => d.dayLabel === dayLabel);
    const minutes =
      day?.workouts
        .filter((w) => w.status !== "rest")
        .reduce((sum, w) => sum + (w.duration || 0), 0) ?? 0;
    return { day: dayLabel, minutes };
  });
}

export function getWeeklyActivityTotal(data: ActivityEntry[]): number {
  return data.reduce((sum, d) => sum + d.minutes, 0);
}

/** Trend from first → last sparkline point. */
export function getSparklineTrend(chart: number[]): {
  trend: "up" | "down";
  percent: number;
} {
  if (chart.length < 2) return { trend: "up", percent: 0 };
  const first = chart[0];
  const last = chart[chart.length - 1];
  if (first === 0) return { trend: last >= 0 ? "up" : "down", percent: 0 };
  const change = ((last - first) / first) * 100;
  return {
    trend: change >= 0 ? "up" : "down",
    percent: Math.round(Math.abs(change) * 10) / 10,
  };
}

/** Build a simple 7-point sparkline ending at `current`. */
export function buildSparkline(current: number, steps = 7): number[] {
  const safe = Math.max(0, current);
  if (safe === 0) return Array(steps).fill(0);
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const start = Math.max(0, safe * 0.65);
    return Math.round((start + (safe - start) * t) * 10) / 10;
  });
}
