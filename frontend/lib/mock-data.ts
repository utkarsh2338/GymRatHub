import type {
  Exercise,
  WorkoutPlan,
  NutritionDay,
  WeightEntry,
  ActivityEntry,
  Post,
  LeaderboardEntry,
  Challenge,
  Trainer,
  KPICard,
  PlannerDay,
  PersonalRecord,
  User,
} from "@/lib/types";

// ─── Auth User ─────────────────────────────────────────────────────────────
export const mockUser: User = {
  id: "u1",
  name: "Jake Doe",
  email: "jake@gymrathub.com",
  avatar: "/avatars/jake.jpg",
  plan: "pro",
  joinedAt: "2022-03-15",
  stats: {
    workoutsCompleted: 4,
    streak: 12,
    caloriesBurned: 1840,
    waterIntake: 2.1,
    weight: 82,
    weightGoal: 78,
  },
};

// ─── KPI Cards ─────────────────────────────────────────────────────────────
export const mockKPICards: KPICard[] = [
  {
    label: "Calories Burned",
    value: 1840,
    unit: "kcal",
    icon: "flame",
    color: "orange",
    trend: "up",
    chart: [1200, 1450, 1600, 1750, 1840, 1900, 1840],
  },
  {
    label: "Workout Streak",
    value: 12,
    unit: "Days",
    icon: "zap",
    color: "green",
    trend: "up",
    chart: [5, 6, 7, 8, 9, 10, 12],
  },
  {
    label: "Workouts This Week",
    value: 4,
    unit: "",
    icon: "dumbbell",
    color: "blue",
    chart: [1, 2, 2, 3, 3, 4, 4],
  },
  {
    label: "Water Intake",
    value: 2.1,
    unit: "L",
    icon: "droplets",
    color: "blue",
    chart: [1.2, 1.5, 1.8, 2.0, 2.1, 2.3, 2.1],
  },
];

// ─── Weight Progress ────────────────────────────────────────────────────────
export const mockWeightData: WeightEntry[] = [
  { week: "W1", weight: 104 },
  { week: "W2", weight: 100 },
  { week: "W3", weight: 98 },
  { week: "W4", weight: 96 },
  { week: "W5", weight: 94 },
  { week: "W6", weight: 92 },
  { week: "W7", weight: 90 },
  { week: "W8", weight: 88 },
];

// ─── Weekly Activity ────────────────────────────────────────────────────────
export const mockActivityData: ActivityEntry[] = [
  { day: "Mon", minutes: 20 },
  { day: "Tue", minutes: 35 },
  { day: "Wed", minutes: 45 },
  { day: "Thu", minutes: 30 },
  { day: "Fri", minutes: 55 },
  { day: "Sat", minutes: 60 },
  { day: "Sun", minutes: 48 },
];

// ─── Today's Workout ────────────────────────────────────────────────────────
export const mockTodayWorkout: WorkoutPlan = {
  id: "wp1",
  name: "Chest & Triceps",
  day: "Monday",
  duration: 65,
  exercises: [
    {
      id: "e1",
      name: "Barbell Bench Press",
      category: "Chest",
      muscleGroups: ["Pectorals", "Triceps"],
      difficulty: "Intermediate",
      equipment: ["Barbell", "Bench"],
      sets: 4,
      reps: "8",
      instructions: [],
      status: "done",
    },
    {
      id: "e2",
      name: "Incline Dumbbell Press",
      category: "Chest",
      muscleGroups: ["Pectorals", "Deltoids"],
      difficulty: "Intermediate",
      equipment: ["Dumbbells", "Bench"],
      sets: 3,
      reps: "10",
      instructions: [],
      status: "done",
    },
    {
      id: "e3",
      name: "Tricep Rope Pushdown",
      category: "Arms",
      muscleGroups: ["Triceps"],
      difficulty: "Beginner",
      equipment: ["Cable Machine"],
      sets: 3,
      reps: "12",
      instructions: [],
      status: "pending",
    },
    {
      id: "e4",
      name: "Cable Fly",
      category: "Chest",
      muscleGroups: ["Pectorals"],
      difficulty: "Intermediate",
      equipment: ["Cable Machine"],
      sets: 3,
      reps: "15",
      instructions: [],
      status: "pending",
    },
    {
      id: "e5",
      name: "Overhead Tricep Extension",
      category: "Arms",
      muscleGroups: ["Triceps"],
      difficulty: "Beginner",
      equipment: ["Dumbbell"],
      sets: 3,
      reps: "12",
      instructions: [],
      status: "pending",
    },
  ],
};

// ─── Exercises / Workout Library ────────────────────────────────────────────
import { EXERCISE_LIBRARY } from "./exercise-library";

/** @deprecated Prefer `EXERCISE_LIBRARY` from `@/lib/exercise-library` */
export const mockExercises: Exercise[] = EXERCISE_LIBRARY;

