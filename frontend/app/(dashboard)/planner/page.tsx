import type { Metadata } from "next";
import PlannerPageClient from "@/components/planner/PlannerPage";

export const metadata: Metadata = { title: "Workout Planner" };

export default function Page() {
  return <PlannerPageClient />;
}
