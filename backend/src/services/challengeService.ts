import UserModel from "../models/User";
import UserChallengeModel from "../models/Challenge";
import NutritionModel from "../models/Nutrition";
import WorkoutSessionModel from "../models/WorkoutSession";

interface BadgeDefinition {
  id: string;
  name: string;
  desc: string;
  xp: number;
  color: string;
  check: (metrics: {
    workoutsCompleted: number;
    streak: number;
    hydrationDays: number;
    proteinDays: number;
    cardioSessionsCount: number;
    nightOwlCount: number;
    strengthSessionsCount: number;
  }) => boolean;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "iron_warrior",
    name: "Iron Warrior",
    desc: "20 strength workouts",
    xp: 750,
    color: "#f97316",
    check: (m) => m.workoutsCompleted >= 20 || m.strengthSessionsCount >= 20,
  },
  {
    id: "seven_day_blaze",
    name: "7-Day Blaze",
    desc: "7 consecutive days",
    xp: 200,
    color: "#ef4444",
    check: (m) => m.streak >= 7,
  },
  {
    id: "hydration_king",
    name: "Hydration King",
    desc: "Hit water goal 10 days",
    xp: 150,
    color: "#38bdf8",
    check: (m) => m.hydrationDays >= 10,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    desc: "Complete 5 cardio sessions",
    xp: 300,
    color: "#a855f7",
    check: (m) => m.cardioSessionsCount >= 5,
  },
  {
    id: "protein_pro",
    name: "Protein Pro",
    desc: "Hit protein goal 7 days",
    xp: 250,
    color: "#39E609",
    check: (m) => m.proteinDays >= 7,
  },
  {
    id: "night_owl",
    name: "Night Owl",
    desc: "Work out after 8pm, 5 times",
    xp: 100,
    color: "#eab308",
    check: (m) => m.nightOwlCount >= 5,
  },
];

export async function updateChallengeProgressAndBadges(clerkId: string) {
  const user = await UserModel.findOne({ clerkId });
  if (!user) {
    throw new Error("User profile not found");
  }

  // 1. Gather all logs to compute current stats
  const completedSessions = await WorkoutSessionModel.find({ clerkId, status: "completed" });
  const nutritionLogs = await NutritionModel.find({ clerkId });

  const streak = user.stats?.streak ?? 0;
  const workoutsCompleted = user.stats?.workoutsCompleted ?? 0;
  const caloriesBurned = user.stats?.caloriesBurned ?? 0;

  // Hydration days: count of days where water consumed >= water goal
  const hydrationDays = nutritionLogs.filter(
    (log) => log.water && log.water.consumed > 0 && log.water.consumed >= log.water.goal
  ).length;

  // Protein days: count of days where protein consumed >= protein goal
  const proteinDays = nutritionLogs.filter(
    (log) =>
      log.macros?.protein &&
      log.macros.protein.amount > 0 &&
      log.macros.protein.amount >= log.macros.protein.goal
  ).length;

  // Cardio sessions count: Completed workout sessions that have at least one exercise in Cardio category
  const cardioSessionsCount = completedSessions.filter((session) =>
    session.exercises?.some((ex) => ex.category === "Cardio")
  ).length;

  // Night Owl: workouts completed after 8 PM (20:00) or before 4 AM
  const nightOwlCount = completedSessions.filter((session) => {
    if (!session.completedAt) return false;
    const hour = new Date(session.completedAt).getHours();
    return hour >= 20 || hour < 4;
  }).length;

  // Strength sessions count
  const strengthSessionsCount = completedSessions.filter((session) =>
    session.exercises?.some((ex) => ex.category !== "Cardio" && ex.category !== "Flexibility")
  ).length;

  const metrics = {
    workoutsCompleted,
    streak,
    hydrationDays,
    proteinDays,
    cardioSessionsCount,
    nightOwlCount,
    strengthSessionsCount,
  };

  // 2. Compute dynamic challenges progress
  let challenges = await UserChallengeModel.find({ clerkId });
  if (challenges.length === 0) {
    const defaults = [
      { challengeId: "c1", name: "30 Day Beast Challenge", description: "Complete 30 consecutive days of training", category: "Consistency", progress: 0, xpReward: 500, endDate: "2026-02-21", participants: 12847, status: "active", badgeEmoji: "🏆" },
      { challengeId: "c2", name: "100K Steps", description: "Hit 100,000 steps this week", category: "Cardio", progress: 0, xpReward: 200, endDate: "2026-01-28", participants: 8432, status: "active", badgeEmoji: "👟" },
      { challengeId: "c3", name: "Protein King", description: "Hit your protein goal 7 days in a row", category: "Nutrition", progress: 0, xpReward: 300, endDate: "2026-01-27", participants: 5210, status: "active", badgeEmoji: "💪" },
      { challengeId: "c4", name: "Iron Master", description: "Complete 50 strength workouts", category: "Strength", progress: 0, xpReward: 1000, endDate: "2026-03-15", participants: 3120, status: "upcoming", badgeEmoji: "⚔️" }
    ];

    challenges = [];
    for (const item of defaults) {
      const doc = await UserChallengeModel.create({ clerkId, ...item });
      challenges.push(doc);
    }
  }

  let userXpOrLevelUpdated = false;

  for (const challenge of challenges) {
    let progress = 0;
    if (challenge.challengeId === "c1") {
      progress = Math.min(100, Math.round((streak / 30) * 100));
    } else if (challenge.challengeId === "c2") {
      // 100k steps simulated via calories burned
      progress = Math.min(100, Math.round((caloriesBurned / 2500) * 100));
    } else if (challenge.challengeId === "c3") {
      progress = Math.min(100, Math.round((proteinDays / 7) * 100));
    } else if (challenge.challengeId === "c4") {
      progress = Math.min(100, Math.round((workoutsCompleted / 50) * 100));
    }

    if (challenge.status === "joined" && progress >= 100) {
      challenge.status = "completed";
      challenge.progress = 100;
      user.xp += challenge.xpReward;
      user.level = Math.floor(user.xp / 500) + 1;
      userXpOrLevelUpdated = true;
    } else if (challenge.status !== "completed") {
      challenge.progress = progress;
    }
    await challenge.save();
  }

  // 3. Compute dynamic badges
  const userBadges = user.badges || [];
  const mappedBadges = [];

  for (const def of BADGE_DEFINITIONS) {
    const isEarned = def.check(metrics);
    const alreadyEarned = userBadges.some((b) => b.id === def.id);

    if (isEarned && !alreadyEarned) {
      user.badges.push({
        id: def.id,
        name: def.name,
        earnedAt: new Date().toISOString(),
      });
      user.xp += def.xp;
      user.level = Math.floor(user.xp / 500) + 1;
      userXpOrLevelUpdated = true;
    }

    mappedBadges.push({
      id: def.id,
      name: def.name,
      desc: def.desc,
      xp: def.xp,
      color: def.color,
      earned: isEarned || alreadyEarned,
    });
  }

  if (userXpOrLevelUpdated) {
    await user.save();
  }

  return {
    challenges,
    badges: mappedBadges,
    xp: user.xp,
    level: user.level,
  };
}
