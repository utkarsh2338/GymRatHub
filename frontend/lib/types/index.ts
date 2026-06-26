// ─── User & Auth ───────────────────────────────────────────────────────────
export type FitnessGoal =
  | "lose_weight"
  | "build_muscle"
  | "improve_endurance"
  | "stay_active";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  plan: "free" | "pro" | "elite";
  fitnessGoal?: FitnessGoal;
  targetConfigured?: boolean;
  startingWeight?: number | null;
  joinedAt: string;
  stats: UserStats;
}

export interface UserStats {
  workoutsCompleted: number;
  streak: number;
  caloriesBurned: number;
  waterIntake: number; // in liters
  weight: number; // in kg
  weightGoal: number;
}

// ─── Workout ───────────────────────────────────────────────────────────────
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  equipment: string[];
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  instructions: string[];
  tips?: string[];
  /** Form cues and safety notes while performing the movement */
  commonMistakes?: string[];
  alternatives?: Exercise[];
  saved?: boolean;
}

export type ExerciseCategory =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Legs"
  | "Core"
  | "Cardio"
  | "Full Body"
  | "Flexibility";

export type MuscleGroup =
  | "Pectorals"
  | "Triceps"
  | "Biceps"
  | "Deltoids"
  | "Lats"
  | "Traps"
  | "Rhomboids"
  | "Quadriceps"
  | "Hamstrings"
  | "Glutes"
  | "Calves"
  | "Abs"
  | "Obliques"
  | "Lower Back";

export interface WorkoutPlan {
  id: string;
  name: string;
  exercises: PlannedExercise[];
  day: string;
  duration: number; // minutes
  status?: "upcoming" | "done" | "skipped";
  color?: string;
}

export interface PlannedExercise extends Exercise {
  sets: number;
  reps: string;
  status: "pending" | "done";
}

// ─── Nutrition ─────────────────────────────────────────────────────────────
export interface NutritionDay {
  date: string;
  calories: { consumed: number; goal: number };
  macros: Macros;
  water: { consumed: number; goal: number }; // in liters
  meals: Meal[];
  preferences?: NutritionPreferences;
}

export interface NutritionPreferences {
  waterGoalConfigured: boolean;
  waterGoal: number;
  waterWeightKg: number | null;
  waterActivityLevel: string;
  waterClimate: string;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export interface Macros {
  protein: { amount: number; goal: number }; // grams
  carbs: { amount: number; goal: number };
  fat: { amount: number; goal: number };
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  items: FoodItem[];
  emoji?: string;
  imageUrl?: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: string;
}

// ─── Progress ──────────────────────────────────────────────────────────────
export interface WeightEntry {
  week: string;
  weight: number;
}

export interface ActivityEntry {
  day: string;
  minutes: number;
}

export interface PersonalRecord {
  exercise: string;
  weight: number;
  unit: "kg" | "lbs";
  reps: number;
  date: string;
  isNew?: boolean;
  recordType?: string;
  volume?: number;
}

export interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  isWarmup?: boolean;
  isDropSet?: boolean;
}

export interface SessionExercise {
  id: string;
  exerciseId: string;
  name: string;
  category: string;
  muscleGroups: string[];
  targetSets: number;
  targetReps: string;
  loggedSets: LoggedSet[];
  notes: string;
  status: "pending" | "in_progress" | "completed";
  order: number;
  supersetGroupId?: string | null;
}

export interface WorkoutSession {
  _id: string;
  clerkId: string;
  templateId?: string | null;
  planName: string;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  completedAt?: string | null;
  durationMinutes: number;
  exercises: SessionExercise[];
  totalVolumeKg: number;
  newPRs?: { type: string; exerciseName: string; value: number; label: string }[];
  aiInsights?: string[];
}

