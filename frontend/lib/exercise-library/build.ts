import type { Exercise, ExerciseCategory, MuscleGroup } from "@/lib/types";

export type ExerciseDef = {
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  difficulty: Exercise["difficulty"];
  equipment: string[];
  instructions: string[];
  tips: string[];
  commonMistakes: string[];
  sets?: number;
  reps?: string;
  rest?: string;
};

export function slugifyExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildExercise(def: ExerciseDef): Exercise {
  return {
    id: slugifyExerciseName(def.name),
    name: def.name,
    category: def.category,
    muscleGroups: def.muscleGroups,
    difficulty: def.difficulty,
    equipment: def.equipment,
    instructions: def.instructions,
    tips: def.tips,
    commonMistakes: def.commonMistakes,
    sets: def.sets,
    reps: def.reps,
    rest: def.rest,
  };
}
