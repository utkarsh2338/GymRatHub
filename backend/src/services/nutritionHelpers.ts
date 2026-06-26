import type { HydratedDocument } from "mongoose";
import NutritionModel from "../models/Nutrition";

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active";

export type ClimatePreference = "mild" | "hot" | "cold";

export type MacroGoal = "lose_weight" | "maintain" | "build_muscle";

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
  gender: "male" | "female"
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export interface MacroCalculationInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "male" | "female";
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

export function calculateMacros(input: MacroCalculationInput): MacroCalculationResult {
  const bmr = calculateBmr(input.weightKg, input.heightCm, input.age, input.gender);
  const tdee = Math.round(bmr * ACTIVITY_TDEE[input.activityLevel]);

  let calories = tdee;
  if (input.goal === "lose_weight") calories -= 500;
  if (input.goal === "build_muscle") calories += 300;
  calories = Math.max(1200, Math.round(calories));

  const proteinPerKg = input.goal === "build_muscle" ? 2 : input.goal === "lose_weight" ? 1.8 : 1.6;
  const protein = Math.round(input.weightKg * proteinPerKg);
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  const water = suggestWaterGoal(input.weightKg, input.activityLevel, "mild");

  return { calories, protein, carbs, fat, water, bmr: Math.round(bmr), tdee };
}

export function recalculateNutritionTotals(
  nutrition: HydratedDocument<InstanceType<typeof NutritionModel>>
) {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const meal of nutrition.meals) {
    for (const item of meal.items) {
      calories += Number(item.calories) || 0;
      protein += Number(item.protein) || 0;
      carbs += Number(item.carbs) || 0;
      fat += Number(item.fat) || 0;
    }
  }

  nutrition.calories!.consumed = calories;
  nutrition.macros!.protein!.amount = protein;
  nutrition.macros!.carbs!.amount = carbs;
  nutrition.macros!.fat!.amount = fat;
}

export const DEFAULT_MEALS = [
  { id: "m1", name: "Breakfast", time: "08:00", emoji: "🥗", items: [] },
  { id: "m2", name: "Lunch", time: "13:00", emoji: "🍗", items: [] },
  { id: "m3", name: "Dinner", time: "19:00", emoji: "🐟", items: [] },
  { id: "m4", name: "Snacks", time: "16:00", emoji: "🥜", items: [] },
];