// ─── Nutrition ──────────────────────────────────────────────────────────────
export const mockNutrition: NutritionDay = {
  date: "2026-01-21",
  calories: { consumed: 880, goal: 2100 },
  macros: {
    protein: { amount: 102, goal: 180 },
    carbs: { amount: 239, goal: 300 },
    fat: { amount: 89, goal: 120 },
  },
  water: { consumed: 2.1, goal: 3.5 },
  meals: [
    {
      id: "m1",
      name: "Breakfast",
      time: "08:00",
      emoji: "🥗",
      items: [
        { name: "Oats", calories: 300, protein: 10, carbs: 54, fat: 6, amount: "100g" },
        { name: "Eggs", calories: 140, protein: 12, carbs: 1, fat: 9, amount: "2 large" },
      ],
    },
    {
      id: "m2",
      name: "Lunch",
      time: "13:00",
      emoji: "🍗",
      items: [
        { name: "Chicken Breast", calories: 230, protein: 43, carbs: 0, fat: 5, amount: "200g" },
        { name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 2, amount: "100g" },
      ],
    },
    {
      id: "m3",
      name: "Dinner",
      time: "19:00",
      emoji: "🐟",
      items: [
        { name: "Salmon", calories: 280, protein: 32, carbs: 0, fat: 16, amount: "200g" },
        { name: "Sweet Potato", calories: 180, protein: 2, carbs: 41, fat: 0, amount: "150g" },
      ],
    },
    {
      id: "m4",
      name: "Snacks",
      time: "16:00",
      emoji: "🥜",
      items: [
        { name: "Almonds", calories: 160, protein: 6, carbs: 6, fat: 14, amount: "30g" },
        { name: "Protein Bar", calories: 220, protein: 20, carbs: 22, fat: 7, amount: "1 bar" },
      ],
    },
  ],
};

// ─── Community Posts ────────────────────────────────────────────────────────
export const mockPosts: Post[] = [
  {
    id: "p1",
    author: {
      id: "cu1",
      name: "Kurt Thornhill",
      badge: "Pro",
      isFollowing: true,
    },
    content:
      "Just crushed my first PR in 8 years! 225 lbs on bench press 💪 The structured program on GymRat Hub completely changed my approach to training.",
    tags: ["PR", "BenchPress", "Strength"],
    likes: 847,
    comments: 94,
    shares: 23,
    liked: false,
    createdAt: "2026-01-21T10:30:00Z",
    type: "achievement",
  },
  {
    id: "p2",
    author: {
      id: "cu2",
      name: "Maria Fitness",
      badge: "Ambassador",
      isFollowing: false,
    },
    content:
      "Day 21 of the 30-day challenge! Feeling incredible 🔥 Who else is crushing it this week? Drop a 💪 below!",
    imageUrl: "/community/maria-post.jpg",
    likes: 1230,
    comments: 156,
    shares: 44,
    liked: true,
    createdAt: "2026-01-21T08:00:00Z",
    type: "progress",
  },
  {
    id: "p3",
    author: {
      id: "cu3",
      name: "Robert McClain",
      badge: "Elite",
      isFollowing: false,
    },
    content:
      "5am club is the only club worth joining! Early morning cardio + cold plunge = unstoppable energy for the day. Who else starts their day before sunrise? 🌅",
    likes: 562,
    comments: 78,
    shares: 12,
    liked: false,
    createdAt: "2026-01-20T22:00:00Z",
  },
];

// ─── Leaderboard ────────────────────────────────────────────────────────────
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user: { id: "l1", name: "Alex Fitness", badge: "Elite" },
    xp: 12450,
    change: "same",
  },
  {
    rank: 2,
    user: { id: "l2", name: "Sarah Miller", badge: "Pro" },
    xp: 9800,
    change: "up",
  },
  {
    rank: 3,
    user: { id: "l3", name: "Mark Johnson" },
    xp: 7610,
    change: "down",
  },
  {
    rank: 4,
    user: { id: "l4", name: "Lisa Park", badge: "Pro" },
    xp: 6280,
    change: "up",
  },
  {
    rank: 5,
    user: { id: "l5", name: "Ryan Chen" },
    xp: 4250,
    change: "same",
  },
];

// ─── Challenges ─────────────────────────────────────────────────────────────
export const mockChallenges: Challenge[] = [
  {
    id: "c1",
    name: "30 Day Beast Challenge",
    description: "Complete 30 consecutive days of training",
    category: "Consistency",
    progress: 70,
    xpReward: 500,
    endDate: "2026-02-21",
    participants: 12847,
    status: "active",
    badgeEmoji: "🏆",
  },
  {
    id: "c2",
    name: "100K Steps",
    description: "Hit 100,000 steps this week",
    category: "Cardio",
    progress: 45,
    xpReward: 200,
    endDate: "2026-01-28",
    participants: 8432,
    status: "active",
    badgeEmoji: "👟",
  },
  {
    id: "c3",
    name: "Protein King",
    description: "Hit your protein goal 7 days in a row",
    category: "Nutrition",
    progress: 85,
    xpReward: 300,
    endDate: "2026-01-27",
    participants: 5210,
    status: "active",
    badgeEmoji: "💪",
  },
  {
    id: "c4",
    name: "Iron Warrior",
    description: "Complete 20 strength workouts this month",
    category: "Strength",
    progress: 100,
    xpReward: 750,
    endDate: "2026-01-31",
    participants: 3840,
    status: "completed",
    badgeEmoji: "⚔️",
  },
];

