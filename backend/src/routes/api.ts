import { Router, Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import UserModel from "../models/User";
import WorkoutPlanModel from "../models/Workout";
import NutritionModel from "../models/Nutrition";
import PlannerDayModel from "../models/Planner";
import PostModel from "../models/Post";
import UserChallengeModel from "../models/Challenge";
import { searchTutorialVideos } from "../services/youtube";
import { FRESH_USER_STATS } from "../constants/freshUser";
import workoutTrackingRouter from "./workoutTracking";
import { syncTodayWorkoutFromTemplate } from "../services/workoutPlanSync";
import {
  DEFAULT_MEALS,
  recalculateNutritionTotals,
  suggestWaterGoal,
  type ActivityLevel,
  type ClimatePreference,
} from "../services/nutritionHelpers";
import {
  deleteUserAccount,
  exportUserData,
  syncNameToClerk,
} from "../services/userAccount";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
});

const setProgressTargetSchema = z.object({
  currentWeight: z.coerce.number().min(30, "Current weight must be at least 30 kg").max(300, "Current weight must be at most 300 kg"),
  targetWeight: z.coerce.number().min(30, "Target weight must be at least 30 kg").max(300, "Target weight must be at most 300 kg"),
  fitnessGoal: z.enum(["lose_weight", "build_muscle", "improve_endurance", "stay_active"]).default("build_muscle"),
});

const updateStatsSchema = z.object({
  workoutsCompleted: z.coerce.number().min(0).optional(),
  streak: z.coerce.number().min(0).optional(),
  caloriesBurned: z.coerce.number().min(0).optional(),
  waterIntake: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(30).max(300).optional(),
  weightGoal: z.coerce.number().min(30).max(300).optional(),
});

const updateNotificationsSchema = z.object({
  pushWorkouts: z.boolean().optional(),
  pushChallenges: z.boolean().optional(),
  pushCommunity: z.boolean().optional(),
  pushTrainers: z.boolean().optional(),
  emailWeekly: z.boolean().optional(),
  emailPRs: z.boolean().optional(),
  emailNewsletter: z.boolean().optional(),
  emailOffers: z.boolean().optional(),
});

const updatePrivacySchema = z.object({
  publicProfile: z.boolean().optional(),
  showStats: z.boolean().optional(),
  showWorkouts: z.boolean().optional(),
  allowMessages: z.boolean().optional(),
  activityStatus: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
});

const updateAppearanceSchema = z.object({
  theme: z.enum(["dark", "light", "auto"]).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
  compactMode: z.boolean().optional(),
  animations: z.boolean().optional(),
  language: z.string().optional(),
});

const updateFitnessPrefsSchema = z.object({
  units: z.enum(["metric", "imperial"]).optional(),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced", "athlete"]).optional(),
  weeklyWorkoutTarget: z.coerce.number().min(1).max(7).optional(),
  preferredRestDay: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).optional(),
  fitnessGoal: z.enum(["lose_weight", "build_muscle", "improve_endurance", "stay_active"]).optional(),
});

const updatePlanSchema = z.object({
  plan: z.enum(["free", "pro", "elite"]),
});

const nutritionGoalsSchema = z.object({
  date: z.string().optional(),
  calories: z.coerce.number().min(0).optional(),
  protein: z.coerce.number().min(0).optional(),
  carbs: z.coerce.number().min(0).optional(),
  fat: z.coerce.number().min(0).optional(),
  water: z.coerce.number().min(0).optional(),
});

const waterGoalSchema = z.object({
  date: z.string().optional(),
  weightKg: z.coerce.number().min(30, "Enter a valid body weight (30–300 kg)").max(300, "Enter a valid body weight (30–300 kg)"),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]).default("moderately_active"),
  climate: z.enum(["mild", "hot", "cold"]).default("mild"),
  customGoal: z.coerce.number().min(0).optional(),
});

const logFoodItemSchema = z.object({
  date: z.string().optional(),
  name: z.string().min(1, "Food name is required").max(200),
  calories: z.coerce.number().min(0).optional(),
  protein: z.coerce.number().min(0).optional(),
  carbs: z.coerce.number().min(0).optional(),
  fat: z.coerce.number().min(0).optional(),
  amount: z.string().optional(),
});

const editFoodItemSchema = z.object({
  date: z.string().optional(),
  name: z.string().min(1).max(200).optional(),
  calories: z.coerce.number().min(0).optional(),
  protein: z.coerce.number().min(0).optional(),
  carbs: z.coerce.number().min(0).optional(),
  fat: z.coerce.number().min(0).optional(),
  amount: z.string().optional(),
});

