"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Scale, Dumbbell, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { FitnessGoal } from "@/lib/types";

const GOALS: { id: FitnessGoal; label: string; icon: React.ComponentType<any> }[] = [
  { id: "lose_weight", label: "Lose Weight", icon: Scale },
  { id: "build_muscle", label: "Build Muscle", icon: Dumbbell },
  { id: "improve_endurance", label: "Endurance", icon: Flame },
  { id: "stay_active", label: "Stay Active", icon: Sparkles },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 14,
  color: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

interface Props {
  onSave: (data: {
    currentWeight: number;
    targetWeight: number;
    fitnessGoal: FitnessGoal;
  }) => Promise<void>;
  isSaving?: boolean;
}

export default function ProgressTargetSetup({ onSave, isSaving }: Props) {
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("lose_weight");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const current = Number(currentWeight);
    const target = Number(targetWeight);

    if (!current || current < 30 || current > 300) {
      toast.error("Enter a valid current weight (30–300 kg).");
      return;
    }
    if (!target || target < 30 || target > 300) {
      toast.error("Enter a valid target weight (30–300 kg).");
      return;
    }
    if (fitnessGoal === "lose_weight" && target >= current) {
      toast.error("For weight loss, your target should be lower than your current weight.");
      return;
    }
    if (fitnessGoal === "build_muscle" && target <= current) {
      toast.error("For muscle gain, your target should be higher than your current weight.");
      return;
    }

    await onSave({ currentWeight: current, targetWeight: target, fitnessGoal });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "linear-gradient(135deg, #0f1f0f 0%, #1c1c1c 100%)",
        border: "1px solid rgba(57,230,9,0.35)",
        borderRadius: 18,
        padding: "28px 24px",
        maxWidth: 560,
        margin: "0 auto 28px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(57,230,9,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Target size={22} color="#39E609" />
        </div>
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "#fff",
            }}
          >
            Set Your Progress Target
          </h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
            Your charts and stats will be personalized from this baseline.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 20 }}>
        <div>
          <p style={{ color: "#9ca3af", fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Primary goal</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setFitnessGoal(g.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${fitnessGoal === g.id ? "#39E609" : "#2a2a2a"}`,
                  background: fitnessGoal === g.id ? "rgba(57,230,9,0.1)" : "#111",
                  color: fitnessGoal === g.id ? "#39E609" : "#9ca3af",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <g.icon size={16} color={fitnessGoal === g.id ? "#39E609" : "#9ca3af"} style={{ flexShrink: 0 }} /> {g.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
              Current weight (kg)
            </label>
            <div style={{ position: "relative" }}>
              <Scale size={16} color="#6b7280" style={{ position: "absolute", left: 12, top: 13 }} />
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="e.g. 82"
                style={{ ...inputStyle, paddingLeft: 36 }}
                required
              />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
              Target weight (kg)
            </label>
            <div style={{ position: "relative" }}>
              <Target size={16} color="#6b7280" style={{ position: "absolute", left: 12, top: 13 }} />
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="e.g. 75"
                style={{ ...inputStyle, paddingLeft: 36 }}
                required
              />
            </div>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isSaving}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="btn-neon"
          style={{
            width: "100%",
            padding: "13px",
            fontSize: 14,
            fontWeight: 700,
            opacity: isSaving ? 0.8 : 1,
            cursor: isSaving ? "wait" : "pointer",
          }}
        >
          {isSaving ? "Saving target…" : "Start Tracking Progress"}
        </motion.button>
      </form>
    </motion.div>
  );
}
