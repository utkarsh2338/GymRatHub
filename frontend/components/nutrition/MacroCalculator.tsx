"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Copy, Share2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  ACTIVITY_LEVELS,
  MACRO_GOALS,
  calculateMacros,
  formatMacroSummary,
  type ActivityLevel,
  type Gender,
  type MacroGoal,
} from "@/lib/nutrition-utils";

const cardStyle: React.CSSProperties = {
  background: "#1c1c1c",
  border: "1px solid #2a2a2a",
  borderRadius: 12,
  padding: 24,
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
  onSaveGoals: (goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  }) => void;
  saving?: boolean;
}

export default function MacroCalculator({ onSaveGoals, saving }: Props) {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<ActivityLevel>("moderately_active");
  const [goal, setGoal] = useState<MacroGoal>("maintain");

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    const a = Number(age);
    const w = Number(weight);
    const h = Number(height);
    if (!age || a < 13 || a > 100) errors.push("Age must be between 13 and 100.");
    if (!weight || w < 30 || w > 300) errors.push("Weight must be between 30 and 300 kg.");
    if (!height || h < 100 || h > 250) errors.push("Height must be between 100 and 250 cm.");
    return errors;
  }, [age, weight, height]);

  const result = useMemo(() => {
    if (validationErrors.length) return null;
    return calculateMacros({
      age: Number(age),
      weightKg: Number(weight),
      heightCm: Number(height),
      gender,
      activityLevel: activity,
      goal,
    });
  }, [age, weight, height, gender, activity, goal, validationErrors.length]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(formatMacroSummary(result));
      toast.success("Macros copied to clipboard!");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const text = formatMacroSummary(result);
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Macro Targets", text });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await handleCopy();
  };

  const resultRows = result
    ? [
        { label: "Daily Calories", value: `${result.calories} kcal`, color: "#39E609" },
        { label: "Protein Target", value: `${result.protein}g`, color: "#39E609" },
        { label: "Carbohydrate Target", value: `${result.carbs}g`, color: "#38bdf8" },
        { label: "Fat Target", value: `${result.fat}g`, color: "#a855f7" },
        { label: "Recommended Water", value: `${result.water}L`, color: "#38bdf8" },
      ]
    : [];

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Calculator size={18} color="#39E609" />
        <h3 style={{ fontWeight: 600, color: "#fff", margin: 0 }}>Macro Calculator</h3>
      </div>

      <div className="macro-calc-grid" style={{ display: "grid", gap: 24 }}>
        {/* Left: inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Age", value: age, set: setAge, placeholder: "25" },
            { label: "Weight (kg)", value: weight, set: setWeight, placeholder: "75" },
            { label: "Height (cm)", value: height, set: setHeight, placeholder: "175" },
          ].map((f) => (
            <div key={f.label}>
              <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input
                type="number"
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.placeholder}
                style={inputSty}
              />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 8 }}>Gender</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["male", "female"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: `1px solid ${gender === g ? "#39E609" : "#2a2a2a"}`,
                    background: gender === g ? "rgba(57,230,9,0.1)" : "#111",
                    color: gender === g ? "#39E609" : "#9ca3af",
                    fontSize: 13,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 8 }}>Activity Level</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ACTIVITY_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setActivity(lvl.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1px solid ${activity === lvl.id ? "#39E609" : "#2a2a2a"}`,
                    background: activity === lvl.id ? "rgba(57,230,9,0.08)" : "#111",
                    color: activity === lvl.id ? "#39E609" : "#9ca3af",
                    fontSize: 12,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontWeight: 600, color: activity === lvl.id ? "#fff" : "#e5e7eb" }}>{lvl.label}</span>
                  <span style={{ display: "block", fontSize: 11, marginTop: 2, color: "#6b7280" }}>{lvl.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 8 }}>Goal</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MACRO_GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  style={{
                    flex: 1,
                    minWidth: 90,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1px solid ${goal === g.id ? "#39E609" : "#2a2a2a"}`,
                    background: goal === g.id ? "rgba(57,230,9,0.1)" : "#111",
                    color: goal === g.id ? "#39E609" : "#9ca3af",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: 12 }}>
              {validationErrors.map((err) => (
                <p key={err} style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>{err}</p>
              ))}
            </div>
          )}
        </div>

        {/* Right: results */}
        <div
          style={{
            background: "#111",
            border: "1px solid #2a2a2a",
            borderRadius: 12,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <h4 style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0 }}>Your Targets</h4>

          {result ? (
            <>
              {resultRows.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: i < resultRows.length - 1 ? "1px solid #1f1f1f" : "none" }}
                >
                  <span style={{ color: "#9ca3af", fontSize: 13 }}>{row.label}</span>
                  <span style={{ color: row.color, fontWeight: 700, fontSize: 16 }}>{row.value}</span>
                </motion.div>
              ))}
              <p style={{ color: "#6b7280", fontSize: 11, margin: 0 }}>
                BMR {result.bmr} kcal · TDEE {result.tdee} kcal
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => onSaveGoals(result)}
                  disabled={saving}
                  className="btn-neon"
                  style={{ width: "100%", padding: "10px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: saving ? 0.7 : 1 }}
                >
                  <Save size={14} /> {saving ? "Saving…" : "Save to Nutrition Goals"}
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #2a2a2a", background: "#1c1c1c", color: "#9ca3af", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <Copy size={13} /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #2a2a2a", background: "#1c1c1c", color: "#9ca3af", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <Share2 size={13} /> Share
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>
              Enter your details on the left. Results update in real time once all fields are valid.
            </p>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .macro-calc-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
