import { Schema, model } from "mongoose";

const UserStatsSchema = new Schema({
  workoutsCompleted: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
  waterIntake: { type: Number, default: 0 },
  weight: { type: Number, default: 80 },
  weightGoal: { type: Number, default: 75 },
}, { _id: false });

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, select: false },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  plan: { type: String, enum: ["free", "pro", "elite"], default: "free" },
  fitnessGoal: {
    type: String,
    enum: ["lose_weight", "build_muscle", "improve_endurance", "stay_active"],
    default: "build_muscle",
  },
  targetConfigured: { type: Boolean, default: false },
  startingWeight: { type: Number, default: null },
  joinedAt: { type: String, default: () => new Date().toISOString().split("T")[0] },
  stats: { type: UserStatsSchema, default: () => ({}) },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastWorkoutDate: { type: String, default: null },
  activeWorkoutTemplateId: { type: String, default: null },
  badges: [{
    id: { type: String },
    name: { type: String },
    earnedAt: { type: String },
  }],
  nutritionPreferences: {
    waterGoalConfigured: { type: Boolean, default: false },
    waterGoal: { type: Number, default: 3.5 },
    waterWeightKg: { type: Number, default: null },
    waterActivityLevel: {
      type: String,
      enum: ["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"],
      default: "moderately_active",
    },
    waterClimate: { type: String, enum: ["mild", "hot", "cold"], default: "mild" },
    calorieGoal: { type: Number, default: 2100 },
    proteinGoal: { type: Number, default: 180 },
    carbsGoal: { type: Number, default: 300 },
    fatGoal: { type: Number, default: 120 },
  },
  notificationPreferences: {
    pushWorkouts: { type: Boolean, default: true },
    pushChallenges: { type: Boolean, default: true },
    pushCommunity: { type: Boolean, default: false },
    pushTrainers: { type: Boolean, default: true },
    emailWeekly: { type: Boolean, default: true },
    emailPRs: { type: Boolean, default: true },
    emailNewsletter: { type: Boolean, default: false },
    emailOffers: { type: Boolean, default: true },
  },
  privacyPreferences: {
    publicProfile: { type: Boolean, default: true },
    showStats: { type: Boolean, default: true },
    showWorkouts: { type: Boolean, default: false },
    allowMessages: { type: Boolean, default: true },
    activityStatus: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: false },
  },
  appearancePreferences: {
    theme: { type: String, enum: ["dark", "light", "auto"], default: "dark" },
    accentColor: { type: String, default: "#39E609" },
    compactMode: { type: Boolean, default: false },
    animations: { type: Boolean, default: true },
    language: { type: String, default: "en" },
  },
  fitnessPreferences: {
    units: { type: String, enum: ["metric", "imperial"], default: "metric" },
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "athlete"],
      default: "intermediate",
    },
    weeklyWorkoutTarget: { type: Number, default: 5, min: 1, max: 7 },
    preferredRestDay: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      default: "sunday",
    },
  },
}, { timestamps: true });

export const UserModel = model("User", UserSchema);
export default UserModel;
