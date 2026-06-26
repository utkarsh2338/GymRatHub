"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Flame, Zap, Dumbbell, Droplets, TrendingUp, TrendingDown } from "lucide-react";
import type { KPICard as KPICardType } from "@/lib/types";
import AnimatedCounter from "@/components/shared/AnimatedCounter";

const ICONS: Record<string, React.ElementType> = {
  flame: Flame,
  zap: Zap,
  dumbbell: Dumbbell,
  droplets: Droplets,
};

const COLOR_MAP: Record<string, { bg: string; glow: string }> = {
  orange: { bg: "#f97316", glow: "rgba(249,115,22,0.15)" },
  green: { bg: "#39E609", glow: "rgba(57,230,9,0.15)" },
  blue: { bg: "#38bdf8", glow: "rgba(56,189,248,0.15)" },
  purple: { bg: "#a855f7", glow: "rgba(168,85,247,0.15)" },
};

interface Props {
  card: KPICardType;
  index: number;
}

export default function KPICard({ card, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const Icon = ICONS[card.icon] ?? Flame;
  const colors = COLOR_MAP[card.color] ?? COLOR_MAP.green;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      style={{
        background: "#1c1c1c",
        border: "1px solid #2a2a2a",
        borderRadius: 12,
        padding: 20,
        cursor: "pointer",
        transition: "box-shadow 0.3s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: colors.glow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} style={{ color: colors.bg }} />
        </div>
        {card.trend && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: 12,
              fontWeight: 600,
              color: card.trend === "up" ? "#39E609" : "#f97316",
            }}
          >
            {card.trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{card.trendPercent ?? 0}%</span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 4 }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: 28,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {inView ? (
            <AnimatedCounter
              value={typeof card.value === "number" ? card.value : parseFloat(card.value as string)}
              decimals={String(card.value).includes(".") ? 1 : 0}
            />
          ) : "0"}
        </span>
        {card.unit && (
          <span style={{ color: "#9ca3af", fontSize: 13, marginLeft: 4, fontWeight: 500 }}>{card.unit}</span>
        )}
      </div>
      <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 12 }}>{card.label}</p>

      {/* Sparkline */}
      {card.chart && (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 32 }}>
          {card.chart.map((v, i) => {
            const max = Math.max(...card.chart!);
            const pct = (v / max) * 100;
            return (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={{ duration: 0.4, delay: index * 0.08 + i * 0.05 }}
                style={{
                  flex: 1,
                  height: `${pct}%`,
                  borderRadius: 2,
                  transformOrigin: "bottom",
                  background: i === card.chart!.length - 1 ? colors.bg : `${colors.bg}40`,
                }}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
