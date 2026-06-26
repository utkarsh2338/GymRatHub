import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsBar from "@/components/landing/StatsBar";
import FeaturedAthletes from "@/components/landing/FeaturedAthletes";
import TestimonialsCarousel from "@/components/landing/TestimonialsCarousel";
import NewsletterSection from "@/components/landing/NewsletterSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GymRat Hub — Train Smarter. Live Stronger.",
  description:
    "Join 128K+ athletes. Access 10,000+ workouts, expert trainers, and advanced analytics.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturedAthletes />
      <TestimonialsCarousel />
      <NewsletterSection />
    </div>
  );
}
