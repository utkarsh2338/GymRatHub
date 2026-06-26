export type ThemeMode = "dark" | "light" | "auto";

export interface AppearancePreferences {
  theme: ThemeMode;
  accentColor: string;
  compactMode: boolean;
  animations: boolean;
  language: string;
}

export interface NotificationPreferences {
  pushWorkouts: boolean;
  pushChallenges: boolean;
  pushCommunity: boolean;
  pushTrainers: boolean;
  emailWeekly: boolean;
  emailPRs: boolean;
  emailNewsletter: boolean;
  emailOffers: boolean;
}

export interface PrivacyPreferences {
  publicProfile: boolean;
  showStats: boolean;
  showWorkouts: boolean;
  allowMessages: boolean;
  activityStatus: boolean;
  twoFactorEnabled: boolean;
}

export interface FitnessPreferences {
  units: "metric" | "imperial";
  fitnessLevel: "beginner" | "intermediate" | "advanced" | "athlete";
  weeklyWorkoutTarget: number;
  preferredRestDay: string;
  fitnessGoal?: string;
}

export interface UserPreferencesResponse {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  appearance: AppearancePreferences;
  fitness: FitnessPreferences;
  plan: "free" | "pro" | "elite";
}

export const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  pushWorkouts: true,
  pushChallenges: true,
  pushCommunity: false,
  pushTrainers: true,
  emailWeekly: true,
  emailPRs: true,
  emailNewsletter: false,
  emailOffers: true,
};

export const DEFAULT_PRIVACY: PrivacyPreferences = {
  publicProfile: true,
  showStats: true,
  showWorkouts: false,
  allowMessages: true,
  activityStatus: true,
  twoFactorEnabled: false,
};

export const DEFAULT_APPEARANCE: AppearancePreferences = {
  theme: "dark",
  accentColor: "#39E609",
  compactMode: false,
  animations: true,
  language: "en",
};

export const DEFAULT_FITNESS: FitnessPreferences = {
  units: "metric",
  fitnessLevel: "intermediate",
  weeklyWorkoutTarget: 5,
  preferredRestDay: "sunday",
  fitnessGoal: "build_muscle",
};
