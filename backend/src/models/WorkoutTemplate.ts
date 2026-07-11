import { Schema, model } from "mongoose";

const TemplateExerciseSchema = new Schema(
  {
    exerciseId: { type: String, default: "" },
    name: { type: String, required: true },
    category: { type: String, required: true },
    muscleGroups: [{ type: String }],
    targetSets: { type: Number, default: 3 },
    targetReps: { type: String, default: "10" },
    order: { type: Number, default: 0 },
    supersetGroupId: { type: String, default: null },
    restSeconds: { type: Number, default: 90 },
  },
  { _id: false }
);

const TemplateDaySchema = new Schema(
  {
    dayLabel: { type: String, required: true },
    name: { type: String, required: true },
    exercises: [TemplateExerciseSchema],
  },
  { _id: false }
);

const WorkoutTemplateSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    goalType: {
      type: String,
      enum: ["muscle_gain", "fat_loss", "strength", "endurance", "beginner"],
      default: "muscle_gain",
    },
    planType: { type: String, enum: ["custom", "preset"], default: "custom" },
    presetKey: { type: String, default: null },
    days: [TemplateDaySchema],
  },
  { timestamps: true }
);

export const WorkoutTemplateModel = model("WorkoutTemplate", WorkoutTemplateSchema);
export default WorkoutTemplateModel;
