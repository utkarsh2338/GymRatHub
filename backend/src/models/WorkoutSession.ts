import { Schema, model } from "mongoose";

const LoggedSetSchema = new Schema(
  {
    setNumber: { type: Number, required: true },
    weightKg: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    isWarmup: { type: Boolean, default: false },
    isDropSet: { type: Boolean, default: false },
  },
  { _id: false }
);

const SessionExerciseSchema = new Schema(
  {
    id: { type: String, required: true },
    exerciseId: { type: String, default: "" },
    name: { type: String, required: true },
    category: { type: String, required: true },
    muscleGroups: [{ type: String }],
    targetSets: { type: Number, default: 3 },
    targetReps: { type: String, default: "10" },
    loggedSets: [LoggedSetSchema],
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    order: { type: Number, default: 0 },
    supersetGroupId: { type: String, default: null },
    restSeconds: { type: Number, default: 90 },
  },
  { _id: false }
);

const SessionPRSchema = new Schema(
  {
    type: { type: String, required: true },
    exerciseName: { type: String, required: true },
    value: { type: Number, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const WorkoutSessionSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    templateId: { type: String, default: null },
    planName: { type: String, required: true },
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    durationMinutes: { type: Number, default: 0 },
    exercises: [SessionExerciseSchema],
    totalVolumeKg: { type: Number, default: 0 },
    newPRs: [SessionPRSchema],
    aiInsights: [{ type: String }],
  },
  { timestamps: true }
);

WorkoutSessionSchema.index({ clerkId: 1, status: 1 });
WorkoutSessionSchema.index({ clerkId: 1, completedAt: -1 });
WorkoutSessionSchema.index({ clerkId: 1, status: 1, completedAt: -1 });

export const WorkoutSessionModel = model("WorkoutSession", WorkoutSessionSchema);
export default WorkoutSessionModel;