export interface WorkoutTemplateDay {
  dayLabel: string;
  name: string;
  exercises: {
    exerciseId: string;
    name: string;
    category: string;
    muscleGroups: string[];
    targetSets: number;
    targetReps: string;
    order?: number;
    supersetGroupId?: string | null;
  }[];
}

export interface TemplateExerciseItem {
  exerciseId: string;
  name: string;
  category: string;
  muscleGroups: string[];
  targetSets: number;
  targetReps: string;
  order: number;
  supersetGroupId?: string | null;
}

export interface WorkoutTemplate {
  _id: string;
  name: string;
  description: string;
  goalType: string;
  planType: "custom" | "preset";
  presetKey?: string | null;
  days: WorkoutTemplateDay[];
}

export interface PresetPlanSummary {
  presetKey: string;
  name: string;
  description: string;
  goalType: string;
  dayCount: number;
}

export interface DashboardWeekExercise {
  exerciseId: string;
  name: string;
  category: string;
  muscleGroups: string[];
  targetSets: number;
  targetReps: string;
  supersetGroupId?: string | null;
}

export interface DashboardWeekDay {
  dayLabel: string;
  name: string;
  isToday: boolean;
  isRest: boolean;
  exerciseCount: number;
  exercises: DashboardWeekExercise[];
}

export interface DashboardWorkoutSchedule {
  activeTemplate: {
    _id: string;
    name: string;
    goalType: string;
    planType: string;
  } | null;
  templates: { _id: string; name: string; goalType: string; exerciseCount: number }[];
  todayDayLabel: string;
  todayDayName: string;
  week: DashboardWeekDay[];
  todayWorkout: WorkoutPlan | null;
}

export interface ProgressAnalytics {
  weeklyVolume: number;
  monthlyVolume: number;
  volumeByWeek: { week: string; volume: number }[];
  muscleFrequency: Record<string, number>;
  exerciseHistory: {
    date: string;
    exerciseName: string;
    volumeKg: number;
    maxWeight: number;
  }[];
  strengthByExercise: Record<string, { date: string; e1rm: number }[]>;
  personalRecords: PersonalRecord[];
  totalSessions: number;
  xp: number;
  level: number;
  consistency: { date: string; completed: boolean }[];
  stats?: UserStats;
  streak?: number;
}

// ─── Community ─────────────────────────────────────────────────────────────
export interface Post {
  id: string;
  author: CommunityUser;
  content: string;
  imageUrl?: string;
  tags?: string[];
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  createdAt: string;
  type?: "regular" | "achievement" | "progress";
}

export interface CommunityUser {
  id: string;
  name: string;
  avatar?: string;
  badge?: "Pro" | "Elite" | "Trainer" | "Ambassador";
  isFollowing?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user: CommunityUser;
  xp: number;
  change?: "up" | "down" | "same";
}

// ─── Challenges ────────────────────────────────────────────────────────────
export interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  progress: number; // 0–100
  xpReward: number;
  endDate: string;
  participants: number;
  status: "active" | "completed" | "upcoming" | "joined";
  badgeEmoji?: string;
}

// ─── Trainers ──────────────────────────────────────────────────────────────
export interface Trainer {
  id: string;
  name: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  experience: number; // years
  price: number; // per session
  imageUrl?: string;
  badge?: "Top Rated" | "New";
  sessionsCount: number;
  clientsCount: number;
  available: boolean;
}

// ─── YouTube Tutorials ───────────────────────────────────────────────────────
export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

// ─── KPI ───────────────────────────────────────────────────────────────────
export interface KPICard {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: "orange" | "green" | "blue" | "purple";
  trend?: "up" | "down";
  trendPercent?: number;
  chart?: number[];
}

// ─── Planner ───────────────────────────────────────────────────────────────
export interface PlannerDay {
  date: string;
  dayLabel: string;
  workouts: WorkoutBlock[];
}

export interface WorkoutBlock {
  id: string;
  name: string;
  type: string;
  duration: number;
  color: string;
  status?: "planned" | "done" | "rest";
}
