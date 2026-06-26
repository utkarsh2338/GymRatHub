import WorkoutPlanModel from "../models/Workout";
import WorkoutTemplateModel from "../models/WorkoutTemplate";
import UserModel from "../models/User";

export function getFullDayName(): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

export function getShortDayLabel(): string {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return labels[new Date().getDay()];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

type TemplateExercise = {
  exerciseId?: string;
  name: string;
  category: string;
  muscleGroups?: string[];
  targetSets?: number;
  targetReps?: string;
  order?: number;
  supersetGroupId?: string | null;
};

export function mapTemplateExercisesToWorkout(
  exercises: TemplateExercise[],
  existing: { id?: string; name: string; status?: string }[] = []
) {
  const statusByKey = new Map(
    existing.map((e) => [e.name.toLowerCase(), e.status ?? "pending"])
  );
  const idByKey = new Map(existing.map((e) => [e.name.toLowerCase(), e.id]));

  return exercises.map((ex, i) => {
    const key = ex.name.toLowerCase();
    return {
      id: idByKey.get(key) ?? (ex.exerciseId ? `lib_${ex.exerciseId}` : makeId("ex")),
      name: ex.name,
      category: ex.category,
      muscleGroups: ex.muscleGroups ?? [],
      difficulty: "Intermediate",
      equipment: [] as string[],
      sets: ex.targetSets ?? 3,
      reps: String(ex.targetReps ?? "10"),
      instructions: [] as string[],
      status: (statusByKey.get(key) as "pending" | "done") ?? "pending",
      order: ex.order ?? i,
    };
  });
}

export async function resolveActiveTemplateId(clerkId: string): Promise<string | null> {
  const user = await UserModel.findOne({ clerkId });
  if (user?.activeWorkoutTemplateId) {
    const exists = await WorkoutTemplateModel.findOne({
      _id: user.activeWorkoutTemplateId,
      clerkId,
    });
    if (exists) return String(exists._id);
  }

  const latest = await WorkoutTemplateModel.findOne({ clerkId }).sort({ updatedAt: -1 });
  if (latest) {
    await UserModel.findOneAndUpdate(
      { clerkId },
      { $set: { activeWorkoutTemplateId: latest._id } }
    );
    return String(latest._id);
  }
  return null;
}

export async function syncTodayWorkoutFromTemplate(clerkId: string) {
  const templateId = await resolveActiveTemplateId(clerkId);
  const dayFull = getFullDayName();
  const dayShort = getShortDayLabel();

  let workout = await WorkoutPlanModel.findOne({ clerkId, day: dayFull });

  if (!templateId) {
    return workout;
  }

  const template = await WorkoutTemplateModel.findOne({ _id: templateId, clerkId });
  if (!template) {
    return workout;
  }

  const templateDay = template.days.find((d) => d.dayLabel === dayShort);

  if (!templateDay || !templateDay.exercises?.length) {
    if (!workout) {
      workout = await WorkoutPlanModel.create({
        clerkId,
        name: templateDay?.name ?? "Rest Day",
        day: dayFull,
        duration: 0,
        exercises: [],
      });
    }
    return workout;
  }

  const mapped = mapTemplateExercisesToWorkout(
    templateDay.exercises as TemplateExercise[],
    workout?.exercises?.map((e) => ({
      id: e.id,
      name: e.name,
      status: e.status,
    })) ?? []
  );

  if (workout) {
    workout.name = templateDay.name;
    workout.duration = Math.max(templateDay.exercises.length * 12, 45);
    workout.exercises = mapped as unknown as typeof workout.exercises;
    await workout.save();
  } else {
    workout = await WorkoutPlanModel.create({
      clerkId,
      name: templateDay.name,
      day: dayFull,
      duration: Math.max(templateDay.exercises.length * 12, 45),
      exercises: mapped,
    });
  }

  return workout;
}

export async function buildDashboardWorkoutSchedule(clerkId: string) {
  const templateId = await resolveActiveTemplateId(clerkId);
  const dayShort = getShortDayLabel();
  const dayFull = getFullDayName();

  const templates = await WorkoutTemplateModel.find({ clerkId })
    .sort({ updatedAt: -1 })
    .lean();

  let activeTemplate = null;
  if (templateId) {
    activeTemplate = await WorkoutTemplateModel.findOne({ _id: templateId, clerkId }).lean();
  }

  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const week = weekLabels.map((dayLabel) => {
    const day = activeTemplate?.days?.find((d) => d.dayLabel === dayLabel);
    const exercises = day?.exercises ?? [];
    const isToday = dayLabel === dayShort;
    const isRest = exercises.length === 0;

    return {
      dayLabel,
      name: day?.name ?? (isRest ? "Rest" : "No workout"),
      isToday,
      isRest,
      exerciseCount: exercises.length,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        category: ex.category,
        muscleGroups: ex.muscleGroups ?? [],
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        supersetGroupId: ex.supersetGroupId ?? null,
      })),
    };
  });

  const todayWorkout = await syncTodayWorkoutFromTemplate(clerkId);

  return {
    activeTemplate: activeTemplate
      ? {
          _id: String(activeTemplate._id),
          name: activeTemplate.name,
          goalType: activeTemplate.goalType,
          planType: activeTemplate.planType,
        }
      : null,
    templates: templates.map((t) => ({
      _id: String(t._id),
      name: t.name,
      goalType: t.goalType,
      exerciseCount: t.days.reduce((s, d) => s + (d.exercises?.length ?? 0), 0),
    })),
    todayDayLabel: dayShort,
    todayDayName: dayFull,
    week,
    todayWorkout,
  };
}