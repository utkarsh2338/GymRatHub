import PersonalRecordModel from "../models/PersonalRecord";
import WorkoutSessionModel from "../models/WorkoutSession";
import UserModel from "../models/User";

export function setVolume(weightKg: number, reps: number): number {
  if (!weightKg || !reps) return 0;
  return Math.round(weightKg * reps);
}

export function exerciseVolume(
  loggedSets: { weightKg?: number; reps?: number; completed?: boolean }[]
): number {
  return loggedSets
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + setVolume(s.weightKg ?? 0, s.reps ?? 0), 0);
}

export function sessionTotalVolume(
  exercises: { loggedSets: { weightKg?: number; reps?: number; completed?: boolean }[] }[]
): number {
  return exercises.reduce((sum, ex) => sum + exerciseVolume(ex.loggedSets), 0);
}

/** Brzycki formula for estimated 1RM */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (36 / (37 - reps)) * 10) / 10;
}

interface DetectedPR {
  type: string;
  exerciseName: string;
  value: number;
  label: string;
  weightKg: number;
  reps: number;
  volumeKg: number;
}

type StoredPR = {
  exerciseName: string;
  recordType: string;
  weightKg?: number;
  reps?: number;
  volumeKg?: number;
  achievedAt?: Date;
};

/** One display card per exercise — prefer max_weight over max_volume */
export function dedupePersonalRecordsForDisplay<T extends StoredPR>(records: T[]): T[] {
  const byExercise = new Map<string, T>();
  const typePriority: Record<string, number> = {
    max_weight: 2,
    max_volume: 1,
    max_reps: 0,
    session_volume: -1,
  };

  for (const pr of records) {
    if (!pr.exerciseName || pr.exerciseName === "_session_") continue;
    const key = pr.exerciseName.toLowerCase();
    const existing = byExercise.get(key);
    if (!existing) {
      byExercise.set(key, pr);
      continue;
    }
    const prPriority = typePriority[pr.recordType] ?? 0;
    const existingPriority = typePriority[existing.recordType] ?? 0;
    if (prPriority > existingPriority) {
      byExercise.set(key, pr);
    } else if (prPriority === existingPriority && (pr.weightKg ?? 0) > (existing.weightKg ?? 0)) {
      byExercise.set(key, pr);
    }
  }

  return Array.from(byExercise.values()).sort(
    (a, b) => new Date(b.achievedAt ?? 0).getTime() - new Date(a.achievedAt ?? 0).getTime()
  );
}

