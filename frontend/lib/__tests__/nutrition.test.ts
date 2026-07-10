import { describe, it, expect } from "vitest";
import { suggestWaterGoal, calculateBmr, calculateMacros } from "../nutrition-utils";

describe("Nutrition and Macro Calculator Utilities", () => {
  describe("suggestWaterGoal", () => {
    it("should calculate correct water goal for moderate activity in mild climate", () => {
      const water = suggestWaterGoal(80, "moderately_active", "mild");
      // base = (80 * 35)/1000 = 2.8
      // total = 2.8 + 0.5 (mod activity) + 0 (mild climate) = 3.3
      expect(water).toBe(3.3);
    });

    it("should apply hot climate adjustment correctly", () => {
      const water = suggestWaterGoal(70, "sedentary", "hot");
      // base = (70 * 35)/1000 = 2.45
      // total = 2.45 + 0 (sedentary) + 0.5 (hot climate) = 2.95 => 3.0 rounded
      expect(water).toBe(3.0);
    });

    it("should fallback to minimum of 1.5 liters", () => {
      const water = suggestWaterGoal(30, "sedentary", "cold");
      // base = (30 * 35)/1000 = 1.05
      // total = 1.05 + 0 + (-0.25) = 0.8 => fallback to max(1.5, 0.8) = 1.5
      expect(water).toBe(1.5);
    });
  });

  describe("calculateBmr", () => {
    it("should calculate correct BMR for males", () => {
      const bmr = calculateBmr(80, 180, 25, "male");
      // 10 * 80 + 6.25 * 180 - 5 * 25 + 5 = 800 + 1125 - 125 + 5 = 1805
      expect(bmr).toBe(1805);
    });

    it("should calculate correct BMR for females", () => {
      const bmr = calculateBmr(60, 165, 30, "female");
      // 10 * 60 + 6.25 * 165 - 5 * 30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
      expect(bmr).toBe(1320.25);
    });
  });

  describe("calculateMacros", () => {
    it("should return null for out of bounds inputs", () => {
      const result = calculateMacros({
        weightKg: 20, // invalid weight
        heightCm: 180,
        age: 25,
        gender: "male",
        activityLevel: "moderately_active",
        goal: "build_muscle",
      });
      expect(result).toBeNull();
    });

    it("should calculate macros correctly for weight loss goal", () => {
      const result = calculateMacros({
        weightKg: 80,
        heightCm: 180,
        age: 25,
        gender: "male",
        activityLevel: "moderately_active",
        goal: "lose_weight",
      });

      expect(result).not.toBeNull();
      if (result) {
        // BMR = 1805
        // TDEE = 1805 * 1.55 = 2797.75 => 2798 rounded
        // Calories = 2798 - 500 = 2298
        // Protein = 80 * 1.8 = 144
        // Fat = (2298 * 0.28) / 9 = 71.49 => 71
        // Carbs = (2298 - 144 * 4 - 71 * 9) / 4 = (2298 - 576 - 639) / 4 = 1083 / 4 = 270.75 => 271
        expect(result.bmr).toBe(1805);
        expect(result.tdee).toBe(2798);
        expect(result.calories).toBe(2298);
        expect(result.protein).toBe(144);
        expect(result.fat).toBe(71);
        expect(result.carbs).toBe(271);
      }
    });
  });
});
