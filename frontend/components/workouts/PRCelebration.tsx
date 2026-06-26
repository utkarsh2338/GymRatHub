"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";

interface PR {
  type: string;
  exerciseName: string;
  value: number;
  label: string;
}

interface Props {
  prs: PR[];
  onClose: () => void;
}

export default function PRCelebration({ prs, onClose }: Props) {
  if (!prs.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md rounded-2xl border border-[#39E609]/40 bg-[#1c1c1c] p-8 text-center shadow-[0_0_60px_rgba(57,230,9,0.2)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#111] border border-[#2a2a2a] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>

          <motion.div
            animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, repeat: 2 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#39E609]/20 flex items-center justify-center"
          >
            <Trophy className="w-8 h-8 text-[#39E609]" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-1">New Personal Record!</h2>
          <p className="text-gray-500 text-sm mb-6">You crushed it today</p>

          <ul className="space-y-3 text-left">
            {prs.map((pr, i) => (
              <motion.li
                key={`${pr.type}-${pr.exerciseName}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i }}
                className="rounded-lg border border-[#39E609]/20 bg-[#39E609]/5 px-4 py-3"
              >
                <p className="text-sm font-semibold text-[#39E609]">{pr.exerciseName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{pr.label}</p>
              </motion.li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onClose}
            className="btn-neon mt-6 w-full py-3 text-sm font-bold"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
