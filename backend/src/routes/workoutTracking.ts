import { Router, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import WorkoutTemplateModel from "../models/WorkoutTemplate";
import WorkoutSessionModel from "../models/WorkoutSession";
import WorkoutPlanModel from "../models/Workout";
import PlannerDayModel from "../models/Planner";
import UserModel from "../models/User";
import { PRESET_PLANS, getPresetByKey } from "../constants/presetPlans";
import {
  sessionTotalVolume,
  detectAndSavePRs,
  generateWorkoutInsights,
  updateStreakAndXp,
  buildProgressAnalytics,
} from "../services/workoutProgress";
import { buildDashboardWorkoutSchedule } from "../services/workoutPlanSync";

const router = Router();

function getDayName(): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

function getTodayDayLabel(): string {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return labels[new Date().getDay()];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function initLoggedSets(targetSets: number) {
  return Array.from({ length: Math.max(1, targetSets) }, (_, i) => ({
    setNumber: i + 1,
    weightKg: 0,
    reps: 0,
    completed: false,
    isWarmup: false,
    isDropSet: false,
  }));
}

function exercisesFromTemplateDay(
  exercises: {
    exerciseId?: string;
    name: string;
    category: string;
    muscleGroups?: string[];
    targetSets?: number;
    targetReps?: string;
    order?: number;
    supersetGroupId?: string | null;
  }[]
) {
  return exercises.map((ex, i) => ({
    id: makeId("ex"),
    exerciseId: ex.exerciseId ?? "",
    name: ex.name,
    category: ex.category,
    muscleGroups: ex.muscleGroups ?? [],
    targetSets: ex.targetSets ?? 3,
    targetReps: ex.targetReps ?? "10",
    loggedSets: initLoggedSets(ex.targetSets ?? 3),
    notes: "",
    status: "pending" as const,
    order: ex.order ?? i,
    supersetGroupId: ex.supersetGroupId ?? null,
  }));
}

/* ─── Presets ─── */
router.get("/workout-templates/presets", (_req: AuthenticatedRequest, res: Response) => {
  return res.json(
    PRESET_PLANS.map((p) => ({
      presetKey: p.presetKey,
      name: p.name,
      description: p.description,
      goalType: p.goalType,
      dayCount: p.days.filter((d) => d.exercises.length > 0).length,
    }))
  );
});

router.get("/workout-templates/presets/:presetKey", (req: AuthenticatedRequest, res: Response) => {
  const preset = getPresetByKey(req.params.presetKey);
  if (!preset) return res.status(404).json({ error: "Preset not found." });
  return res.json(preset);
});

/* ─── Custom templates CRUD ─── */
router.get("/workout-templates", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const templates = await WorkoutTemplateModel.find({ clerkId }).sort({ updatedAt: -1 });
    return res.json(templates);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/workout-templates", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { name, description, goalType, days } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Plan name is required." });

    const template = await WorkoutTemplateModel.create({
      clerkId,
      name: name.trim(),
      description: description ?? "",
      goalType: goalType ?? "muscle_gain",
      planType: "custom",
      days: days ?? [],
    });
    return res.status(201).json(template);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.put("/workout-templates/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const template = await WorkoutTemplateModel.findOneAndUpdate(
      { _id: req.params.id, clerkId },
      { $set: req.body },
      { new: true }
    );
    if (!template) return res.status(404).json({ error: "Template not found." });
    return res.json(template);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.delete("/workout-templates/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const result = await WorkoutTemplateModel.deleteOne({ _id: req.params.id, clerkId });
    if (!result.deletedCount) return res.status(404).json({ error: "Template not found." });
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/workout-templates/:id/duplicate", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const original = await WorkoutTemplateModel.findOne({ _id: req.params.id, clerkId });
    if (!original) return res.status(404).json({ error: "Template not found." });

    const copy = await WorkoutTemplateModel.create({
      clerkId,
      name: `${original.name} (Copy)`,
      description: original.description,
      goalType: original.goalType,
      planType: "custom",
      days: original.days,
    });
    return res.status(201).json(copy);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/workout-templates/from-preset", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { presetKey } = req.body;
    const preset = getPresetByKey(presetKey);
    if (!preset) return res.status(404).json({ error: "Preset not found." });

    const template = await WorkoutTemplateModel.create({
      clerkId,
      name: preset.name,
      description: preset.description,
      goalType: preset.goalType,
      planType: "preset",
      presetKey: preset.presetKey,
      days: preset.days,
    });

    await UserModel.findOneAndUpdate(
      { clerkId },
      { $set: { activeWorkoutTemplateId: template._id } }
    );

    return res.status(201).json(template);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.put("/workout-templates/:id/activate", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const template = await WorkoutTemplateModel.findOne({ _id: req.params.id, clerkId });
    if (!template) return res.status(404).json({ error: "Template not found." });

    await UserModel.findOneAndUpdate(
      { clerkId },
      { $set: { activeWorkoutTemplateId: template._id } }
    );

    const schedule = await buildDashboardWorkoutSchedule(clerkId!);
    return res.json(schedule);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/workouts/dashboard-schedule", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const schedule = await buildDashboardWorkoutSchedule(clerkId!);
    return res.json(schedule);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/workout-templates/:id/apply-week", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const template = await WorkoutTemplateModel.findOne({ _id: req.params.id, clerkId });
    if (!template) return res.status(404).json({ error: "Template not found." });

    for (const day of template.days) {
      if (!day.exercises?.length) continue;
      let plannerDay = await PlannerDayModel.findOne({ clerkId, dayLabel: day.dayLabel });
      if (!plannerDay) {
        plannerDay = await PlannerDayModel.create({
          clerkId,
          date: new Date().toISOString().split("T")[0],
          dayLabel: day.dayLabel,
          workouts: [],
        });
      }
      plannerDay.workouts = plannerDay.workouts.filter((w) => w.status !== "rest") as any;
      (plannerDay.workouts as unknown as Array<Record<string, unknown>>).push({
        id: makeId("pb"),
        name: day.name,
        type: "Strength",
        duration: day.exercises.length * 12,
        color: "#39E609",
        status: "planned",
      });
      await plannerDay.save();
    }

    await UserModel.findOneAndUpdate(
      { clerkId },
      { $set: { activeWorkoutTemplateId: template._id } }
    );

    return res.json({ success: true, message: "Weekly schedule updated." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ─── Sessions ─── */
router.get("/workout-sessions/active", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const session = await WorkoutSessionModel.findOne({ clerkId, status: "in_progress" }).sort({
      startedAt: -1,
    });
    return res.json(session ?? null);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/workout-sessions", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { templateId, dayLabel, source } = req.body;

    const existing = await WorkoutSessionModel.findOne({ clerkId, status: "in_progress" });
    if (existing) {
      return res.status(409).json({
        error: "You already have an active workout session.",
        sessionId: existing._id,
      });
    }

    let planName = "Workout";
    let exercises: ReturnType<typeof exercisesFromTemplateDay> = [];

    if (templateId) {
      const template = await WorkoutTemplateModel.findOne({ _id: templateId, clerkId });
      if (!template) return res.status(404).json({ error: "Template not found." });

      const label = dayLabel ?? getTodayDayLabel();
      const day = template.days.find((d) => d.dayLabel === label) ?? template.days[0];
      if (!day?.exercises?.length) {
        return res.status(400).json({ error: "No exercises for this day in the plan." });
      }
      planName = day.name;
      exercises = exercisesFromTemplateDay(day.exercises);
    } else if (source === "today") {
      const todayLabel = getDayName();
      const workout = await WorkoutPlanModel.findOne({ clerkId, day: todayLabel });
      if (!workout) {
        return res.status(404).json({ error: "No workout plan for today. Set up your planner first." });
      }
      planName = workout.name;
      exercises = workout.exercises.map((ex, i) => ({
        id: ex.id || makeId("ex"),
        exerciseId: "",
        name: ex.name,
        category: ex.category,
        muscleGroups: ex.muscleGroups ?? [],
        targetSets: ex.sets ?? 3,
        targetReps: String(ex.reps ?? "10"),
        loggedSets: initLoggedSets(ex.sets ?? 3),
        notes: "",
        status: "pending" as const,
        order: i,
        supersetGroupId: null,
      }));
    } else {
      return res.status(400).json({ error: "Provide templateId or source: 'today'." });
    }

    const session = await WorkoutSessionModel.create({
      clerkId,
      templateId: templateId ?? null,
      planName,
      status: "in_progress",
      exercises,
    });

    return res.status(201).json(session);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/workout-sessions/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const session = await WorkoutSessionModel.findOne({ _id: req.params.id, clerkId });
    if (!session) return res.status(404).json({ error: "Session not found." });
    return res.json(session);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.patch("/workout-sessions/:id/exercises/:exerciseId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { loggedSets, notes, status, supersetGroupId } = req.body;

    const session = await WorkoutSessionModel.findOne({
      _id: req.params.id,
      clerkId,
      status: "in_progress",
    });
    if (!session) return res.status(404).json({ error: "Active session not found." });

    const exercise = session.exercises.find((e) => e.id === req.params.exerciseId);
    if (!exercise) return res.status(404).json({ error: "Exercise not found." });

    if (loggedSets !== undefined) exercise.loggedSets = loggedSets;
    if (notes !== undefined) exercise.notes = notes;
    if (status !== undefined) exercise.status = status;
    if (supersetGroupId !== undefined) exercise.supersetGroupId = supersetGroupId;

    session.totalVolumeKg = sessionTotalVolume(session.exercises);
    await session.save();
    return res.json(session);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/workout-sessions/:id/link-superset", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { exerciseIds } = req.body as { exerciseIds: string[] };

    if (!Array.isArray(exerciseIds) || exerciseIds.length < 2) {
      return res.status(400).json({ error: "Select at least 2 exercises for a superset." });
    }

    const session = await WorkoutSessionModel.findOne({
      _id: req.params.id,
      clerkId,
      status: "in_progress",
    });
    if (!session) return res.status(404).json({ error: "Active session not found." });

    const groupId = makeId("ss");
    for (const ex of session.exercises) {
      if (exerciseIds.includes(ex.id)) {
        ex.supersetGroupId = groupId;
      }
    }
    await session.save();
    return res.json(session);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/workout-sessions/:id/unlink-superset", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const { supersetGroupId } = req.body as { supersetGroupId: string };

    const session = await WorkoutSessionModel.findOne({
      _id: req.params.id,
      clerkId,
      status: "in_progress",
    });
    if (!session) return res.status(404).json({ error: "Active session not found." });

    for (const ex of session.exercises) {
      if (ex.supersetGroupId === supersetGroupId) {
        ex.supersetGroupId = null;
      }
    }
    await session.save();
    return res.json(session);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/workout-sessions/:id/complete", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const session = await WorkoutSessionModel.findOne({
      _id: req.params.id,
      clerkId,
      status: "in_progress",
    });
    if (!session) return res.status(404).json({ error: "Active session not found." });

    const started = new Date(session.startedAt).getTime();
    const durationMinutes = Math.max(1, Math.round((Date.now() - started) / 60000));
    session.durationMinutes = durationMinutes;
    session.status = "completed";
    session.completedAt = new Date();
    session.totalVolumeKg = sessionTotalVolume(session.exercises);

    const prevSession = await WorkoutSessionModel.findOne({
      clerkId,
      status: "completed",
      _id: { $ne: session._id },
    }).sort({ completedAt: -1 });

    const newPRs = await detectAndSavePRs(
      clerkId!,
      String(session._id),
      session.exercises.map((e) => ({
        name: e.name,
        category: e.category,
        loggedSets: e.loggedSets,
      }))
    );
    session.set(
      "newPRs",
      newPRs.map((p) => ({
        type: p.type,
        exerciseName: p.exerciseName,
        value: p.value,
        label: p.label,
      }))
    );

    const user = await UserModel.findOne({ clerkId });
    const streak = user?.stats?.streak ?? 0;
    session.aiInsights = generateWorkoutInsights(
      session.exercises,
      session.totalVolumeKg,
      streak,
      prevSession?.totalVolumeKg
    );

    await session.save();

    const gamification = await updateStreakAndXp(
      clerkId!,
      session.totalVolumeKg,
      newPRs.length
    );

    if (newPRs.length > 0 && user) {
      const badges = (user as { badges?: { id: string; name: string; earnedAt: string }[] }).badges ?? [];
      for (const pr of newPRs) {
        const badgeId = `pr_${pr.type}_${pr.exerciseName}`.replace(/\s/g, "_").slice(0, 40);
        if (!badges.find((b) => b.id === badgeId)) {
          badges.push({
            id: badgeId,
            name: pr.label,
            earnedAt: new Date().toISOString(),
          });
        }
      }
      await UserModel.findOneAndUpdate({ clerkId }, { $set: { badges } });
    }

    return res.json({
      session,
      newPRs,
      gamification,
      aiInsights: session.aiInsights,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.delete("/workout-sessions/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    await WorkoutSessionModel.findOneAndUpdate(
      { _id: req.params.id, clerkId },
      { $set: { status: "abandoned", completedAt: new Date() } }
    );
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ─── Progress analytics ─── */
router.get("/progress/analytics", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const analytics = await buildProgressAnalytics(clerkId!);
    const user = await UserModel.findOne({ clerkId }).lean();
    return res.json({
      ...analytics,
      stats: user?.stats,
      streak: user?.stats?.streak ?? 0,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/progress/prs", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const analytics = await buildProgressAnalytics(clerkId!);
    return res.json(analytics.personalRecords);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;