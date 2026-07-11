import UserModel from "../models/User";
import { queueEmail } from "../queues/emailQueue";

export async function checkAndSendReminders() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const today = new Date(todayStr);

    const users = await UserModel.find({});
    let streakAlertsCount = 0;
    let reminderAlertsCount = 0;

    for (const user of users) {
      if (!user.lastWorkoutDate) continue;

      const lastWorkout = new Date(user.lastWorkoutDate);
      const diffTime = Math.abs(today.getTime() - lastWorkout.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // 1. Streak at Risk (last workout was exactly 1 day ago and they have a streak)
      if (diffDays === 1 && user.stats?.streak > 0) {
        await queueEmail(
          user.email,
          "Streak At Risk! ⚡ Keep it burning!",
          `<h1>Hey ${user.name}!</h1><p>Your <strong>${user.stats.streak}-day streak</strong> is at risk of resetting! Log a workout session today to keep your streak alive.</p>`
        );
        streakAlertsCount++;
      }

      // 2. Workout Reminder (last workout was 3 or more days ago)
      if (diffDays >= 3) {
        await queueEmail(
          user.email,
          "Time to hit the gym! 🏋️‍♂️",
          `<h1>We miss you, ${user.name}!</h1><p>It has been ${diffDays} days since your last session. Let's start the planner, load a routine, and crush today's session!</p>`
        );
        reminderAlertsCount++;
      }
    }

    console.log(`[Scheduler] Complete: Sent ${streakAlertsCount} streak alerts and ${reminderAlertsCount} workout reminders.`);
    return { streakAlertsCount, reminderAlertsCount };
  } catch (error) {
    console.error("[Scheduler] Error running notification reminders:", error);
    throw error;
  }
}
