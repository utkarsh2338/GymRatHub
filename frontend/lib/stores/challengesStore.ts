import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Challenge } from "@/lib/types";

export interface Badge {
  id: string;
  name: string;
  desc: string;
  xp: number;
  color: string;
  earned: boolean;
}

interface ChallengesState {
  challenges: Challenge[];
  badges: Badge[];
  xp: number;
  level: number;

  // Actions
  setChallenges: (challenges: Challenge[]) => void;
  setBadges: (badges: Badge[]) => void;
  setXPAndLevel: (xp: number, level: number) => void;
  joinChallenge: (challengeId: string) => void;
}

export const useChallengesStore = create<ChallengesState>()(
  persist(
    (set) => ({
      challenges: [],
      badges: [],
      xp: 0,
      level: 1,

      setChallenges: (challenges) => set({ challenges }),
      setBadges: (badges) => set({ badges }),
      setXPAndLevel: (xp, level) => set({ xp, level }),
      joinChallenge: (challengeId) =>
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId
              ? { ...c, status: "joined", participants: c.participants + 1 }
              : c
          ),
        })),
    }),
    {
      name: "gymrat-challenges-store",
    }
  )
);
