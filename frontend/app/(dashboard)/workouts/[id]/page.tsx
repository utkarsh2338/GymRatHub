import type { Metadata } from "next";
import ExerciseDetailPage from "@/components/workouts/ExerciseDetailPage";

export const metadata: Metadata = {
  title: "Exercise Detail",
};

// Next.js 15 requires params to be awaited as a Promise
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExerciseDetailPage id={id} />;
}
