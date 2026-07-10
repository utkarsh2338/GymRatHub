import { Schema, model } from "mongoose";

const FoodItemSchema = new Schema({
  name: { type: String, required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  amount: { type: String, default: "" },
}, { _id: false });

const MealSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true }, // Breakfast, Lunch, Dinner, Snacks
  time: { type: String, default: "" },
  emoji: { type: String, default: "🥗" },
  items: [FoodItemSchema],
}, { _id: false });

const NutritionSchema = new Schema({
  clerkId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true }, // "YYYY-MM-DD"
  water: {
    consumed: { type: Number, default: 0 },
    goal: { type: Number, default: 3.5 },
  },
  calories: {
    consumed: { type: Number, default: 0 },
    goal: { type: Number, default: 2100 },
  },
  macros: {
    protein: {
      amount: { type: Number, default: 0 },
      goal: { type: Number, default: 180 },
    },
    carbs: {
      amount: { type: Number, default: 0 },
      goal: { type: Number, default: 300 },
    },
    fat: {
      amount: { type: Number, default: 0 },
      goal: { type: Number, default: 120 },
    },
  },
  meals: [MealSchema],
}, { timestamps: true });

NutritionSchema.index({ clerkId: 1, date: 1 });

export const NutritionModel = model("Nutrition", NutritionSchema);
export default NutritionModel;
