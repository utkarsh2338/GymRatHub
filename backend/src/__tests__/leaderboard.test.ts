import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Mongoose models before importing the service ────────────────────────
// We stub at the module level so no real DB connection is made.

vi.mock("../models/User", () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../models/LeaderboardSnapshot", () => ({
  default: {
    exists: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
  },
}));

import UserModel from "../models/User";
import LeaderboardSnapshotModel from "../models/LeaderboardSnapshot";
import { getGlobalLeaderboard } from "../services/leaderboard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeUser(
  clerkId: string,
  xp: number,
  plan: string = "free",
  publicProfile: boolean = true
) {
  return {
    clerkId,
    name: `User ${clerkId}`,
    avatar: "",
    plan,
    xp,
    privacyPreferences: { publicProfile },
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  // Default: snapshot doesn't exist → create path
  (LeaderboardSnapshotModel.exists as ReturnType<typeof vi.fn>).mockResolvedValue(null);
  (LeaderboardSnapshotModel.create as ReturnType<typeof vi.fn>).mockResolvedValue({});
  // Default: no previous snapshot → all changes are "same"
  (LeaderboardSnapshotModel.findOne as ReturnType<typeof vi.fn>).mockReturnValue({
    sort: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(null),
  });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getGlobalLeaderboard", () => {
  it("returns top N public users ordered by XP", async () => {
    const users = [
      makeUser("u1", 1000),
      makeUser("u2", 800),
      makeUser("u3", 600),
    ];

    // Both .find() calls return the same user list (top-N + top-500 for snapshot)
    (UserModel.find as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(users),
    });

    const { entries } = await getGlobalLeaderboard(3);

    expect(entries).toHaveLength(3);
    expect(entries[0].rank).toBe(1);
    expect(entries[0].user.id).toBe("u1");
    expect(entries[0].xp).toBe(1000);
  });

  it("assigns correct rank change when previous snapshot exists", async () => {
    const users = [makeUser("u1", 1000), makeUser("u2", 800)];

    (UserModel.find as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(users),
    });

    // u1 was rank 2 before → now rank 1 → change = "up"
    // u2 was rank 1 before → now rank 2 → change = "down"
    (LeaderboardSnapshotModel.findOne as ReturnType<typeof vi.fn>).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({
        date: "2000-01-01",
        entries: [
          { clerkId: "u2", rank: 1, xp: 900 },
          { clerkId: "u1", rank: 2, xp: 700 },
        ],
      }),
    });

    const { entries } = await getGlobalLeaderboard(2);

    const u1 = entries.find((e) => e.user.id === "u1")!;
    const u2 = entries.find((e) => e.user.id === "u2")!;
    expect(u1.change).toBe("up");
    expect(u2.change).toBe("down");
  });

  it("badges Pro/Elite users correctly, leaves free users without badge", async () => {
    const users = [
      makeUser("pro_user", 500, "pro"),
      makeUser("elite_user", 400, "elite"),
      makeUser("free_user", 300, "free"),
    ];

    (UserModel.find as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(users),
    });

    const { entries } = await getGlobalLeaderboard(3);

    expect(entries.find((e) => e.user.id === "pro_user")?.user.badge).toBe("Pro");
    expect(entries.find((e) => e.user.id === "elite_user")?.user.badge).toBe("Elite");
    expect(entries.find((e) => e.user.id === "free_user")?.user.badge).toBeUndefined();
  });

  it("returns currentUserEntry when requestingUser is NOT in the top list", async () => {
    const topUsers = [makeUser("u1", 1000), makeUser("u2", 800)];
    const selfUser = { ...makeUser("self", 100), privacyPreferences: { publicProfile: true } };

    // First call → top-N list; second call → top-500 for snapshot
    (UserModel.find as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(topUsers),
    });

    // Self-lookup for currentUserEntry
    (UserModel.findOne as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(selfUser),
    });

    (UserModel.countDocuments as ReturnType<typeof vi.fn>).mockResolvedValue(99);

    const { currentUserEntry } = await getGlobalLeaderboard(2, "self");

    expect(currentUserEntry).not.toBeNull();
    expect(currentUserEntry?.rank).toBe(100); // 99 users above + 1
    expect(currentUserEntry?.user.id).toBe("self");
  });

  it("snapshot creation is idempotent — duplicate key error (11000) is swallowed", async () => {
    const users = [makeUser("u1", 1000)];

    (UserModel.find as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(users),
    });

    // Simulate concurrent create causing 11000
    const dupError = Object.assign(new Error("dup key"), { code: 11000 });
    (LeaderboardSnapshotModel.create as ReturnType<typeof vi.fn>).mockRejectedValue(dupError);

    // Should NOT throw — 11000 is silently swallowed
    await expect(getGlobalLeaderboard(1)).resolves.toBeDefined();
  });
});
