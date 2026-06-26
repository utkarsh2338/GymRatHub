import type { Metadata } from "next";
import TrainersPage from "@/components/trainers/TrainersPage";

export const metadata: Metadata = {
  title: "Find Your Trainer | GymRat Hub",
  description: "Connect with certified fitness professionals to accelerate your results",
};

export default function Page() {
  return <TrainersPage />;
}