export async function detectAndSavePRs(
  clerkId: string,
  sessionId: string,
  exercises: {
    name: string;
    category: string;
    loggedSets: { weightKg?: number; reps?: number; completed?: boolean }[];
  }[]
): Promise<DetectedPR[]> {
  const newPRs: DetectedPR[] = [];

  for (const ex of exercises) {
    const completed = ex.loggedSets.filter((s) => s.completed && (s.weightKg ?? 0) > 0);
    if (!completed.length) continue;

    const maxWeightSet = completed.reduce((best, s) =>
      (s.weightKg ?? 0) > (best.weightKg ?? 0) ? s : best
    );
    const maxWeight = maxWeightSet.weightKg ?? 0;
    const maxRepsAtWeight = maxWeightSet.reps ?? 0;
    const vol = exerciseVolume(ex.loggedSets);

    const existingMaxWeight = await PersonalRecordModel.findOne({
      clerkId,
      exerciseName: ex.name,
      recordType: "max_weight",
    }).sort({ weightKg: -1 });

    if (!existingMaxWeight || maxWeight > existingMaxWeight.weightKg) {
      await PersonalRecordModel.findOneAndUpdate(
        { clerkId, exerciseName: ex.name, recordType: "max_weight" },
        {
          $set: {
            category: ex.category,
            weightKg: maxWeight,
            reps: maxRepsAtWeight,
            volumeKg: setVolume(maxWeight, maxRepsAtWeight),
            sessionId,
            achievedAt: new Date(),
          },
        },
        { upsert: true }
      );
      newPRs.push({
        type: "max_weight",
        exerciseName: ex.name,
        value: maxWeight,
        label: `New max weight: ${maxWeight}kg × ${maxRepsAtWeight}`,
        weightKg: maxWeight,
        reps: maxRepsAtWeight,
        volumeKg: vol,
      });
    }

    const existingVolume = await PersonalRecordModel.findOne({
      clerkId,
      exerciseName: ex.name,
      recordType: "max_volume",
    }).sort({ volumeKg: -1 });

    if (!existingVolume || vol > existingVolume.volumeKg) {
      await PersonalRecordModel.findOneAndUpdate(
        { clerkId, exerciseName: ex.name, recordType: "max_volume" },
        {
          $set: {
            category: ex.category,
            weightKg: maxWeight,
            reps: maxRepsAtWeight,
            volumeKg: vol,
            sessionId,
            achievedAt: new Date(),
          },
        },
        { upsert: true }
      );
      newPRs.push({
        type: "max_volume",
        exerciseName: ex.name,
        value: vol,
        label: `New volume PR: ${vol}kg total`,
        weightKg: maxWeight,
        reps: maxRepsAtWeight,
        volumeKg: vol,
      });
    }
  }

  const sessionVol = sessionTotalVolume(exercises);
  const existingSessionVol = await PersonalRecordModel.findOne({
    clerkId,
    exerciseName: "_session_",
    recordType: "session_volume",
  }).sort({ volumeKg: -1 });

  if (!existingSessionVol || sessionVol > existingSessionVol.volumeKg) {
    await PersonalRecordModel.findOneAndUpdate(
      { clerkId, exerciseName: "_session_", recordType: "session_volume" },
      {
        $set: {
          category: "Full Body",
          volumeKg: sessionVol,
          sessionId,
          achievedAt: new Date(),
        },
      },
      { upsert: true }
    );
    if (sessionVol > 0) {
      newPRs.push({
        type: "session_volume",
        exerciseName: "Workout",
        value: sessionVol,
        label: `Session volume PR: ${sessionVol}kg`,
        weightKg: 0,
        reps: 0,
        volumeKg: sessionVol,
      });
    }
  }

  return newPRs;
}

export function generateWorkoutInsights(
  exercises: { name: string; category: string; loggedSets: { weightKg?: number; reps?: number; completed?: boolean }[] }[],
  totalVolumeKg: number,
  streak: number,
  previousSessionVolume?: number
): string[] {
  const insights: string[] = [];

  if (previousSessionVolume && totalVolumeKg > 0) {
    const pct = Math.round(((totalVolumeKg - previousSessionVolume) / previousSessionVolume) * 100);
    if (pct > 0) insights.push(`Total training volume increased by ${pct}% compared to your last session.`);
    else if (pct < 0) insights.push(`Volume was ${Math.abs(pct)}% lower than last time — recovery or deload may help.`);
  }

  const top = exercises
    .map((e) => ({ name: e.name, vol: exerciseVolume(e.loggedSets) }))
    .sort((a, b) => b.vol - a.vol)[0];
  if (top?.vol) {
    insights.push(`${top.name} contributed the most volume today (${top.vol}kg).`);
  }

  if (streak >= 7) {
    insights.push(`You have maintained a ${streak}-day workout streak. Keep it up!`);
  } else if (streak > 0) {
    insights.push(`${streak}-day streak — consistency builds results.`);
  }

  const categories = exercises.map((e) => e.category);
  const chestVol = categories.filter((c) => c === "Chest").length;
  if (chestVol >= 2) {
    insights.push("Heavy chest focus today — allow 48–72h recovery before your next push session.");
  }

  if (insights.length === 0) {
    insights.push("Great work logging your session. Every rep counts toward your goals.");
  }

  return insights;
}

