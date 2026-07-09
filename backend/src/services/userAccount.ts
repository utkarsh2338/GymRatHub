import UserModel from "../models/User";
import NutritionModel from "../models/Nutrition";
import WorkoutPlanModel from "../models/Workout";
import PlannerDayModel from "../models/Planner";
import PostModel from "../models/Post";
import UserChallengeModel from "../models/Challenge";
import WorkoutSessionModel from "../models/WorkoutSession";
import WorkoutTemplateModel from "../models/WorkoutTemplate";
import PersonalRecordModel from "../models/PersonalRecord";

export async function deleteAllUserData(clerkId: string) {
  await Promise.all([
    NutritionModel.deleteMany({ clerkId }),
    WorkoutPlanModel.deleteMany({ clerkId }),
    PlannerDayModel.deleteMany({ clerkId }),
    PostModel.deleteMany({ clerkId }),
    UserChallengeModel.deleteMany({ clerkId }),
    WorkoutSessionModel.deleteMany({ clerkId }),
    WorkoutTemplateModel.deleteMany({ clerkId }),
    PersonalRecordModel.deleteMany({ clerkId }),
    UserModel.deleteOne({ clerkId }),
  ]);
}

export async function deleteUserAccount(clerkId: string) {
  await deleteAllUserData(clerkId);
  // Removed Clerk remote account deletion logic
}

export async function exportUserData(clerkId: string) {
  const user = await UserModel.findOne({ clerkId }).lean();
  if (!user) throw new Error("User not found.");

  const [nutrition, workouts, planner, posts, challenges, sessions, templates, prs] =
    await Promise.all([
      NutritionModel.find({ clerkId }).lean(),
      WorkoutPlanModel.find({ clerkId }).lean(),
      PlannerDayModel.find({ clerkId }).lean(),
      PostModel.find({ clerkId }).lean(),
      UserChallengeModel.find({ clerkId }).lean(),
      WorkoutSessionModel.find({ clerkId }).lean(),
      WorkoutTemplateModel.find({ clerkId }).lean(),
      PersonalRecordModel.find({ clerkId }).lean(),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: user,
    nutrition,
    workoutPlans: workouts,
    planner,
    posts,
    challenges,
    workoutSessions: sessions,
    workoutTemplates: templates,
    personalRecords: prs,
  };
}

export async function syncNameToClerk(clerkId: string, name: string) {
  // Removed Clerk profile sync logic. No-op in local authentication mode.
}
