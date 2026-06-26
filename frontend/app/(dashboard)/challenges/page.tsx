import type { Metadata } from "next";
import ChallengesPageClient from "@/components/challenges/ChallengesPage";

export const metadata: Metadata = { title: "Challenges" };

export default function Page() {
  return <ChallengesPageClient />;
}