export async function updateStreakAndXp(clerkId: string, volumeKg: number, prCount: number) {
  const user = await UserModel.findOne({ clerkId });
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];
  const last = (user as { lastWorkoutDate?: string }).lastWorkoutDate;
  let streak = user.stats.streak ?? 0;

  if (last) {
    const lastDate = new Date(last);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) {
      // same day — keep streak
    } else if (diffDays === 1) {
      streak += 1;
    } else {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  const xpGain = Math.min(500, Math.round(volumeKg / 20) + prCount * 50 + 25);
  const currentXp = (user as { xp?: number }).xp ?? 0;
  const newXp = currentXp + xpGain;
  const level = Math.floor(newXp / 500) + 1;

  await UserModel.findOneAndUpdate(
    { clerkId },
    {
      $set: {
        lastWorkoutDate: today,
        xp: newXp,
        level,
        "stats.streak": streak,
      },
      $inc: {
        "stats.workoutsCompleted": 1,
        "stats.caloriesBurned": Math.round(volumeKg / 10) + 150,
      },
    }
  );

  return { streak, xpGain, level, newXp };
}

export async function buildProgressAnalytics(clerkId: string) {
  const sessions = await WorkoutSessionModel.find({
    clerkId,
    status: "completed",
  })
    .sort({ completedAt: -1 })
    .limit(60)
    .lean();

  const prs = dedupePersonalRecordsForDisplay(
    await PersonalRecordModel.find({ clerkId })
      .sort({ achievedAt: -1 })
      .limit(50)
      .lean()
  );

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let weeklyVolume = 0;
  let monthlyVolume = 0;
  const volumeByWeek: { week: string; volume: number }[] = [];
  const muscleFrequency: Record<string, number> = {};
  const exerciseHistory: {
    date: string;
    exerciseName: string;
    volumeKg: number;
    maxWeight: number;
  }[] = [];

  const weekMap = new Map<string, number>();

  for (const s of sessions) {
    const completedAt = s.completedAt ? new Date(s.completedAt) : new Date(s.startedAt);
    const vol = s.totalVolumeKg ?? 0;

    if (completedAt >= weekAgo) weeklyVolume += vol;
    if (completedAt >= monthAgo) monthlyVolume += vol;

    const weekKey = completedAt.toISOString().slice(0, 10);
    const weekLabel = `W${completedAt.getMonth() + 1}/${completedAt.getDate()}`;
    weekMap.set(weekLabel, (weekMap.get(weekLabel) ?? 0) + vol);

    for (const ex of s.exercises ?? []) {
      for (const m of ex.muscleGroups ?? []) {
        muscleFrequency[m] = (muscleFrequency[m] ?? 0) + 1;
      }
      const exVol = exerciseVolume(ex.loggedSets ?? []);
      const maxW = Math.max(
        0,
        ...(ex.loggedSets ?? [])
          .filter((set) => set.completed)
          .map((set) => set.weightKg ?? 0)
      );
      if (exVol > 0) {
        exerciseHistory.push({
          date: completedAt.toISOString().split("T")[0],
          exerciseName: ex.name,
          volumeKg: exVol,
          maxWeight: maxW,
        });
      }
    }
  }

  weekMap.forEach((volume, week) => volumeByWeek.push({ week, volume }));
  volumeByWeek.reverse();

  const strengthByExercise: Record<string, { date: string; e1rm: number }[]> = {};
  for (const h of exerciseHistory.slice(0, 100)) {
    if (!strengthByExercise[h.exerciseName]) strengthByExercise[h.exerciseName] = [];
    const lastSet = h.maxWeight;
    strengthByExercise[h.exerciseName].push({
      date: h.date,
      e1rm: estimateOneRepMax(lastSet, 5),
    });
  }

  const user = await UserModel.findOne({ clerkId }).lean();
  const xp = (user as { xp?: number })?.xp ?? 0;
  const level = (user as { level?: number })?.level ?? 1;

  return {
    weeklyVolume,
    monthlyVolume,
    volumeByWeek: volumeByWeek.slice(-8),
    muscleFrequency,
    exerciseHistory: exerciseHistory.slice(0, 30),
    strengthByExercise,
    personalRecords: prs.map((p) => ({
      exercise: p.exerciseName,
      recordType: p.recordType,
      weight: p.weightKg,
      reps: p.reps,
      volume: p.volumeKg,
      date: p.achievedAt,
      unit: "kg" as const,
    })),
    totalSessions: sessions.length,
    xp,
    level,
    consistency: sessions.slice(0, 14).map((s) => ({
      date: (s.completedAt ?? s.startedAt).toISOString().split("T")[0],
      completed: true,
    })),
  };
}
