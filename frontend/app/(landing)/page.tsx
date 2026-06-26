import type { Metadata } from "next";
import PremiumPageClient from "@/components/premium/PremiumPage";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = { title: "Go Premium — GymRat Hub" };

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <PremiumPageClient />
    </div>
  );
}
