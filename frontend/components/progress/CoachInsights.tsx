"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingDown, Minus, AlertTriangle, Sparkles } from "lucide-react";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import type { PlateauInsight } from "@/lib/types";

const T = {
  card: "#1c1c1c",
  border: "#2a2a2a",
  green: "#39E609",
  orange: "#f97316",
  red: "#ef4444",
  textPrimary: "#ffffff",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
};

const SEVERITY_COLOR: Record<PlateauInsight["severity"], string> = {
  severe: T.red,
  moderate: T.orange,
  mild: "#eab308",
  none: T.green,
};

const TYPE_ICON: Record<PlateauInsight["type"], typeof TrendingDown> = {
  regressing: TrendingDown,
  strength_stall: Minus,
  volume_stall: Minus,
  inconsistent: AlertTriangle,
};

interface CoachResponse {
  insights: PlateauInsight[];
  narrative: string;
}

export default function CoachInsights() {
  const apiClient = useApiClient();
  const isApiReady = useIsApiReady();

  const { data, isLoading, isError } = useQuery<CoachResponse>({
    queryKey: ["insights", "coach"],
    queryFn: () => apiClient("/insights/coach"),
    enabled: isApiReady,
    staleTime: 5 * 60 * 1000, // recompute at most every 5 minutes per user
  });

  if (!isApiReady || isLoading) {
    return (
      <div
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <p style={{ color: T.textMuted, fontSize: 13, margin: 0 }}>Analyzing your training history…</p>
      </div>
    );
  }

  if (isError || !data) {
    return null; // Fail quietly — this is a bonus insight, not core functionality.
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "rgba(168, 85, 247, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={16} color="#a855f7" />
        </div>
        <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 700, margin: 0 }}>Coach Insights</h3>
      </div>

      <p style={{ color: T.textSecondary, fontSize: 13.5, lineHeight: 1.6, margin: "0 0 16px" }}>
        {data.narrative}
      </p>

      {data.insights.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.insights.slice(0, 4).map((insight) => {
            const Icon = TYPE_ICON[insight.type];
            return (
              <div
                key={insight.exerciseName}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  background: "#111",
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                <Icon size={16} color={SEVERITY_COLOR[insight.severity]} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ color: T.textPrimary, fontWeight: 600, fontSize: 13.5 }}>
                      {insight.exerciseName}
                    </span>
                    <span
                      style={{
                        color: SEVERITY_COLOR[insight.severity],
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      {insight.percentChange > 0 ? "+" : ""}
                      {insight.percentChange}% / {insight.windowDays}d
                    </span>
                  </div>
                  <p style={{ color: T.textMuted, fontSize: 12.5, margin: "4px 0 0", lineHeight: 1.5 }}>
                    {insight.recommendation.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data.insights.length === 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#111",
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          <Sparkles size={16} color={T.green} />
          <span style={{ color: T.textMuted, fontSize: 12.5 }}>No plateaus detected — everything's trending up.</span>
        </div>
      )}
    </motion.div>
  );
}
