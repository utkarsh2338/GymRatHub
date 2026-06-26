/** Pre-built weekly plans (Mon–Sat). Sunday is rest. */

export type PresetGoal =
  | "muscle_gain"
  | "fat_loss"
  | "strength"
  | "endurance"
  | "beginner";

export interface PresetExercise {
  exerciseId: string;
  name: string;
  category: string;
  muscleGroups: string[];
  targetSets: number;
  targetReps: string;
}

export interface PresetDay {
  dayLabel: string;
  name: string;
  exercises: PresetExercise[];
}

export interface PresetPlan {
  presetKey: string;
  name: string;
  description: string;
  goalType: PresetGoal;
  days: PresetDay[];
}

const pushA: PresetExercise[] = [
  { exerciseId: "barbell-bench-press", name: "Barbell Bench Press", category: "Chest", muscleGroups: ["Pectorals", "Triceps"], targetSets: 4, targetReps: "6-8" },
  { exerciseId: "incline-dumbbell-press", name: "Incline Dumbbell Press", category: "Chest", muscleGroups: ["Pectorals"], targetSets: 3, targetReps: "8-10" },
  { exerciseId: "dumbbell-fly", name: "Dumbbell Fly", category: "Chest", muscleGroups: ["Pectorals"], targetSets: 3, targetReps: "12" },
  { exerciseId: "triceps-pushdown", name: "Triceps Pushdown", category: "Arms", muscleGroups: ["Triceps"], targetSets: 3, targetReps: "12" },
];

const pullA: PresetExercise[] = [
  { exerciseId: "conventional-deadlift", name: "Conventional Deadlift", category: "Back", muscleGroups: ["Lats", "Lower Back"], targetSets: 4, targetReps: "5" },
  { exerciseId: "pull-up", name: "Pull-Up", category: "Back", muscleGroups: ["Lats", "Biceps"], targetSets: 4, targetReps: "6-10" },
  { exerciseId: "barbell-bent-over-row", name: "Barbell Bent-Over Row", category: "Back", muscleGroups: ["Lats", "Rhomboids"], targetSets: 3, targetReps: "8" },
  { exerciseId: "face-pull", name: "Face Pull", category: "Back", muscleGroups: ["Rhomboids"], targetSets: 3, targetReps: "15" },
];

const legsA: PresetExercise[] = [
  { exerciseId: "barbell-back-squat", name: "Barbell Back Squat", category: "Legs", muscleGroups: ["Quadriceps", "Glutes"], targetSets: 4, targetReps: "6-8" },
  { exerciseId: "romanian-deadlift", name: "Romanian Deadlift", category: "Legs", muscleGroups: ["Hamstrings", "Glutes"], targetSets: 3, targetReps: "8-10" },
  { exerciseId: "leg-press", name: "Leg Press", category: "Legs", muscleGroups: ["Quadriceps"], targetSets: 3, targetReps: "10-12" },
  { exerciseId: "standing-calf-raise", name: "Standing Calf Raise", category: "Legs", muscleGroups: ["Calves"], targetSets: 4, targetReps: "12-15" },
];

