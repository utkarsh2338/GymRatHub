import WorkoutSessionModel from "../models/WorkoutSession";
import { estimateOneRepMax } from "./workoutProgress";

/**
 * Plateau Detection & Adaptive Coaching Engine
 * ---------------------------------------------
 * This is a deterministic, explainable analytics engine — not a black box.
 * It looks at a lifter's actual logged history per exercise and answers
 * three questions a good human coach would:
 *
 *   1. Is this lift actually stalling, or is that just noise?
 *   2. If it's stalling, what KIND of stall is it (strength plateau vs.
 *      volume plateau vs. inconsistent training)?
 *   3. What's the single most useful adjustment right now?
 *
 * Being deterministic matters for a fitness product: users need to be able
 * to trust *why* a suggestion was made, and it works with zero external
 * API calls or cost, so it scales to any number of users for free. The
 * optional narrative layer (generateCoachingNarrative, in coachingService.ts)
 * turns this structured output into natural language via an LLM — but the
 * detection logic underneath never depends on that call succeeding.
 */

export type PlateauSeverity = "none" | "mild" | "moderate" | "severe";

export type PlateauType =
  | "strength_stall" // top-set estimated 1RM hasn't moved
  | "volume_stall" // total volume for this lift hasn't moved
  | "inconsistent" // too few sessions in the window to trust a trend
  | "regressing"; // numbers are actually going down

export interface PlateauInsight {
  exerciseName: string;
  category: string;
  type: PlateauType;
  severity: PlateauSeverity;
  sessionsAnalyzed: number;
  windowDays: number;
  best1RM: number;
  latest1RM: number;
  percentChange: number;
  recommendation: {
    action: "deload" | "rep_range_shift" | "exercise_swap" | "increase_frequency" | "stay_the_course";
    detail: string;
  };
}

interface ExerciseHistoryPoint {
  date: Date;
  topSetWeightKg: number;
  topSetReps: number;
  estimated1RM: number;
  volumeKg: number;
}

const PLATEAU_WINDOW_DAYS = 42; // ~6 weeks — long enough to filter noise, short enough to stay actionable
const MIN_SESSIONS_FOR_TREND = 3;
const STALL_THRESHOLD_PCT = 2.5; // less than this change over the window counts as "stalled"
const REGRESSION_THRESHOLD_PCT = -3;

/** Pulls per-exercise history from completed sessions within the window. */
interface ExerciseHistoryEntry {
  displayName: string;
  category: string;
  points: ExerciseHistoryPoint[];
}

async function buildExerciseHistory(
  clerkId: string,
  windowDays: number
): Promise<Map<string, ExerciseHistoryEntry>> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const sessions = await WorkoutSessionModel.find({
    clerkId,
    status: "completed",
    completedAt: { $gte: since },
  })
    .sort({ completedAt: 1 })
    .lean();

  const history = new Map<string, ExerciseHistoryEntry>();

  for (const session of sessions) {
    const completedAt = session.completedAt ? new Date(session.completedAt) : new Date();

    for (const ex of session.exercises ?? []) {
      const completedSets = (ex.loggedSets ?? []).filter(
        (s) => s.completed && (s.weightKg ?? 0) > 0 && (s.reps ?? 0) > 0
      );
      if (completedSets.length === 0) continue;

      // "Top set" = heaviest completed set that session, which is what
      // actually drives a strength estimate (not the average set).
      const topSet = completedSets.reduce((best, s) =>
        (s.weightKg ?? 0) > (best.weightKg ?? 0) ? s : best
      );
      const volumeKg = completedSets.reduce(
        (sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0),
        0
      );

      const key = ex.name.trim().toLowerCase();
      if (!history.has(key)) {
        history.set(key, { displayName: ex.name.trim(), category: ex.category, points: [] });
      }
      history.get(key)!.points.push({
        date: completedAt,
        topSetWeightKg: topSet.weightKg ?? 0,
        topSetReps: topSet.reps ?? 0,
        estimated1RM: estimateOneRepMax(topSet.weightKg ?? 0, topSet.reps ?? 0),
        volumeKg,
      });
    }
  }

  return history;
}

