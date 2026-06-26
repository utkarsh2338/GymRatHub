"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ActivityEntry } from "@/lib/types";

interface Props {
  data: ActivityEntry[];
  weeklyTotal: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
        <p style={{ color: "#9ca3af", fontSize: 11 }}>{label}</p>
        <p style={{ color: "#fff", fontWeight: 700 }}>{payload[0].value} min</p>
      </div>
    );
  }
  return null;
};

export default function WeeklyActivityChart({ data, weeklyTotal }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const maxVal = Math.max(...data.map((d) => d.minutes));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 12, padding: 20 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>Weekly Activity</h3>
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>Minutes per day</p>
        </div>
        <span style={{ color: "#38bdf8", fontSize: 12, fontWeight: 700, background: "rgba(56,189,248,0.1)", padding: "4px 8px", borderRadius: 4 }}>
          {weeklyTotal} min / wk
        </span>
      </div>
      <div style={{ height: 192 }}>
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]} animationDuration={1200}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.minutes === maxVal ? "#39E609" : "#38bdf8"}
                    fillOpacity={entry.minutes === maxVal ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