export const PRESET_PLANS: PresetPlan[] = [
  {
    presetKey: "muscle_gain_ppl",
    name: "Muscle Gain — Push Pull Legs",
    description: "Classic 6-day hypertrophy split for building muscle mass.",
    goalType: "muscle_gain",
    days: [
      { dayLabel: "Mon", name: "Push A", exercises: pushA },
      { dayLabel: "Tue", name: "Pull A", exercises: pullA },
      { dayLabel: "Wed", name: "Legs A", exercises: legsA },
      { dayLabel: "Thu", name: "Push B", exercises: pushA },
      { dayLabel: "Fri", name: "Pull B", exercises: pullA },
      { dayLabel: "Sat", name: "Legs B", exercises: legsA },
    ],
  },
  {
    presetKey: "fat_loss_circuit",
    name: "Fat Loss — Metabolic Circuit",
    description: "Higher rep, shorter rest circuits to maximize calorie burn.",
    goalType: "fat_loss",
    days: [
      { dayLabel: "Mon", name: "Full Body Circuit", exercises: [
        { exerciseId: "goblet-squat", name: "Goblet Squat", category: "Legs", muscleGroups: ["Quadriceps"], targetSets: 3, targetReps: "15" },
        { exerciseId: "push-up", name: "Push-Up", category: "Chest", muscleGroups: ["Pectorals"], targetSets: 3, targetReps: "15" },
        { exerciseId: "dumbbell-row", name: "Single-Arm Dumbbell Row", category: "Back", muscleGroups: ["Lats"], targetSets: 3, targetReps: "12" },
        { exerciseId: "burpee", name: "Burpee", category: "Cardio", muscleGroups: ["Quadriceps"], targetSets: 3, targetReps: "10" },
      ]},
      { dayLabel: "Tue", name: "Cardio + Core", exercises: [
        { exerciseId: "treadmill-run", name: "Treadmill Run", category: "Cardio", muscleGroups: ["Quadriceps"], targetSets: 1, targetReps: "20 min" },
        { exerciseId: "plank", name: "Plank", category: "Core", muscleGroups: ["Abs"], targetSets: 3, targetReps: "45s" },
      ]},
      { dayLabel: "Wed", name: "Upper Burn", exercises: pushA.slice(0, 3) },
      { dayLabel: "Thu", name: "Lower Burn", exercises: legsA.slice(0, 3) },
      { dayLabel: "Fri", name: "HIIT", exercises: [
        { exerciseId: "jump-rope", name: "Jump Rope", category: "Cardio", muscleGroups: ["Calves"], targetSets: 5, targetReps: "60s" },
        { exerciseId: "mountain-climber", name: "Mountain Climber", category: "Core", muscleGroups: ["Abs"], targetSets: 4, targetReps: "30s" },
      ]},
      { dayLabel: "Sat", name: "Active Recovery", exercises: [
        { exerciseId: "walking-lunge", name: "Walking Lunge", category: "Legs", muscleGroups: ["Quadriceps"], targetSets: 2, targetReps: "12" },
      ]},
    ],
  },
  {
    presetKey: "strength_531",
    name: "Strength Building — 5×5 Focus",
    description: "Heavy compound lifts with progressive overload.",
    goalType: "strength",
    days: [
      { dayLabel: "Mon", name: "Squat Day", exercises: [
        { exerciseId: "barbell-back-squat", name: "Barbell Back Squat", category: "Legs", muscleGroups: ["Quadriceps"], targetSets: 5, targetReps: "5" },
        { exerciseId: "leg-press", name: "Leg Press", category: "Legs", muscleGroups: ["Quadriceps"], targetSets: 3, targetReps: "8" },
      ]},
      { dayLabel: "Tue", name: "Bench Day", exercises: [
        { exerciseId: "barbell-bench-press", name: "Barbell Bench Press", category: "Chest", muscleGroups: ["Pectorals"], targetSets: 5, targetReps: "5" },
        { exerciseId: "overhead-barbell-press", name: "Overhead Barbell Press", category: "Shoulders", muscleGroups: ["Deltoids"], targetSets: 3, targetReps: "8" },
      ]},
      { dayLabel: "Wed", name: "Rest / Mobility", exercises: [] },
      { dayLabel: "Thu", name: "Deadlift Day", exercises: [
        { exerciseId: "conventional-deadlift", name: "Conventional Deadlift", category: "Back", muscleGroups: ["Lower Back"], targetSets: 5, targetReps: "5" },
        { exerciseId: "barbell-bent-over-row", name: "Barbell Bent-Over Row", category: "Back", muscleGroups: ["Lats"], targetSets: 3, targetReps: "8" },
      ]},
      { dayLabel: "Fri", name: "Press Day", exercises: [
        { exerciseId: "overhead-barbell-press", name: "Overhead Barbell Press", category: "Shoulders", muscleGroups: ["Deltoids"], targetSets: 5, targetReps: "5" },
        { exerciseId: "close-grip-bench-press", name: "Close-Grip Bench Press", category: "Arms", muscleGroups: ["Triceps"], targetSets: 3, targetReps: "8" },
      ]},
      { dayLabel: "Sat", name: "Accessory", exercises: pullA.slice(2) },
    ],
  },
  {
    presetKey: "endurance_athlete",
    name: "Endurance Training",
    description: "Build stamina with cardio and muscular endurance work.",
    goalType: "endurance",
    days: [
      { dayLabel: "Mon", name: "Cardio Base", exercises: [{ exerciseId: "rowing-machine", name: "Rowing Machine", category: "Cardio", muscleGroups: ["Lats"], targetSets: 1, targetReps: "30 min" }]},
      { dayLabel: "Tue", name: "Circuit", exercises: pushA.slice(0, 2).map((e) => ({ ...e, targetReps: "15" })) },
      { dayLabel: "Wed", name: "Run", exercises: [{ exerciseId: "treadmill-run", name: "Treadmill Run", category: "Cardio", muscleGroups: ["Quadriceps"], targetSets: 1, targetReps: "40 min" }]},
      { dayLabel: "Thu", name: "Full Body", exercises: legsA.slice(0, 3).map((e) => ({ ...e, targetReps: "12-15" })) },
      { dayLabel: "Fri", name: "Intervals", exercises: [{ exerciseId: "burpee", name: "Burpee", category: "Cardio", muscleGroups: ["Quadriceps"], targetSets: 8, targetReps: "30s" }]},
      { dayLabel: "Sat", name: "Long Session", exercises: [{ exerciseId: "stationary-bike", name: "Stationary Bike", category: "Cardio", muscleGroups: ["Quadriceps"], targetSets: 1, targetReps: "45 min" }]},
    ],
  },
  {
    presetKey: "beginner_transform",
    name: "Beginner Transformation",
    description: "3 full-body days plus light activity — perfect for new lifters.",
    goalType: "beginner",
    days: [
      { dayLabel: "Mon", name: "Full Body A", exercises: [
        { exerciseId: "goblet-squat", name: "Goblet Squat", category: "Legs", muscleGroups: ["Quadriceps"], targetSets: 3, targetReps: "10" },
        { exerciseId: "dumbbell-bench-press", name: "Dumbbell Bench Press", category: "Chest", muscleGroups: ["Pectorals"], targetSets: 3, targetReps: "10" },
        { exerciseId: "lat-pulldown", name: "Lat Pulldown", category: "Back", muscleGroups: ["Lats"], targetSets: 3, targetReps: "10" },
        { exerciseId: "plank", name: "Plank", category: "Core", muscleGroups: ["Abs"], targetSets: 3, targetReps: "30s" },
      ]},
      { dayLabel: "Tue", name: "Rest / Walk", exercises: [] },
      { dayLabel: "Wed", name: "Full Body B", exercises: [
        { exerciseId: "leg-press", name: "Leg Press", category: "Legs", muscleGroups: ["Quadriceps"], targetSets: 3, targetReps: "12" },
        { exerciseId: "dumbbell-shoulder-press", name: "Dumbbell Shoulder Press", category: "Shoulders", muscleGroups: ["Deltoids"], targetSets: 3, targetReps: "10" },
        { exerciseId: "seated-cable-row", name: "Seated Cable Row", category: "Back", muscleGroups: ["Rhomboids"], targetSets: 3, targetReps: "10" },
      ]},
      { dayLabel: "Thu", name: "Rest", exercises: [] },
      { dayLabel: "Fri", name: "Full Body C", exercises: [
        { exerciseId: "romanian-deadlift", name: "Romanian Deadlift", category: "Legs", muscleGroups: ["Hamstrings"], targetSets: 3, targetReps: "10" },
        { exerciseId: "push-up", name: "Push-Up", category: "Chest", muscleGroups: ["Pectorals"], targetSets: 3, targetReps: "8-12" },
        { exerciseId: "dumbbell-bicep-curl", name: "Dumbbell Bicep Curl", category: "Arms", muscleGroups: ["Biceps"], targetSets: 2, targetReps: "12" },
      ]},
      { dayLabel: "Sat", name: "Light Cardio", exercises: [
        { exerciseId: "stationary-bike", name: "Stationary Bike", category: "Cardio", muscleGroups: ["Quadriceps"], targetSets: 1, targetReps: "20 min" },
      ]},
    ],
  },
];

export function getPresetByKey(key: string): PresetPlan | undefined {
  return PRESET_PLANS.find((p) => p.presetKey === key);
}
