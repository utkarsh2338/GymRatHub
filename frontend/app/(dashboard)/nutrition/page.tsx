import type { Metadata } from "next";
import NutritionPageClient from "@/components/nutrition/NutritionPage";

export const metadata: Metadata = { title: "Nutrition Center" };

export default function Page() {
  return <NutritionPageClient />;
}
