export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active";

export type ClimatePreference = "mild" | "hot" | "cold";

export type MacroGoal = "lose_weight" | "maintain" | "build_muscle";

export type Gender = "male" | "female";

export interface ActivityLevelOption {
  id: ActivityLevel;
  label: string;
  description: string;
}

export const ACTIVITY_LEVELS: ActivityLevelOption[] = [
  { id: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { id: "lightly_active", label: "Lightly Active", description: "1–3 days/week" },
  { id: "moderately_active", label: "Moderately Active", description: "3–5 days/week" },
  { id: "very_active", label: "Very Active", description: "6–7 days/week" },
  { id: "extremely_active", label: "Extremely Active", description: "Athlete / physical job" },
];

export const CLIMATE_OPTIONS: { id: ClimatePreference; label: string }[] = [
  { id: "mild", label: "Mild / Temperate" },
  { id: "hot", label: "Hot / Humid" },
  { id: "cold", label: "Cold / Dry" },
];

export const MACRO_GOALS: { id: MacroGoal; label: string }[] = [
  { id: "lose_weight", label: "Lose Weight" },
  { id: "maintain", label: "Maintain" },
  { id: "build_muscle", label: "Build Muscle" },
];

const ACTIVITY_WATER_BONUS: Record<ActivityLevel, number> = {
  sedentary: 0,
  lightly_active: 0.25,
  moderately_active: 0.5,
  very_active: 0.75,
  extremely_active: 1,
};

const ACTIVITY_TDEE: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

const CLIMATE_WATER_ADJ: Record<ClimatePreference, number> = {
  mild: 0,
  hot: 0.5,
  cold: -0.25,
};

export function suggestWaterGoal(
  weightKg: number,
  activityLevel: ActivityLevel,
  climate: ClimatePreference
): number {
  const base = (weightKg * 35) / 1000;
  const total = base + ACTIVITY_WATER_BONUS[activityLevel] + CLIMATE_WATER_ADJ[climate];
  return Math.round(Math.max(1.5, total) * 10) / 10;
}

export function calculateBmr(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export interface MacroCalculationInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: MacroGoal;
}

export interface MacroCalculationResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  bmr: number;
  tdee: number;
}

export function calculateMacros(input: MacroCalculationInput): MacroCalculationResult | null {
  const { weightKg, heightCm, age } = input;
  if (!weightKg || weightKg < 30 || weightKg > 300) return null;
  if (!heightCm || heightCm < 100 || heightCm > 250) return null;
  if (!age || age < 13 || age > 100) return null;

  const bmr = calculateBmr(weightKg, heightCm, age, input.gender);
  const tdee = Math.round(bmr * ACTIVITY_TDEE[input.activityLevel]);

  let calories = tdee;
  if (input.goal === "lose_weight") calories -= 500;
  if (input.goal === "build_muscle") calories += 300;
  calories = Math.max(1200, Math.round(calories));

  const proteinPerKg =
    input.goal === "build_muscle" ? 2 : input.goal === "lose_weight" ? 1.8 : 1.6;
  const protein = Math.round(weightKg * proteinPerKg);
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  const water = suggestWaterGoal(weightKg, input.activityLevel, "mild");

  return { calories, protein, carbs, fat, water, bmr: Math.round(bmr), tdee };
}

export interface NutritionPreferences {
  waterGoalConfigured: boolean;
  waterGoal: number;
  waterWeightKg: number | null;
  waterActivityLevel: ActivityLevel;
  waterClimate: ClimatePreference;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export interface NutritionDayResponse {
  date: string;
  calories: { consumed: number; goal: number };
  macros: {
    protein: { amount: number; goal: number };
    carbs: { amount: number; goal: number };
    fat: { amount: number; goal: number };
  };
  water: { consumed: number; goal: number };
  meals: import("@/lib/types").Meal[];
  preferences: NutritionPreferences;
}

export function formatMacroSummary(result: MacroCalculationResult): string {
  return [
    `Daily Calories: ${result.calories} kcal`,
    `Protein: ${result.protein}g`,
    `Carbs: ${result.carbs}g`,
    `Fat: ${result.fat}g`,
    `Water: ${result.water}L`,
  ].join("\n");
}