// ─── Trainers ───────────────────────────────────────────────────────────────
export const mockTrainers: Trainer[] = [
  {
    id: "t1",
    name: "Marcus Vaughn",
    specialty: ["Powerlifting", "Strength"],
    rating: 4.9,
    reviewCount: 312,
    experience: 8,
    price: 85,
    sessionsCount: 1240,
    clientsCount: 89,
    available: true,
    badge: "Top Rated",
  },
  {
    id: "t2",
    name: "Elena Cruz",
    specialty: ["CrossFit", "Functional"],
    rating: 4.8,
    reviewCount: 248,
    experience: 6,
    price: 70,
    sessionsCount: 980,
    clientsCount: 67,
    available: true,
  },
  {
    id: "t3",
    name: "Andre Okafor",
    specialty: ["Bodybuilding", "Nutrition"],
    rating: 4.7,
    reviewCount: 189,
    experience: 10,
    price: 95,
    sessionsCount: 2100,
    clientsCount: 134,
    available: false,
    badge: "Top Rated",
  },
  {
    id: "t4",
    name: "Tyler Brooks",
    specialty: ["HIIT", "Weight Loss"],
    rating: 4.8,
    reviewCount: 156,
    experience: 5,
    price: 65,
    sessionsCount: 720,
    clientsCount: 52,
    available: true,
    badge: "New",
  },
  {
    id: "t5",
    name: "Maya Sharma",
    specialty: ["Yoga", "Flexibility"],
    rating: 4.9,
    reviewCount: 201,
    experience: 7,
    price: 60,
    sessionsCount: 890,
    clientsCount: 78,
    available: true,
  },
  {
    id: "t6",
    name: "Carlos Rivera",
    specialty: ["Boxing", "Cardio"],
    rating: 4.6,
    reviewCount: 134,
    experience: 9,
    price: 75,
    sessionsCount: 1560,
    clientsCount: 91,
    available: true,
  },
];

// ─── Workout Planner ────────────────────────────────────────────────────────
export const mockPlannerWeek: PlannerDay[] = [
  {
    date: "2026-01-19",
    dayLabel: "Mon",
    workouts: [
      {
        id: "pb1",
        name: "Push Day",
        type: "Strength",
        duration: 65,
        color: "#39E609",
        status: "done",
      },
    ],
  },
  {
    date: "2026-01-20",
    dayLabel: "Tue",
    workouts: [
      {
        id: "pb2",
        name: "Pull Day",
        type: "Strength",
        duration: 60,
        color: "#38bdf8",
        status: "done",
      },
    ],
  },
  {
    date: "2026-01-21",
    dayLabel: "Wed",
    workouts: [
      {
        id: "pb3",
        name: "Rest Day",
        type: "Recovery",
        duration: 0,
        color: "#6b7280",
        status: "rest",
      },
    ],
  },
  {
    date: "2026-01-22",
    dayLabel: "Thu",
    workouts: [
      {
        id: "pb4",
        name: "Leg Day",
        type: "Strength",
        duration: 70,
        color: "#f97316",
        status: "planned",
      },
    ],
  },
  {
    date: "2026-01-23",
    dayLabel: "Fri",
    workouts: [
      {
        id: "pb5",
        name: "Cardio + Core",
        type: "Cardio",
        duration: 45,
        color: "#a855f7",
        status: "planned",
      },
      {
        id: "pb6",
        name: "Sandy HIIT",
        type: "HIIT",
        duration: 30,
        color: "#22d3ee",
        status: "planned",
      },
    ],
  },
  {
    date: "2026-01-24",
    dayLabel: "Sat",
    workouts: [
      {
        id: "pb7",
        name: "Full Body",
        type: "Strength",
        duration: 75,
        color: "#39E609",
        status: "planned",
      },
    ],
  },
  {
    date: "2026-01-25",
    dayLabel: "Sun",
    workouts: [
      {
        id: "pb8",
        name: "Rest Day",
        type: "Recovery",
        duration: 0,
        color: "#6b7280",
        status: "rest",
      },
    ],
  },
];

// ─── Personal Records ────────────────────────────────────────────────────────
export const mockPRs: PersonalRecord[] = [
  { exercise: "Barbell Bench Press", weight: 120, unit: "kg", reps: 1, date: "2026-01-18", isNew: true },
  { exercise: "Back Squat", weight: 160, unit: "kg", reps: 1, date: "2026-01-10" },
  { exercise: "Deadlift", weight: 200, unit: "kg", reps: 1, date: "2026-01-05" },
  { exercise: "Overhead Press", weight: 80, unit: "kg", reps: 3, date: "2025-12-28" },
];
