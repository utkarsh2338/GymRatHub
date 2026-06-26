import type { Metadata } from "next";
import AuthPageClient from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Sign In — GymRat Hub",
  description: "Login or create your GymRat Hub account to start training.",
};

export default function Page() {
  return <AuthPageClient />;
}
