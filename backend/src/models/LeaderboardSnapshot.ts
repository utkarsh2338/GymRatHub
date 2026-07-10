import { Schema, model } from "mongoose";

/**
 * One document per calendar day (UTC), storing that day's global XP ranking.
 * This is what powers the "up / down / same" arrows on the leaderboard: we
 * don't need a scheduled job to maintain it — the first leaderboard read of
 * a new day computes and stores today's snapshot (see services/leaderboard.ts),
 * and every subsequent read that day just compares against it and against
 * the most recent *previous* day's snapshot for the change indicator.
 */
const LeaderboardSnapshotSchema = new Schema(
  {
    date: { type: String, required: true, unique: true, index: true }, // "YYYY-MM-DD" (UTC)
    entries: [
      {
        _id: false,
        clerkId: { type: String, required: true },
        rank: { type: Number, required: true },
        xp: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const LeaderboardSnapshotModel = model("LeaderboardSnapshot", LeaderboardSnapshotSchema);
export default LeaderboardSnapshotModel;
