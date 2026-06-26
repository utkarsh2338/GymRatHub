"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Settings2 } from "lucide-react";
import {
  ACTIVITY_LEVELS,
  CLIMATE_OPTIONS,
  suggestWaterGoal,
  type ActivityLevel,
  type ClimatePreference,
} from "@/lib/nutrition-utils";

const cardStyle: React.CSSProperties = {
  background: "#1c1c1c",
  border: "1px solid #2a2a2a",
  borderRadius: 12,
  padding: 20,
};

const inputSty: React.CSSProperties = {
  width: "100%",
  background: "#111",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 13,
  color: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

interface Props {
  consumed: number;
  goal: number;
  onAddWater: (amt: number) => void;
  onOpenSetup: () => void;
  goalConfigured: boolean;
}

export default function WaterTracker({
  consumed,
  goal,
  onAddWater,
  onOpenSetup,
  goalConfigured,
}: Props) {
  const [celebrated, setCelebrated] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const remaining = Math.max(0, Math.round((goal - consumed) * 10) / 10);
  const pctDisplay = goal > 0 ? Math.round(pct * 1000) / 10 : 0;
  const isComplete = goal > 0 && consumed >= goal;

  useEffect(() => {
    if (isComplete && !celebrated) {
      setCelebrated(true);
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(t);
    }
    if (!isComplete) setCelebrated(false);
  }, [isComplete, celebrated]);

  if (!goalConfigured) {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Droplets size={16} color="#38bdf8" />
          <h3 style={{ fontWeight: 600, fontSize: 14, color: "#fff", margin: 0 }}>Water Tracker</h3>
        </div>
        <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
          Set a personalized daily water goal based on your weight, activity level, and climate
          before you start tracking.
        </p>
        <button
          type="button"
          onClick={onOpenSetup}
          className="btn-neon"
          style={{ width: "100%", padding: "10px", fontSize: 13, fontWeight: 600 }}
        >
          Set Water Goal
        </button>
      </div>
    );
  }

  return (
    <div style={{ ...cardStyle, position: "relative", overflow: "hidden" }}>
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            background: "rgba(56,189,248,0.15)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 48 }}
          >
            💧
          </motion.span>
          <p style={{ color: "#38bdf8", fontWeight: 700, fontSize: 16 }}>Daily goal achieved!</p>
          <p style={{ color: "#9ca3af", fontSize: 12 }}>Great hydration today</p>
        </motion.div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Droplets size={16} color="#38bdf8" />
          <h3 style={{ fontWeight: 600, fontSize: 14, color: "#fff", margin: 0 }}>Water Tracker</h3>
        </div>
        <button
          type="button"
          onClick={onOpenSetup}
          style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4 }}
          title="Edit water goal"
        >
          <Settings2 size={14} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Current", value: `${consumed.toFixed(1)}L`, color: "#38bdf8" },
          { label: "Daily Goal", value: `${goal.toFixed(1)}L`, color: "#fff" },
          { label: "Remaining", value: `${remaining.toFixed(1)}L`, color: remaining > 0 ? "#f97316" : "#39E609" },
          { label: "Progress", value: `${pctDisplay}%`, color: "#39E609" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{ background: "#111", borderRadius: 8, padding: "10px 12px", border: "1px solid #1f1f1f" }}
          >
            <p style={{ color: "#6b7280", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {stat.label}
            </p>
            <p style={{ color: stat.color, fontWeight: 700, fontSize: 16, margin: "4px 0 0" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", height: 80, background: "#111", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <motion.div
          key={consumed}
          initial={{ height: 0 }}
          animate={{ height: `${pct * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, rgba(56,189,248,0.85), rgba(56,189,248,0.35))",
          }}
        />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{pctDisplay}%</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {[0.25, 0.5].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => onAddWater(amt)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.3)",
              color: "#38bdf8",
              fontSize: 12,
              fontWeight: 500,
              padding: "10px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            +{amt * 1000}ml
          </button>
        ))}
      </div>
    </div>
  );
}

interface SetupProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    weightKg: number;
    activityLevel: ActivityLevel;
    climate: ClimatePreference;
    customGoal?: number;
  }) => void;
  loading?: boolean;
  initial?: {
    waterWeightKg: number | null;
    waterActivityLevel: ActivityLevel;
    waterClimate: ClimatePreference;
    waterGoal: number;
  };
}

export function WaterGoalSetup({ open, onClose, onSave, loading, initial }: SetupProps) {
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderately_active");
  const [climate, setClimate] = useState<ClimatePreference>("mild");
  const [useCustom, setUseCustom] = useState(false);
  const [customGoal, setCustomGoal] = useState("");

  useEffect(() => {
    if (open && initial) {
      setWeight(initial.waterWeightKg ? String(initial.waterWeightKg) : "");
      setActivity((initial.waterActivityLevel as ActivityLevel) ?? "moderately_active");
      setClimate((initial.waterClimate as ClimatePreference) ?? "mild");
      setCustomGoal(String(initial.waterGoal ?? ""));
    }
  }, [open, initial]);

  const suggested = useMemo(() => {
    const w = Number(weight);
    if (!w || w < 30) return null;
    return suggestWaterGoal(w, activity, climate);
  }, [weight, activity, climate]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = Number(weight);
    if (!w || w < 30 || w > 300) return;
    onSave({
      weightKg: w,
      activityLevel: activity,
      climate,
      customGoal: useCustom && customGoal ? Number(customGoal) : undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1c1c1c",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 24,
          maxWidth: 440,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Set Your Water Goal</h3>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
          We&apos;ll suggest a daily target from your body weight, activity, and climate.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>Body Weight (kg)</label>
            <input
              type="number"
              min={30}
              max={300}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 75"
              style={inputSty}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 8 }}>Fitness Activity Level</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ACTIVITY_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setActivity(lvl.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1px solid ${activity === lvl.id ? "#38bdf8" : "#2a2a2a"}`,
                    background: activity === lvl.id ? "rgba(56,189,248,0.1)" : "#111",
                    color: activity === lvl.id ? "#38bdf8" : "#9ca3af",
                    fontSize: 12,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontWeight: 600, color: activity === lvl.id ? "#fff" : "#e5e7eb" }}>{lvl.label}</span>
                  <span style={{ display: "block", fontSize: 11, marginTop: 2 }}>{lvl.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 8 }}>Climate Preference</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CLIMATE_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setClimate(c.id)}
                  style={{
                    flex: 1,
                    minWidth: 100,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1px solid ${climate === c.id ? "#38bdf8" : "#2a2a2a"}`,
                    background: climate === c.id ? "rgba(56,189,248,0.1)" : "#111",
                    color: climate === c.id ? "#38bdf8" : "#9ca3af",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {suggested != null && (
            <div style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.25)", borderRadius: 8, padding: 12 }}>
              <p style={{ color: "#38bdf8", fontSize: 13, fontWeight: 600, margin: 0 }}>Suggested daily goal: {suggested}L</p>
            </div>
          )}

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9ca3af", cursor: "pointer" }}>
            <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} />
            Use a custom goal instead
          </label>

          {useCustom && (
            <input
              type="number"
              step={0.1}
              min={1}
              max={10}
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="Custom goal in liters"
              style={inputSty}
            />
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #2a2a2a", background: "#111", color: "#9ca3af", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-neon"
              disabled={loading || !weight}
              style={{ flex: 1, padding: "10px", fontWeight: 600, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Saving…" : "Save Goal"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
