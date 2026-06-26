import type { Exercise, ExerciseCategory } from "@/lib/types";
import { chestExercises } from "./categories/chest";
import { backExercises } from "./categories/back";
import { shoulderExercises } from "./categories/shoulders";
import { armExercises } from "./categories/arms";
import { legExercises } from "./categories/legs";
import { coreExercises } from "./categories/core";
import { cardioExercises } from "./categories/cardio";
import { fullBodyExercises } from "./categories/full-body";
import { flexibilityExercises } from "./categories/flexibility";
import { slugifyExerciseName } from "./build";

export const EXERCISE_LIBRARY: Exercise[] = [
  ...chestExercises,
  ...backExercises,
  ...shoulderExercises,
  ...armExercises,
  ...legExercises,
  ...coreExercises,
  ...cardioExercises,
  ...fullBodyExercises,
  ...flexibilityExercises,
];

const byId = new Map(EXERCISE_LIBRARY.map((e) => [e.id, e]));

export function getAllExercises(): Exercise[] {
  return EXERCISE_LIBRARY;
}

export function getExerciseById(id: string): Exercise | undefined {
  return byId.get(id);
}

export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return EXERCISE_LIBRARY.filter((e) => e.category === category);
}

export function findExerciseByName(name: string): Exercise | undefined {
  const normalized = name.trim().toLowerCase();
  const exact = EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === normalized);
  if (exact) return exact;

  const contains = EXERCISE_LIBRARY.filter(
    (e) =>
      e.name.toLowerCase().includes(normalized) ||
      normalized.includes(e.name.toLowerCase()),
  );
  if (contains.length === 1) return contains[0];

  const bySlug = byId.get(slugifyExerciseName(name));
  if (bySlug) return bySlug;

  return contains.sort((a, b) => a.name.length - b.name.length)[0];
}

export function findExerciseIdByName(name: string): string | null {
  return findExerciseByName(name)?.id ?? null;
}

/** Count exercises per category for UI badges */
export function getExerciseCountByCategory(): Record<ExerciseCategory, number> {
  const counts = {} as Record<ExerciseCategory, number>;
  for (const ex of EXERCISE_LIBRARY) {
    counts[ex.category] = (counts[ex.category] ?? 0) + 1;
  }
  return counts;
}

/** Legacy ids from early mock data → current slugs */
const LEGACY_ID_MAP: Record<string, string> = {
  ex1: "barbell-bench-press",
  ex2: "incline-dumbbell-press",
  ex3: "dumbbell-shoulder-press",
  ex4: "barbell-back-squat",
  ex5: "conventional-deadlift",
  ex6: "romanian-deadlift",
  ex7: "dumbbell-fly",
  ex8: "plank",
  ex9: "pull-up",
  ex10: "seated-cable-row",
  ex11: "leg-press",
  ex12: "lateral-raise",
};

export function resolveExerciseId(id: string): string {
  return LEGACY_ID_MAP[id] ?? id;
}

export { slugifyExerciseName };
