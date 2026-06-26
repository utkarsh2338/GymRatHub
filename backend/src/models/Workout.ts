import { Schema, model } from "mongoose";

const WorkoutExerciseSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  muscleGroups: [{ type: String }],
  difficulty: { type: String },
  equipment: [{ type: String }],
  sets: { type: Number, default: 3 },
  reps: { type: String, default: "10" },
  rest: { type: String, default: "90s" },
  duration: { type: String, default: "~10 min" },
  instructions: [{ type: String }],
  status: { type: String, enum: ["pending", "done"], default: "pending" },
}, { _id: false });

const WorkoutPlanSchema = new Schema({
  clerkId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  day: { type: String, required: true }, // e.g. "Monday"
  duration: { type: Number, default: 0 }, // in minutes
  exercises: [WorkoutExerciseSchema],
}, { timestamps: true });

export const WorkoutPlanModel = model("WorkoutPlan", WorkoutPlanSchema);
export default WorkoutPlanModel;
