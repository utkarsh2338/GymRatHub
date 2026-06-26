"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { WeightEntry } from "@/lib/types";

interface Props {
  data: WeightEntry[];
  badge: string;
  subtitle?: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
        <p style={{ color: "#9ca3af", fontSize: 11 }}>{label}</p>
        <p style={{ color: "#fff", fontWeight: 700 }}>{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

export default function WeightProgressChart({ data, badge, subtitle }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 12, padding: 20 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>Weight Progress</h3>
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{subtitle ?? "Last 8 weeks"}</p>
        </div>
        <span style={{ color: "#39E609", fontSize: 12, fontWeight: 700, background: "rgba(57,230,9,0.1)", padding: "4px 8px", borderRadius: 4 }}>
          {badge}
        </span>
      </div>
      <div style={{ height: 192 }}>
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="weight" stroke="#39E609" strokeWidth={2.5}
                dot={{ fill: "#39E609", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#39E609", stroke: "#0a0a0a", strokeWidth: 2 }}
                animationDuration={1500} animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
