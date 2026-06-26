import type { WeightEntry, UserStats, FitnessGoal } from "@/lib/types";

export interface WeightProgressInput {
  weight: number;
  weightGoal: number;
  startingWeight?: number | null;
  fitnessGoal?: FitnessGoal;
}

/** Build an 8-week weight trend from start → current weight. */
export function buildWeightProgressFromStats(input: WeightProgressInput): WeightEntry[] {
  const current = input.weight;
  const goal = input.weightGoal;
  const start =
    input.startingWeight ??
    current + Math.max(4, Math.round(Math.abs(current - goal) * 0.35)) * (current > goal ? 1 : -1);

  return Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    const weight = Math.round((start + (current - start) * t) * 10) / 10;
    return { week: `W${i + 1}`, weight };
  });
}

/** Progress toward target in kg (positive = moving in the right direction). */
export function getWeightProgressDelta(input: WeightProgressInput): number {
  const start = input.startingWeight ?? input.weight;
  const { weight, weightGoal, fitnessGoal } = input;

  if (fitnessGoal === "build_muscle" || weightGoal > start) {
    return Math.max(0, Math.round((weight - start) * 10) / 10);
  }
  return Math.max(0, Math.round((start - weight) * 10) / 10);
}

export function getWeightProgressLabel(fitnessGoal?: FitnessGoal, weightGoal?: number, startingWeight?: number | null): string {
  if (fitnessGoal === "build_muscle") return "Weight Gained";
  if (startingWeight != null && weightGoal != null && weightGoal > startingWeight) return "Weight Gained";
  return "Weight Lost";
}

export function getGoalProgressPercent(input: WeightProgressInput): number {
  const start = input.startingWeight ?? input.weight;
  const total = Math.abs(input.weightGoal - start);
  if (total === 0) return 100;
  const done = Math.abs(input.weight - start);
  return Math.min(100, Math.round((done / total) * 100));
}
