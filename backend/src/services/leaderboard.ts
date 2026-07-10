import UserModel from "../models/User";
import LeaderboardSnapshotModel from "../models/LeaderboardSnapshot";

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
    badge?: "Pro" | "Elite" | "Trainer" | "Ambassador";
  };
  xp: number;
  change: "up" | "down" | "same";
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function planToBadge(plan: string): LeaderboardEntry["user"]["badge"] {
  if (plan === "elite") return "Elite";
  if (plan === "pro") return "Pro";
  return undefined;
}

/**
 * Ensures today's rank snapshot exists, computing it from the current live
 * standings if not. Idempotent — safe to call on every leaderboard read.
 * This is what lets "up / down / same" work without a cron job: whichever
 * request happens to be the first one today pays a small one-time cost to
 * write the snapshot, every request after that just reads it.
 */
async function ensureTodaySnapshot(
  ranked: { clerkId: string; rank: number; xp: number }[]
): Promise<void> {
  const date = todayUTC();
  const exists = await LeaderboardSnapshotModel.exists({ date });
  if (exists) return;

  try {
    await LeaderboardSnapshotModel.create({ date, entries: ranked });
  } catch (err: any) {
    // Race: another concurrent request created it first — fine, ignore.
    if (err?.code !== 11000) throw err;
  }
}

async function getPreviousRanks(): Promise<Map<string, number>> {
  const today = todayUTC();
  const previous = await LeaderboardSnapshotModel.findOne({ date: { $lt: today } })
    .sort({ date: -1 })
    .lean();

  const map = new Map<string, number>();
  for (const entry of previous?.entries ?? []) {
    map.set(entry.clerkId, entry.rank);
  }
  return map;
}

/**
 * Global XP leaderboard. Only includes users who've opted into a public
 * profile (privacyPreferences.publicProfile) — respecting that setting here
 * (not just on the profile page) matters, since a leaderboard is the one
 * place a user's rank is broadcast to everyone else by default.
 */
export async function getGlobalLeaderboard(
  limit: number = 10,
  requestingClerkId?: string
): Promise<{ entries: LeaderboardEntry[]; currentUserEntry: LeaderboardEntry | null }> {
  const topUsers = await UserModel.find({ "privacyPreferences.publicProfile": { $ne: false } })
    .select("clerkId name avatar plan xp")
    .sort({ xp: -1 })
    .limit(Math.max(limit, 1))
    .lean();

  // Rank the top 500 public users for the daily snapshot.
  // This avoids loading thousands of users in memory for high scalability.
  const top500Users = await UserModel.find({ "privacyPreferences.publicProfile": { $ne: false } })
    .select("clerkId xp")
    .sort({ xp: -1 })
    .limit(500)
    .lean();

  const rankByClerkId = new Map<string, number>();
  top500Users.forEach((u, i) => rankByClerkId.set(u.clerkId, i + 1));

  const snapshotEntries = top500Users.map((u, i) => ({
    clerkId: u.clerkId,
    rank: i + 1,
    xp: u.xp ?? 0,
  }));
  await ensureTodaySnapshot(snapshotEntries);

  const previousRanks = await getPreviousRanks();

  const toEntry = (u: any, rankVal?: number): LeaderboardEntry => {
    const rank = rankVal ?? rankByClerkId.get(u.clerkId) ?? 0;
    const prevRank = previousRanks.get(u.clerkId);
    let change: LeaderboardEntry["change"] = "same";
    if (prevRank !== undefined && rank > 0) {
      if (rank < prevRank) change = "up";
      else if (rank > prevRank) change = "down";
    }
    return {
      rank,
      user: { id: u.clerkId, name: u.name, avatar: u.avatar || undefined, badge: planToBadge(u.plan) },
      xp: u.xp ?? 0,
      change,
    };
  };

  const entries = topUsers.map((u) => toEntry(u));

  let currentUserEntry: LeaderboardEntry | null = null;
  if (requestingClerkId) {
    const inTopList = entries.some((e) => e.user.id === requestingClerkId);
    if (!inTopList) {
      const self = await UserModel.findOne({ clerkId: requestingClerkId })
        .select("clerkId name avatar plan xp privacyPreferences")
        .lean();
      
      if (self && self.privacyPreferences?.publicProfile !== false) {
        let rank = rankByClerkId.get(self.clerkId);
        if (rank === undefined) {
          // If the user is outside the top 500, calculate their rank using countDocuments (very fast with index)
          rank = await UserModel.countDocuments({
            "privacyPreferences.publicProfile": { $ne: false },
            xp: { $gt: self.xp ?? 0 },
          }) + 1;
        }
        currentUserEntry = toEntry(self, rank);
      }
    }
  }

  return { entries, currentUserEntry };
}