const logWaterSchema = z.object({
  date: z.string().optional(),
  amount: z.coerce.number().min(0, "Water amount must be non-negative"),
});

const plannerWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required").max(100),
  type: z.string().min(1, "Workout type is required"),
  duration: z.coerce.number().min(0).default(0),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").default("#39E609"),
});

const createPostSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty").max(2000),
  tags: z.array(z.string().max(50)).max(10).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  type: z.enum(["general", "achievement", "progress", "question"]).default("general"),
});

const deleteAccountSchema = z.object({
  confirm: z.literal("DELETE", { error: 'Type "DELETE" to confirm account removal.' }),
});

// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

router.use(workoutTrackingRouter);




// Helper to get day name
function getDayName(): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. USER PROFILE ROUTE
   ────────────────────────────────────────────────────────────────────────── */
// GET User Profile
router.get("/users/profile", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    let user = await UserModel.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }




    // Fresh accounts: activity stats stay at zero until a progress target is set
    if (!user.targetConfigured) {
      user.stats.workoutsCompleted = 0;
      user.stats.streak = 0;
      user.stats.caloriesBurned = 0;
      user.stats.waterIntake = user.stats.waterIntake ?? 0;
      await user.save();
    }

    return res.json(user);
  } catch (error) {
    console.error("GET profile error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// PUT Update profile fields (name, bio, location)
router.put("/users/profile", validateBody(updateProfileSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { name, bio, location } = req.body;

    const update: Record<string, string> = {};
    if (typeof name === "string" && name.trim()) update.name = name.trim();
    if (typeof bio === "string") update.bio = bio;
    if (typeof location === "string") update.location = location;

    const user = await UserModel.findOneAndUpdate(
      { clerkId },
      { $set: update },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (update.name) {
      try {
        await syncNameToClerk(clerkId!, update.name);
      } catch (syncErr) {
        console.error("Clerk name sync error:", syncErr);
      }
    }

    return res.json(user);
  } catch (error) {
    console.error("PUT profile error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// PUT Set progress target (current weight, goal weight, fitness goal)
router.put("/users/profile/target", validateBody(setProgressTargetSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { currentWeight, targetWeight, fitnessGoal } = req.body;

    const weight = Number(currentWeight);
    const weightGoal = Number(targetWeight);

    if (!weight || weight < 30 || weight > 300) {
      return res.status(400).json({ error: "Current weight must be between 30 and 300 kg." });
    }
    if (!weightGoal || weightGoal < 30 || weightGoal > 300) {
      return res.status(400).json({ error: "Target weight must be between 30 and 300 kg." });
    }

    const validGoals = ["lose_weight", "build_muscle", "improve_endurance", "stay_active"];
    const goal = validGoals.includes(fitnessGoal) ? fitnessGoal : "build_muscle";

    const user = await UserModel.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          fitnessGoal: goal,
          targetConfigured: true,
          startingWeight: weight,
          "stats.weight": weight,
          "stats.weightGoal": weightGoal,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json(user);
  } catch (error) {
    console.error("PUT profile target error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// PUT Update User Stats (streak, water, weight, etc.)
router.put("/users/profile/stats", validateBody(updateStatsSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { workoutsCompleted, streak, caloriesBurned, waterIntake, weight, weightGoal } = req.body;
    
    const user = await UserModel.findOneAndUpdate(
      { clerkId },
      { 
        $set: {
          "stats.workoutsCompleted": workoutsCompleted,
          "stats.streak": streak,
          "stats.caloriesBurned": caloriesBurned,
          "stats.waterIntake": waterIntake,
          "stats.weight": weight,
          "stats.weightGoal": weightGoal,
        }
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json(user);
  } catch (error) {
    console.error("PUT stats error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// GET user preferences (notifications, privacy, appearance, fitness)
router.get("/users/preferences", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await UserModel.findOne({ clerkId }).lean();
    if (!user) return res.status(404).json({ error: "User not found." });

    return res.json({
      notifications: user.notificationPreferences ?? {},
      privacy: user.privacyPreferences ?? {},
      appearance: user.appearancePreferences ?? {},
      fitness: {
        ...(user.fitnessPreferences ?? {}),
        fitnessGoal: user.fitnessGoal,
      },
      plan: user.plan,
    });
  } catch (error) {
    console.error("GET preferences error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

function prefUpdate(
  prefix: string,
  body: Record<string, unknown>,
  allowed: string[]
): Record<string, unknown> {
  const $set: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      $set[`${prefix}.${key}`] = body[key];
    }
  }
  return $set;
}

router.put("/users/preferences/notifications", validateBody(updateNotificationsSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const $set = prefUpdate("notificationPreferences", req.body, [
      "pushWorkouts", "pushChallenges", "pushCommunity", "pushTrainers",
      "emailWeekly", "emailPRs", "emailNewsletter", "emailOffers",
    ]);
    const user = await UserModel.findOneAndUpdate({ clerkId }, { $set }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json(user.notificationPreferences);
  } catch (error) {
    console.error("PUT notifications error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.put("/users/preferences/privacy", validateBody(updatePrivacySchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const $set = prefUpdate("privacyPreferences", req.body, [
      "publicProfile", "showStats", "showWorkouts", "allowMessages",
      "activityStatus", "twoFactorEnabled",
    ]);
    const user = await UserModel.findOneAndUpdate({ clerkId }, { $set }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json(user.privacyPreferences);
  } catch (error) {
    console.error("PUT privacy error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.put("/users/preferences/appearance", validateBody(updateAppearanceSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { theme, accentColor, compactMode, animations, language } = req.body;
    const $set: Record<string, unknown> = {};
    if (theme && ["dark", "light", "auto"].includes(theme)) {
      $set["appearancePreferences.theme"] = theme;
    }
    if (typeof accentColor === "string" && /^#[0-9A-Fa-f]{6}$/.test(accentColor)) {
      $set["appearancePreferences.accentColor"] = accentColor;
    }
    if (typeof compactMode === "boolean") $set["appearancePreferences.compactMode"] = compactMode;
    if (typeof animations === "boolean") $set["appearancePreferences.animations"] = animations;
    if (typeof language === "string") $set["appearancePreferences.language"] = language;

    const user = await UserModel.findOneAndUpdate({ clerkId }, { $set }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json(user.appearancePreferences);
  } catch (error) {
    console.error("PUT appearance error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.put("/users/preferences/fitness", validateBody(updateFitnessPrefsSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { units, fitnessLevel, weeklyWorkoutTarget, preferredRestDay, fitnessGoal } = req.body;
    const $set: Record<string, unknown> = {};

    if (units && ["metric", "imperial"].includes(units)) {
      $set["fitnessPreferences.units"] = units;
    }
    if (fitnessLevel && ["beginner", "intermediate", "advanced", "athlete"].includes(fitnessLevel)) {
      $set["fitnessPreferences.fitnessLevel"] = fitnessLevel;
    }
    if (weeklyWorkoutTarget != null) {
      const n = Math.min(7, Math.max(1, Number(weeklyWorkoutTarget)));
      $set["fitnessPreferences.weeklyWorkoutTarget"] = n;
    }
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    if (preferredRestDay && days.includes(preferredRestDay)) {
      $set["fitnessPreferences.preferredRestDay"] = preferredRestDay;
    }
    const validGoals = ["lose_weight", "build_muscle", "improve_endurance", "stay_active"];
    if (fitnessGoal && validGoals.includes(fitnessGoal)) {
      $set.fitnessGoal = fitnessGoal;
    }

    const user = await UserModel.findOneAndUpdate({ clerkId }, { $set }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({ ...user.fitnessPreferences, fitnessGoal: user.fitnessGoal });
  } catch (error) {
    console.error("PUT fitness preferences error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.put("/users/plan", validateBody(updatePlanSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { plan } = req.body;
    if (!["free", "pro", "elite"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan." });
    }
    const user = await UserModel.findOneAndUpdate(
      { clerkId },
      { $set: { plan } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({ plan: user.plan });
  } catch (error) {
    console.error("PUT plan error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

import { exportToCSV, exportToPDF } from "../services/exportService";

router.get("/users/export", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const format = req.query.format as string;

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="gymrathub-report-${Date.now()}.pdf"`);
      await exportToPDF(clerkId!, res);
      return;
    } else if (format === "csv") {
      const csvData = await exportToCSV(clerkId!);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="gymrathub-history-${Date.now()}.csv"`);
      return res.send(csvData);
    } else {
      const data = await exportUserData(clerkId!);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="gymrathub-export-${Date.now()}.json"`);
      return res.json(data);
    }
  } catch (error) {
    console.error("GET export error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
});

router.delete("/users/account", validateBody(deleteAccountSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { confirm } = req.body;
    if (confirm !== "DELETE") {
      return res.status(400).json({ error: 'Type "DELETE" to confirm account removal.' });
    }
    await deleteUserAccount(clerkId!);
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE account error:", error);
    return res.status(500).json({ error: "Failed to delete account." });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   2. WORKOUT ROUTES
   ────────────────────────────────────────────────────────────────────────── */
// GET Today's Workout Plan (synced from active My Plan template)
router.get("/workouts/today", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const user = await UserModel.findOne({ clerkId });

    let workout = await syncTodayWorkoutFromTemplate(clerkId!);

    if (workout && user && !user.targetConfigured) {
      let workoutChanged = false;
      for (const exercise of workout.exercises) {
        if (exercise.status === "done") {
          exercise.status = "pending";
          workoutChanged = true;
        }
      }
      if (workoutChanged) {
        await workout.save();
      }
    }

    return res.json(workout);
  } catch (error) {
    console.error("GET today's workout error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// PATCH Toggle Exercise Status (Done/Pending)
router.patch("/workouts/today/exercises/:exerciseId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { exerciseId } = req.params;
    const { status } = req.body; // "done" | "pending"
    const todayLabel = getDayName();

    const workout = await WorkoutPlanModel.findOne({ clerkId, day: todayLabel });
    if (!workout) {
      return res.status(404).json({ error: "No workout plan found for today." });
    }

    const exercise = workout.exercises.find(e => e.id === exerciseId);
    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found in today's workout." });
    }

    const previousStatus = exercise.status;
    exercise.status = status;
    await workout.save();

    // Dynamically adjust user stats based on completion
    if (previousStatus !== "done" && status === "done") {
      await UserModel.findOneAndUpdate(
        { clerkId },
        { 
          $inc: { 
            "stats.workoutsCompleted": 1,
            "stats.caloriesBurned": 300 // Burn 300 calories per completed exercise/workout segment
          } 
        }
      );
    } else if (previousStatus === "done" && status === "pending") {
      await UserModel.findOneAndUpdate(
        { clerkId },
        { 
          $inc: { 
            "stats.workoutsCompleted": -1,
            "stats.caloriesBurned": -300
          } 
        }
      );
    }

    return res.json(workout);
  } catch (error) {
    console.error("PATCH exercise status error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   3. YOUTUBE API TUTORIALS
   ────────────────────────────────────────────────────────────────────────── */
// GET Search YouTube Tutorials
router.get("/exercises/tutorial", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const name = req.query.name as string;
    if (!name) {
      return res.status(400).json({ error: "Missing exercise name query parameter." });
    }
    
    const videos = await searchTutorialVideos(name);
    return res.json(videos);
  } catch (error) {
    console.error("GET YouTube tutorial error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   4. NUTRITION ROUTES
   ────────────────────────────────────────────────────────────────────────── */

async function getOrCreateNutrition(clerkId: string, date: string) {
  let nutrition = await NutritionModel.findOne({ clerkId, date });
  if (nutrition) return nutrition;

  const user = await UserModel.findOne({ clerkId });
  const prefs = user?.nutritionPreferences;
  const waterGoal = prefs?.waterGoalConfigured ? prefs.waterGoal : 3.5;

  nutrition = await NutritionModel.create({
    clerkId,
    date,
    water: { consumed: 0, goal: waterGoal },
    calories: { consumed: 0, goal: prefs?.calorieGoal ?? 2100 },
    macros: {
      protein: { amount: 0, goal: prefs?.proteinGoal ?? 180 },
      carbs: { amount: 0, goal: prefs?.carbsGoal ?? 300 },
      fat: { amount: 0, goal: prefs?.fatGoal ?? 120 },
    },
    meals: DEFAULT_MEALS,
  });

  return nutrition;
}

function findMealItem(
  nutrition: Awaited<ReturnType<typeof getOrCreateNutrition>>,
  mealId: string,
  itemIndex: number
) {
  const meal = nutrition!.meals.find((m) => m.id === mealId);
  if (!meal) return { error: "Meal block not found.", status: 404 as const };
  if (itemIndex < 0 || itemIndex >= meal.items.length) {
    return { error: "Food item not found.", status: 404 as const };
  }
  return { meal, item: meal.items[itemIndex] };
}

// GET Nutrition by Date
router.get("/nutrition", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const date = (req.query.date as string) || new Date().toISOString().split("T")[0];

    const nutrition = await getOrCreateNutrition(clerkId!, date);
    const user = await UserModel.findOne({ clerkId }).lean();

    return res.json({
      ...nutrition.toObject(),
      preferences: user?.nutritionPreferences ?? {
        waterGoalConfigured: false,
        waterGoal: 3.5,
        waterWeightKg: null,
        waterActivityLevel: "moderately_active",
        waterClimate: "mild",
        calorieGoal: 2100,
        proteinGoal: 180,
        carbsGoal: 300,
        fatGoal: 120,
      },
    });
  } catch (error) {
    console.error("GET nutrition error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// PUT Nutrition goals (macros + calories + water)
router.put("/nutrition/goals", validateBody(nutritionGoalsSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { date, calories, protein, carbs, fat, water } = req.body;
    const targetDate = date || new Date().toISOString().split("T")[0];

    const nutrition = await getOrCreateNutrition(clerkId!, targetDate);
    if (calories != null) nutrition.calories!.goal = Number(calories);
    if (protein != null) nutrition.macros!.protein!.goal = Number(protein);
    if (carbs != null) nutrition.macros!.carbs!.goal = Number(carbs);
    if (fat != null) nutrition.macros!.fat!.goal = Number(fat);
    if (water != null) nutrition.water!.goal = Number(water);
    await nutrition.save();

    const userUpdate: Record<string, number> = {};
    if (calories != null) userUpdate["nutritionPreferences.calorieGoal"] = Number(calories);
    if (protein != null) userUpdate["nutritionPreferences.proteinGoal"] = Number(protein);
    if (carbs != null) userUpdate["nutritionPreferences.carbsGoal"] = Number(carbs);
    if (fat != null) userUpdate["nutritionPreferences.fatGoal"] = Number(fat);
    if (water != null) userUpdate["nutritionPreferences.waterGoal"] = Number(water);
    if (Object.keys(userUpdate).length) {
      await UserModel.findOneAndUpdate({ clerkId }, { $set: userUpdate });
    }

    return res.json(nutrition);
  } catch (error) {
    console.error("PUT nutrition goals error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// PUT Water intake goal (personalized setup)
router.put("/nutrition/water-goal", validateBody(waterGoalSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { date, weightKg, activityLevel, climate, customGoal } = req.body;
    const targetDate = date || new Date().toISOString().split("T")[0];

    const weight = Number(weightKg);
    if (!weight || weight < 30 || weight > 300) {
      return res.status(400).json({ error: "Enter a valid body weight (30–300 kg)." });
    }

    const validActivity = [
      "sedentary",
      "lightly_active",
      "moderately_active",
      "very_active",
      "extremely_active",
    ];
    const act = validActivity.includes(activityLevel)
      ? (activityLevel as ActivityLevel)
      : "moderately_active";

    const validClimate = ["mild", "hot", "cold"];
    const clim = validClimate.includes(climate) ? (climate as ClimatePreference) : "mild";

    const suggested = suggestWaterGoal(weight, act, clim);
    const goal =
      customGoal != null && Number(customGoal) > 0
        ? Math.round(Number(customGoal) * 10) / 10
        : suggested;

    await UserModel.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          "nutritionPreferences.waterGoalConfigured": true,
          "nutritionPreferences.waterGoal": goal,
          "nutritionPreferences.waterWeightKg": weight,
          "nutritionPreferences.waterActivityLevel": act,
          "nutritionPreferences.waterClimate": clim,
          "stats.weight": weight,
        },
      }
    );

    const nutrition = await getOrCreateNutrition(clerkId!, targetDate);
    nutrition.water!.goal = goal;
    await nutrition.save();

    return res.json({ goal, suggested, nutrition });
  } catch (error) {
    console.error("PUT water goal error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// POST Log Food Item to a Meal
router.post("/nutrition/meals/:mealId", validateBody(logFoodItemSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { mealId } = req.params;
    const { date, name, calories, protein, carbs, fat, amount } = req.body;
    const targetDate = date || new Date().toISOString().split("T")[0];

    const nutrition = await getOrCreateNutrition(clerkId!, targetDate);
    const meal = nutrition.meals.find((m) => m.id === mealId);
    if (!meal) {
      return res.status(404).json({ error: "Meal block not found." });
    }

    meal.items.push({
      name,
      calories: Number(calories || 0),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0),
      amount: amount || "",
    });

    recalculateNutritionTotals(nutrition as any);
    await nutrition.save();
    return res.json(nutrition);
  } catch (error) {
    console.error("POST log food error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// PATCH Edit food item
router.patch(
  "/nutrition/meals/:mealId/items/:itemIndex",
  validateBody(editFoodItemSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clerkId = req.auth?.userId;
      const { mealId, itemIndex } = req.params;
      const { date, name, calories, protein, carbs, fat, amount } = req.body;
      const targetDate = date || new Date().toISOString().split("T")[0];
      const idx = Number(itemIndex);

      const nutrition = await getOrCreateNutrition(clerkId!, targetDate);
      const found = findMealItem(nutrition, mealId, idx);
      if ("error" in found) return res.status(found.status as number).json({ error: found.error });

      if (name != null) found.item.name = name;
      if (calories != null) found.item.calories = Number(calories);
      if (protein != null) found.item.protein = Number(protein);
      if (carbs != null) found.item.carbs = Number(carbs);
      if (fat != null) found.item.fat = Number(fat);
      if (amount != null) found.item.amount = amount;

      recalculateNutritionTotals(nutrition as any);
      await nutrition.save();
      return res.json(nutrition);
    } catch (error) {
      console.error("PATCH food item error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
);

// DELETE food item
router.delete(
  "/nutrition/meals/:mealId/items/:itemIndex",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clerkId = req.auth?.userId;
      const { mealId, itemIndex } = req.params;
      const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
      const idx = Number(itemIndex);

      const nutrition = await getOrCreateNutrition(clerkId!, date);
      const found = findMealItem(nutrition, mealId, idx);
      if ("error" in found) return res.status(found.status as number).json({ error: found.error });

      found.meal.items.splice(idx, 1);
      recalculateNutritionTotals(nutrition as any);
      await nutrition.save();
      return res.json(nutrition);
    } catch (error) {
      console.error("DELETE food item error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
);

// POST Duplicate single food item
router.post(
  "/nutrition/meals/:mealId/items/:itemIndex/duplicate",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clerkId = req.auth?.userId;
      const { mealId, itemIndex } = req.params;
      const { date } = req.body;
      const targetDate = date || new Date().toISOString().split("T")[0];
      const idx = Number(itemIndex);

      const nutrition = await getOrCreateNutrition(clerkId!, targetDate);
      const found = findMealItem(nutrition, mealId, idx);
      if ("error" in found) return res.status(found.status as number).json({ error: found.error });

      const copy = {
        name: found.item.name,
        calories: found.item.calories ?? 0,
        protein: found.item.protein ?? 0,
        carbs: found.item.carbs ?? 0,
        fat: found.item.fat ?? 0,
        amount: found.item.amount,
      };
      found.meal.items.push(copy);

      recalculateNutritionTotals(nutrition as any);
      await nutrition.save();
      return res.json(nutrition);
    } catch (error) {
      console.error("POST duplicate food item error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
);

// POST Duplicate entire meal (all items)
router.post(
  "/nutrition/meals/:mealId/duplicate",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clerkId = req.auth?.userId;
      const { mealId } = req.params;
      const { date } = req.body;
      const targetDate = date || new Date().toISOString().split("T")[0];

      const nutrition = await getOrCreateNutrition(clerkId!, targetDate);
      const meal = nutrition.meals.find((m) => m.id === mealId);
      if (!meal) {
        return res.status(404).json({ error: "Meal block not found." });
      }
      if (meal.items.length === 0) {
        return res.status(400).json({ error: "No items to duplicate in this meal." });
      }

      const copies = meal.items.map((item) => ({
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        amount: item.amount,
      }));
      meal.items.push(...copies);

      recalculateNutritionTotals(nutrition as any);
      await nutrition.save();
      return res.json(nutrition);
    } catch (error) {
      console.error("POST duplicate meal error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
);

// POST Log Water Intake
router.post("/nutrition/water", validateBody(logWaterSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { date, amount } = req.body;
    const targetDate = date || new Date().toISOString().split("T")[0];

    const nutrition = await getOrCreateNutrition(clerkId!, targetDate);
    nutrition.water!.consumed = Math.round((nutrition.water!.consumed + Number(amount || 0)) * 100) / 100;
    await nutrition.save();

    await UserModel.findOneAndUpdate(
      { clerkId },
      { $set: { "stats.waterIntake": nutrition.water!.consumed } }
    );

    return res.json(nutrition);
  } catch (error) {
    console.error("POST log water error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   5. PLANNER ROUTES
   ────────────────────────────────────────────────────────────────────────── */
// GET Planner Week Schedule
router.get("/planner", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    
    let days = await PlannerDayModel.find({ clerkId }).sort({ date: 1 });
    
    // If empty, initialize the weekly planner calendar with default configuration
    if (days.length === 0) {
      const defaultPlannerData = [
        { date: "2026-01-19", dayLabel: "Mon", workouts: [{ id: "pb1", name: "Push Day", type: "Strength", duration: 0, color: "#39E609", status: "planned" }] },
        { date: "2026-01-20", dayLabel: "Tue", workouts: [{ id: "pb2", name: "Rest Day", type: "Recovery", duration: 0, color: "#6b7280", status: "rest" }] },
        { date: "2026-01-21", dayLabel: "Wed", workouts: [{ id: "pb3", name: "Rest Day", type: "Recovery", duration: 0, color: "#6b7280", status: "rest" }] },
        { date: "2026-01-22", dayLabel: "Thu", workouts: [{ id: "pb4", name: "Leg Day", type: "Strength", duration: 0, color: "#f97316", status: "planned" }] },
        { date: "2026-01-23", dayLabel: "Fri", workouts: [{ id: "pb5", name: "Rest Day", type: "Recovery", duration: 0, color: "#6b7280", status: "rest" }] },
        { date: "2026-01-24", dayLabel: "Sat", workouts: [{ id: "pb7", name: "Full Body", type: "Strength", duration: 0, color: "#39E609", status: "planned" }] },
        { date: "2026-01-25", dayLabel: "Sun", workouts: [{ id: "pb8", name: "Rest Day", type: "Recovery", duration: 0, color: "#6b7280", status: "rest" }] },
      ];

      const initializedDays = [];
      for (const d of defaultPlannerData) {
        const item = await PlannerDayModel.create({
          clerkId,
          date: d.date,
          dayLabel: d.dayLabel,
          workouts: d.workouts
        });
        initializedDays.push(item);
      }
      days = initializedDays;
    }

    return res.json(days);
  } catch (error) {
    console.error("GET planner error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// POST Add Scheduled Workout Plan
router.post("/planner/:dayLabel/workouts", validateBody(plannerWorkoutSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { dayLabel } = req.params; // "Mon", "Tue", etc.
    const { name, type, duration, color } = req.body;

    let plannerDay = await PlannerDayModel.findOne({ clerkId, dayLabel });
    if (!plannerDay) {
      plannerDay = await PlannerDayModel.create({
        clerkId,
        date: new Date().toISOString().split("T")[0],
        dayLabel,
        workouts: []
      });
    }

    const newWorkout = {
      id: "pb_" + Math.random().toString(36).substring(2, 9),
      name,
      type,
      duration: Number(duration || 0),
      color: color || "#39E609",
      status: type === "Recovery" ? "rest" : "planned"
    };

    // Replace if rest day, or add
    if (newWorkout.status === "rest") {
      plannerDay.workouts = [newWorkout] as any;
    } else {
      // Remove default rest days first
      plannerDay.workouts = plannerDay.workouts.filter(w => w.status !== "rest") as any;
      plannerDay.workouts.push(newWorkout as any);
    }

    await plannerDay.save();
    return res.json(plannerDay);
  } catch (error) {
    console.error("POST planner workout error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE Workout Plan from Planner
router.delete("/planner/:dayLabel/workouts/:workoutId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { dayLabel, workoutId } = req.params;

    const plannerDay = await PlannerDayModel.findOne({ clerkId, dayLabel });
    if (!plannerDay) {
      return res.status(404).json({ error: "Planner day not found." });
    }

    plannerDay.workouts = plannerDay.workouts.filter(w => w.id !== workoutId) as any;
    
    // Default back to rest if empty
    if (plannerDay.workouts.length === 0) {
      plannerDay.workouts.push({
        id: "pb_" + Math.random().toString(36).substring(2, 9),
        name: "Rest Day",
        type: "Recovery",
        duration: 0,
        color: "#6b7280",
        status: "rest"
      } as any);
    }

    await plannerDay.save();
    return res.json(plannerDay);
  } catch (error) {
    console.error("DELETE planner workout error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   6. COMMUNITY POST ROUTES
   ────────────────────────────────────────────────────────────────────────── */
// GET All Community Posts
router.get("/community/posts", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    let posts = await PostModel.find({}).sort({ createdAt: -1 });

    if (posts.length === 0) {
      // Seed default community posts
      const defaultPosts = [
        {
          clerkId: "u_mock_1",
          author: { name: "Kurt Thornhill", avatar: "/avatars/kurt.jpg", badge: "Pro" },
          content: "Just crushed my first PR in 8 years! 225 lbs on bench press 💪 The structured program on GymRat Hub completely changed my approach to training.",
          tags: ["PR", "BenchPress", "Strength"],
          likes: ["u_mock_2"],
          commentsCount: 94,
          shares: 23,
          type: "achievement"
        },
        {
          clerkId: "u_mock_2",
          author: { name: "Maria Fitness", avatar: "/avatars/maria.jpg", badge: "Ambassador" },
          content: "Day 21 of the 30-day challenge! Feeling incredible 🔥 Who else is crushing it this week? Drop a 💪 below!",
          tags: ["Consistency", "30DayChallenge"],
          likes: [clerkId || "u_mock_1"],
          commentsCount: 156,
          shares: 44,
          type: "progress"
        }
      ];

      posts = await PostModel.create(defaultPosts);
    }

    // Map models to frontend layout, adding `liked` flag
    const mappedPosts = posts.map(post => {
      const plain = post.toObject();
      return {
        ...plain,
        id: plain._id.toString(),
        liked: clerkId ? plain.likes.includes(clerkId) : false,
        likes: plain.likes.length,
        author: {
          ...plain.author,
          id: plain.clerkId,
          isFollowing: false
        }
      };
    });

    return res.json(mappedPosts);
  } catch (error) {
    console.error("GET posts error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// POST Create Community Post
router.post("/community/posts", validateBody(createPostSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { content, tags, imageUrl, type } = req.body;

    const user = await UserModel.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const post = await PostModel.create({
      clerkId,
      author: {
        name: user.name,
        avatar: user.avatar || "",
        badge: user.plan === "elite" ? "Elite" : user.plan === "pro" ? "Pro" : "",
      },
      content,
      tags: tags || [],
      imageUrl: imageUrl || "",
      type: type || "general",
      likes: [],
      commentsCount: 0,
      shares: 0
    });

    return res.json({
      ...post.toObject(),
      id: post._id.toString(),
      liked: false,
      likes: 0
    });
  } catch (error) {
    console.error("POST post error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// POST Toggle Like Post
router.post("/community/posts/:postId/like", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId || "";
    const { postId } = req.params;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Community post not found." });
    }

    const likeIdx = post.likes.indexOf(clerkId);
    if (likeIdx > -1) {
      // Unlike
      post.likes.splice(likeIdx, 1);
    } else {
      // Like
      post.likes.push(clerkId);
    }

    await post.save();

    return res.json({
      id: post._id.toString(),
      liked: post.likes.includes(clerkId),
      likes: post.likes.length
    });
  } catch (error) {
    console.error("POST like error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   7. CHALLENGES ROUTES
   ────────────────────────────────────────────────────────────────────────── */
// GET User Challenges
router.get("/challenges", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    let challenges = await UserChallengeModel.find({ clerkId });

    if (challenges.length === 0) {
      // Populate defaults
      const defaults = [
        { challengeId: "c1", name: "30 Day Beast Challenge", description: "Complete 30 consecutive days of training", category: "Consistency", progress: 70, xpReward: 500, endDate: "2026-02-21", participants: 12847, status: "active", badgeEmoji: "🏆" },
        { challengeId: "c2", name: "100K Steps", description: "Hit 100,000 steps this week", category: "Cardio", progress: 45, xpReward: 200, endDate: "2026-01-28", participants: 8432, status: "active", badgeEmoji: "👟" },
        { challengeId: "c3", name: "Protein King", description: "Hit your protein goal 7 days in a row", category: "Nutrition", progress: 85, xpReward: 300, endDate: "2026-01-27", participants: 5210, status: "active", badgeEmoji: "💪" },
      ];

      const mapped = [];
      for (const item of defaults) {
        const doc = await UserChallengeModel.create({
          clerkId,
          ...item
        });
        mapped.push(doc);
      }
      challenges = mapped;
    }

    return res.json(challenges.map(c => ({
      id: c.challengeId,
      name: c.name,
      description: c.description,
      category: c.category,
      progress: c.progress,
      xpReward: c.xpReward,
      endDate: c.endDate,
      participants: c.participants,
      status: c.status,
      badgeEmoji: c.badgeEmoji
    })));
  } catch (error) {
    console.error("GET challenges error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// POST Join Challenge
router.post("/challenges/:challengeId/join", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { challengeId } = req.params;

    const challenge = await UserChallengeModel.findOneAndUpdate(
      { clerkId, challengeId },
      { $set: { status: "joined" } },
      { new: true }
    );

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found." });
    }

    return res.json(challenge);
  } catch (error) {
    console.error("POST join challenge error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;