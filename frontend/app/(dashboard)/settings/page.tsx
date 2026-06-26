import type { Metadata } from "next";
import SettingsPage from "@/components/settings/SettingsPage";

export const metadata: Metadata = {
  title: "Settings | GymRat Hub",
  description: "Manage your account preferences and settings",
};

export default function Page() {
  return <SettingsPage />;
}
