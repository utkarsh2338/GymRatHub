import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ProgressPageClient = dynamic(() => import("@/components/progress/ProgressPage"), {
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
      Loading progress tracking...
    </div>
  ),
});

export const metadata: Metadata = { title: "Progress Tracking" };

export default function Page() {
  return <ProgressPageClient />;
}
