import ActiveWorkoutSession from "@/components/workouts/ActiveWorkoutSession";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ActiveWorkoutSession sessionId={id} />;
}
