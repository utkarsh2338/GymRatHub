import type { Metadata } from "next";
import DashboardPage from "@/components/dashboard/DashboardPage";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personal fitness dashboard with live KPIs, charts, and today's workout.",
};

export default function Page() {
  return <DashboardPage />;
}