export function classifySeverity(percentChange: number, sessionsAnalyzed: number): PlateauSeverity {
  if (sessionsAnalyzed < MIN_SESSIONS_FOR_TREND) return "none";
  if (percentChange <= REGRESSION_THRESHOLD_PCT) return "severe";
  if (percentChange < STALL_THRESHOLD_PCT * 0.4) return "moderate";
  if (percentChange < STALL_THRESHOLD_PCT) return "mild";
  return "none";
}

export function recommendAction(
  type: PlateauType,
  severity: PlateauSeverity,
  exerciseName: string,
  category: string
): PlateauInsight["recommendation"] {
  if (type === "inconsistent") {
    return {
      action: "increase_frequency",
      detail: `Not enough recent sessions to trust a trend on ${exerciseName}. Aim for at least ${MIN_SESSIONS_FOR_TREND} sessions in the next ${PLATEAU_WINDOW_DAYS} days before judging progress.`,
    };
  }

  if (type === "regressing") {
    return {
      action: "deload",
      detail: `${exerciseName} has trended down over your recent sessions — a classic sign of accumulated fatigue. Try a 5–7 day deload at ~60% of your recent top set, then rebuild.`,
    };
  }

  if (severity === "severe" || severity === "moderate") {
    return {
      action: "rep_range_shift",
      detail: `${exerciseName} has stalled at the same working weight for a while. Shift rep range for 2–3 weeks (e.g. drop to 4–6 reps if you've been in 8–12, or vice versa) to force a new adaptation, then retest.`,
    };
  }

  return {
    action: "exercise_swap",
    detail: `${exerciseName} progress has flattened. Swap in a variation targeting the same muscles (${category}) for 2–4 weeks — new stimulus often unsticks a plateau the original lift can't.`,
  };
}

/**
 * Analyzes one user's recent training history and returns a plateau report
 * per exercise, sorted with the most actionable insights first.
 */
export async function detectPlateaus(
  clerkId: string,
  windowDays: number = PLATEAU_WINDOW_DAYS
): Promise<PlateauInsight[]> {
  const history = await buildExerciseHistory(clerkId, windowDays);
  const insights: PlateauInsight[] = [];

  for (const [, { displayName, category, points }] of history) {
    if (points.length === 0) continue;

    const sorted = [...points].sort((a, b) => a.date.getTime() - b.date.getTime());
    const best1RM = Math.max(...sorted.map((p) => p.estimated1RM));
    const latest1RM = sorted[sorted.length - 1].estimated1RM;
    const first1RM = sorted[0].estimated1RM || latest1RM;

    const percentChange = first1RM > 0 ? ((latest1RM - first1RM) / first1RM) * 100 : 0;

    let type: PlateauType;
    if (sorted.length < MIN_SESSIONS_FOR_TREND) {
      type = "inconsistent";
    } else if (percentChange <= REGRESSION_THRESHOLD_PCT) {
      type = "regressing";
    } else if (percentChange < STALL_THRESHOLD_PCT) {
      // Distinguish a pure volume stall (weight/reps flat but sets/frequency
      // rising) from a true strength stall, since the fix differs.
      const firstVolume = sorted[0].volumeKg || 1;
      const latestVolume = sorted[sorted.length - 1].volumeKg;
      type = latestVolume > firstVolume * 1.1 ? "volume_stall" : "strength_stall";
    } else {
      continue; // genuinely progressing — no insight needed
    }

    const severity = classifySeverity(percentChange, sorted.length);
    if (severity === "none" && type !== "inconsistent") continue;

    insights.push({
      exerciseName: displayName,
      category,
      type,
      severity,
      sessionsAnalyzed: sorted.length,
      windowDays,
      best1RM: Math.round(best1RM * 10) / 10,
      latest1RM: Math.round(latest1RM * 10) / 10,
      percentChange: Math.round(percentChange * 10) / 10,
      recommendation: recommendAction(type, severity, displayName, category),
    });
  }

  const severityRank: Record<PlateauSeverity, number> = { severe: 3, moderate: 2, mild: 1, none: 0 };
  return insights.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
}
