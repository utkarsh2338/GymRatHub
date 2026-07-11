import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAndSendReminders } from "../schedulers/notificationScheduler";
import UserModel from "../models/User";
import { queueEmail } from "../queues/emailQueue";

vi.mock("../models/User");
vi.mock("../queues/emailQueue", () => ({
  queueEmail: vi.fn(),
}));

describe("Notification Scheduler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should trigger correct alerts for streaks and inactive gaps", async () => {
    const today = new Date();
    
    // Format dates relative to today
    const oneDayAgo = new Date(today);
    oneDayAgo.setDate(today.getDate() - 1);
    const oneDayAgoStr = oneDayAgo.toISOString().split("T")[0];

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];

    const mockUsers = [
      {
        name: "User Active",
        email: "active@example.com",
        lastWorkoutDate: new Date().toISOString().split("T")[0], // today
        stats: { streak: 5 },
      },
      {
        name: "User Streak At Risk",
        email: "streak_risk@example.com",
        lastWorkoutDate: oneDayAgoStr,
        stats: { streak: 3 },
      },
      {
        name: "User Inactive",
        email: "inactive@example.com",
        lastWorkoutDate: threeDaysAgoStr,
        stats: { streak: 0 },
      },
    ];

    vi.mocked(UserModel.find).mockResolvedValue(mockUsers as any);

    const result = await checkAndSendReminders();

    // Verify streak at risk email was queued
    expect(queueEmail).toHaveBeenCalledWith(
      "streak_risk@example.com",
      "Streak At Risk! ⚡ Keep it burning!",
      expect.stringContaining("3-day streak")
    );

    // Verify workout reminder email was queued
    expect(queueEmail).toHaveBeenCalledWith(
      "inactive@example.com",
      "Time to hit the gym! 🏋️‍♂️",
      expect.stringContaining("3 days since your last session")
    );

    expect(result.streakAlertsCount).toBe(1);
    expect(result.reminderAlertsCount).toBe(1);
  });
});
