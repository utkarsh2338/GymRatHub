"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import AnimatedCounter from "@/components/shared/AnimatedCounter";

const STATS = [
  { emoji: "👥", value: 128, suffix: "K+", label: "Active Members", color: "#39E609" },
  { emoji: "⚡", value: 2.4, suffix: "M", label: "Workouts Completed", color: "#f97316", decimals: 1 },
  { emoji: "🔥", value: 980, suffix: "M+", label: "Calories Burned", color: "#38bdf8" },
  { emoji: "⭐", value: 4.7, suffix: "/5", label: "Average Rating", color: "#a855f7", decimals: 1 },
];

export default function StatsBar() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      style={{
        padding: "60px 24px",
        background: "#0d0d0d",
        borderTop: "1px solid #1f1f1f",
        borderBottom: "1px solid #1f1f1f",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 32,
        }}
        className="stats-grid"
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `${stat.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                marginBottom: 4,
              }}
            >
              {stat.emoji}
            </div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(28px, 5vw, 42px)",
                color: stat.color,
                lineHeight: 1,
              }}
            >
              {inView && (
                <AnimatedCounter
                  value={stat.value}
                  decimals={stat.decimals ?? 0}
                  suffix={stat.suffix}
                />
              )}
            </div>
            <p style={{ color: "#6b7280", fontSize: 14 }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>
      <style>{`
        @media (min-width: 768px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
