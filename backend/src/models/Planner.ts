import { Schema, model } from "mongoose";

const PlannerWorkoutSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  duration: { type: Number, default: 0 },
  color: { type: String, default: "#39E609" },
  status: { type: String, enum: ["done", "planned", "rest"], default: "planned" },
}, { _id: false });

const PlannerDaySchema = new Schema({
  clerkId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true }, // "YYYY-MM-DD"
  dayLabel: { type: String, required: true }, // "Mon", "Tue", etc.
  workouts: [PlannerWorkoutSchema],
}, { timestamps: true });

PlannerDaySchema.index({ clerkId: 1, date: 1 });

export const PlannerDayModel = model("PlannerDay", PlannerDaySchema);
export default PlannerDayModel;
