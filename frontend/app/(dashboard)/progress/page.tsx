import type { Metadata } from "next";
import ProgressPageClient from "@/components/progress/ProgressPage";

export const metadata: Metadata = { title: "Progress Tracking" };

export default function Page() {
  return <ProgressPageClient />;
}
