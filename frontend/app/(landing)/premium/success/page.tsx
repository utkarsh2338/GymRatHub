"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function PremiumSuccessPage() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate user queries to force updating the tier visually
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
  }, [queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#1c1c1c] border border-[#39E609]/30 rounded-2xl p-8 text-center shadow-neon-sm"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#39E609]/10 rounded-full mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#39E609]" />
        </div>
        <h1 className="font-display font-black text-2xl lg:text-3xl text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Thank you for subscribing! Your GymRat Hub account has been upgraded successfully. Get ready to train like a pro.
        </p>
        <Link
          href="/dashboard"
          className="btn-neon w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
