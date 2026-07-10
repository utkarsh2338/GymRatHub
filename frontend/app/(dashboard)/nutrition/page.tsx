import type { Metadata } from "next";
import dynamic from "next/dynamic";

const NutritionPageClient = dynamic(() => import("@/components/nutrition/NutritionPage"), {
  loading: () => (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6b7280",
        fontSize: 14,
      }}
    >
      Loading nutrition center...
    </div>
  ),
});

export const metadata: Metadata = { title: "Nutrition Center" };

export default function Page() {
  return <NutritionPageClient />;
}
