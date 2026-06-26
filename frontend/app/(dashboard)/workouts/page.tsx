import type { Metadata } from "next";
import WorkoutsPage from "@/components/workouts/WorkoutsPage";

export const metadata: Metadata = {
  title: "Workout Library",
  description: "Browse 10,000+ workouts filtered by muscle group, difficulty, and equipment.",
};

export default function Page() {
  return <WorkoutsPage />;
}
