"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PremiumCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#1c1c1c] border border-red-500/30 rounded-2xl p-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="font-display font-black text-2xl lg:text-3xl text-white mb-2">
          Checkout Cancelled
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          The payment process was cancelled and you have not been charged. If you experienced any issues, please try again.
        </p>
        <Link
          href="/premium"
          className="w-full py-3 rounded-xl border border-[#2a2a2a] text-sm font-medium text-gray-300 hover:border-white/20 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Premium Plans
        </Link>
      </motion.div>
    </div>
  );
}
