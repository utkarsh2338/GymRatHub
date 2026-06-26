"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";
import type { FoodItem, Meal, NutritionDay } from "@/lib/types";
import type { ActivityLevel, ClimatePreference } from "@/lib/nutrition-utils";
import WaterTracker, { WaterGoalSetup } from "./WaterTracker";
import MacroCalculator from "./MacroCalculator";
import FoodItemRow from "./FoodItemRow";
import ConfirmModal from "./ConfirmModal";

const MACRO_COLORS = { protein: "#39E609", carbs: "#38bdf8", fat: "#a855f7" };

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

const EMPTY_FOOD_FORM = {
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  amount: "100g",
};

function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference * pct;

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 144, height: 144 }}>
        <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1f1f1f" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none" stroke="#39E609" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={inView ? { strokeDashoffset: circumference - strokeDash } : {}}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{ filter: "drop-shadow(0 0 6px rgba(57,230,9,0.6))" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 24, color: "#fff" }}>
            {inView ? <AnimatedCounter value={consumed} /> : 0}
          </span>
          <span style={{ color: "#6b7280", fontSize: 11 }}>/ {goal} kcal</span>
        </div>
      </div>
      <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 8, fontWeight: 500 }}>Daily Calories</p>
    </div>
  );
}

function MacroBar({ label, amount, goal, color, index }: { label: string; amount: number; goal: number; color: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const pct = goal > 0 ? Math.min((amount / goal) * 100, 100) : 0;

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
        <span style={{ color: "#9ca3af", fontWeight: 500 }}>{label}</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>{amount}g / {goal}g</span>
      </div>
      <div style={{ height: 8, background: "#1f1f1f", borderRadius: 999, overflow: "hidden" }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: index * 0.15 + 0.3, ease: "easeOut" }}
          style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 999, transformOrigin: "left" }}
        />
      </div>
    </div>
  );
}

type DeleteTarget =
  | { type: "item"; mealId: string; itemIndex: number; name: string }
  | { type: "meal"; mealId: string; mealName: string }
  | null;

export default function NutritionPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "meals" | "calculator">("overview");
  const [activeMealId, setActiveMealId] = useState<string | null>(null);
  const [foodForm, setFoodForm] = useState(EMPTY_FOOD_FORM);
  const [showWaterSetup, setShowWaterSetup] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const todayDate = new Date().toISOString().split("T")[0];

  const { data: nutrition, isLoading } = useQuery<NutritionDay>({
    queryKey: ["nutrition", todayDate],
    queryFn: () => api(`/nutrition?date=${todayDate}`),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["nutrition", todayDate] });
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  };

  const logWaterMutation = useMutation({
    mutationFn: (amount: number) =>
      api("/nutrition/water", { method: "POST", body: JSON.stringify({ date: todayDate, amount }) }),
    onSuccess: () => {
      invalidate();
      toast.success("Water intake updated!");
    },
  });

  const waterGoalMutation = useMutation({
    mutationFn: (data: { weightKg: number; activityLevel: ActivityLevel; climate: ClimatePreference; customGoal?: number }) =>
      api("/nutrition/water-goal", { method: "PUT", body: JSON.stringify({ date: todayDate, ...data }) }),
    onSuccess: () => {
      invalidate();
      setShowWaterSetup(false);
      toast.success("Water goal saved!");
    },
    onError: () => toast.error("Failed to save water goal."),
  });

  const logFoodMutation = useMutation({
    mutationFn: ({ mealId, item }: { mealId: string; item: FoodItem }) =>
      api(`/nutrition/meals/${mealId}`, { method: "POST", body: JSON.stringify({ date: todayDate, ...item }) }),
    onSuccess: () => {
      invalidate();
      setActiveMealId(null);
      setFoodForm(EMPTY_FOOD_FORM);
      toast.success("Food logged successfully!");
    },
  });

  const editFoodMutation = useMutation({
    mutationFn: ({ mealId, itemIndex, item }: { mealId: string; itemIndex: number; item: FoodItem }) =>
      api(`/nutrition/meals/${mealId}/items/${itemIndex}`, {
        method: "PATCH",
        body: JSON.stringify({ date: todayDate, ...item }),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Food entry updated.");
    },
    onError: () => toast.error("Failed to update food entry."),
  });

  const deleteFoodMutation = useMutation({
    mutationFn: ({ mealId, itemIndex }: { mealId: string; itemIndex: number }) =>
      api(`/nutrition/meals/${mealId}/items/${itemIndex}?date=${todayDate}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success("Food entry deleted.");
    },
    onError: () => toast.error("Failed to delete food entry."),
  });

  const duplicateItemMutation = useMutation({
    mutationFn: ({ mealId, itemIndex }: { mealId: string; itemIndex: number }) =>
      api(`/nutrition/meals/${mealId}/items/${itemIndex}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ date: todayDate }),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Food item duplicated.");
    },
  });

  const duplicateMealMutation = useMutation({
    mutationFn: (mealId: string) =>
      api(`/nutrition/meals/${mealId}/duplicate`, { method: "POST", body: JSON.stringify({ date: todayDate }) }),
    onSuccess: () => {
      invalidate();
      toast.success("Meal duplicated — all items added again.");
    },
    onError: (err: Error) => toast.error(err?.message || "Could not duplicate meal."),
  });

  const saveGoalsMutation = useMutation({
    mutationFn: (goals: { calories: number; protein: number; carbs: number; fat: number; water: number }) =>
      api("/nutrition/goals", { method: "PUT", body: JSON.stringify({ date: todayDate, ...goals }) }),
    onSuccess: () => {
      invalidate();
      toast.success("Nutrition goals saved!");
    },
    onError: () => toast.error("Failed to save nutrition goals."),
  });

  const waterSetupPrompted = useRef(false);
  useEffect(() => {
    if (!isLoading && nutrition && !nutrition.preferences?.waterGoalConfigured && !waterSetupPrompted.current) {
      waterSetupPrompted.current = true;
      setShowWaterSetup(true);
    }
  }, [isLoading, nutrition]);

  if (isLoading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(57,230,9,0.1)", borderTopColor: "#39E609", animation: "nutrition-spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 14, color: "#6b7280" }}>Loading nutrition details...</span>
        <style>{`@keyframes nutrition-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const prefs = nutrition?.preferences;
  const waterGoalConfigured = prefs?.waterGoalConfigured ?? false;

  const { calories, macros, water, meals } = nutrition || {
    calories: { consumed: 0, goal: 2100 },
    macros: { protein: { amount: 0, goal: 180 }, carbs: { amount: 0, goal: 300 }, fat: { amount: 0, goal: 120 } },
    water: { consumed: 0, goal: 3.5 },
    meals: [] as Meal[],
  };

  const pieData = [
    { name: "Protein", value: macros.protein.amount || 1, color: MACRO_COLORS.protein },
    { name: "Carbs", value: macros.carbs.amount || 1, color: MACRO_COLORS.carbs },
    { name: "Fat", value: macros.fat.amount || 1, color: MACRO_COLORS.fat },
  ];

  const handleFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMealId || !foodForm.name || !foodForm.calories) return;
    logFoodMutation.mutate({
      mealId: activeMealId,
      item: {
        name: foodForm.name,
        calories: Number(foodForm.calories),
        protein: Number(foodForm.protein || 0),
        carbs: Number(foodForm.carbs || 0),
        fat: Number(foodForm.fat || 0),
        amount: foodForm.amount,
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "item") {
      deleteFoodMutation.mutate({ mealId: deleteTarget.mealId, itemIndex: deleteTarget.itemIndex });
    }
    // Meal duplicate-all uses duplicate endpoint; full meal delete not requested
  };

  const renderFoodForm = (meal: Meal) => (
    <div style={{ background: "#111", border: "1px solid #333", borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <form onSubmit={handleFoodSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ gridColumn: "span 2" }}>
          <input placeholder="Food Name (e.g. Eggs, Oats)" value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} style={inputSty} required />
        </div>
        <input placeholder="Amount (e.g. 100g)" value={foodForm.amount} onChange={(e) => setFoodForm({ ...foodForm, amount: e.target.value })} style={inputSty} />
        <input type="number" placeholder="Calories (kcal)" value={foodForm.calories} onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })} style={inputSty} required />
        <input type="number" placeholder="Protein (g)" value={foodForm.protein} onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })} style={inputSty} />
        <input type="number" placeholder="Carbs (g)" value={foodForm.carbs} onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })} style={inputSty} />
        <input type="number" placeholder="Fat (g)" value={foodForm.fat} onChange={(e) => setFoodForm({ ...foodForm, fat: e.target.value })} style={{ ...inputSty, gridColumn: "span 2" }} />
        <button type="submit" className="btn-neon" style={{ gridColumn: "span 2", padding: "8px", fontSize: 12 }} disabled={logFoodMutation.isPending}>
          {logFoodMutation.isPending ? "Adding…" : "Add Item"}
        </button>
      </form>
    </div>
  );

  return (
    <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "clamp(22px, 3vw, 30px)", color: "#fff", marginBottom: 4 }}>
          Nutrition Center
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Track your daily nutrition goals</p>
      </div>

      <div style={{ display: "flex", gap: 4, background: "#111", padding: 4, borderRadius: 12, width: "fit-content" }}>
        {(["overview", "meals", "calculator"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none",
              background: activeTab === tab ? "#39E609" : "transparent",
              color: activeTab === tab ? "#000" : "#6b7280", textTransform: "capitalize",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gap: 20 }} className="nutrition-top-grid">
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#fff", alignSelf: "flex-start" }}>Daily Calorie Summary</h3>
              <CalorieRing consumed={calories.consumed} goal={calories.goal} />
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                {(Object.entries(macros) as [string, { amount: number; goal: number }][]).map(([key, val], i) => (
                  <MacroBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} amount={val.amount} goal={val.goal} color={MACRO_COLORS[key as keyof typeof MACRO_COLORS]} index={i} />
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 16 }}>Macro Breakdown</h3>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={1200}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 8 }} itemStyle={{ color: "#fff", fontSize: 12 }} formatter={(v: unknown) => [`${v}g`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {pieData.map((d) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                      <span style={{ color: "#9ca3af" }}>{d.name}</span>
                    </div>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{d.value}g</span>
                  </div>
                ))}
              </div>
            </div>

            <WaterTracker
              consumed={water.consumed}
              goal={water.goal}
              onAddWater={(amt) => {
                if (!waterGoalConfigured) {
                  setShowWaterSetup(true);
                  return;
                }
                logWaterMutation.mutate(amt);
              }}
              onOpenSetup={() => setShowWaterSetup(true)}
              goalConfigured={waterGoalConfigured}
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontWeight: 600, color: "#fff", fontSize: 15 }}>Meal Plan</h2>
              <button onClick={() => setActiveTab("meals")} style={{ background: "none", border: "none", color: "#39E609", fontSize: 12, cursor: "pointer" }}>View Detail</button>
            </div>
            <div style={{ display: "grid", gap: 16 }} className="meals-grid">
              {meals.map((meal, i) => {
                const totalCals = meal.items.reduce((s, it) => s + it.calories, 0);
                return (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    style={{ ...cardStyle, cursor: "pointer" }}
                    onClick={() => { setActiveMealId(meal.id); setActiveTab("meals"); }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{meal.emoji}</div>
                    <h4 style={{ fontWeight: 600, color: "#fff", fontSize: 14, marginBottom: 4 }}>{meal.name}</h4>
                    <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 12 }}>{meal.time}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {meal.items.slice(0, 2).map((item) => (
                        <div key={`${item.name}-${item.calories}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "#9ca3af" }}>{item.name}</span>
                          <span style={{ color: "#4b5563" }}>{item.calories} kcal</span>
                        </div>
                      ))}
                      {meal.items.length > 2 && <p style={{ color: "#4b5563", fontSize: 12 }}>+{meal.items.length - 2} more</p>}
                    </div>
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>Total</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#39E609" }}>{totalCals} kcal</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "calculator" && (
        <MacroCalculator
          onSaveGoals={(goals) => saveGoalsMutation.mutate(goals)}
          saving={saveGoalsMutation.isPending}
        />
      )}

      {activeTab === "meals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {meals.map((meal, i) => (
            <motion.div key={meal.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{meal.emoji}</span>
                  <div>
                    <h4 style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{meal.name}</h4>
                    <p style={{ color: "#6b7280", fontSize: 12 }}>{meal.time}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {meal.items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => duplicateMealMutation.mutate(meal.id)}
                      disabled={duplicateMealMutation.isPending}
                      style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: "1px solid #2a2a2a", background: "#111", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Copy size={13} /> Duplicate Meal
                    </button>
                  )}
                  <button className="btn-neon" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => setActiveMealId(meal.id)}>
                    + Add Food
                  </button>
                </div>
              </div>

              {activeMealId === meal.id && renderFoodForm(meal)}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <AnimatePresence mode="popLayout">
                  {meal.items.map((item, itemIdx) => (
                    <FoodItemRow
                      key={`${meal.id}-${itemIdx}-${item.name}`}
                      item={item}
                      onDelete={() => setDeleteTarget({ type: "item", mealId: meal.id, itemIndex: itemIdx, name: item.name })}
                      onEdit={(updated) => editFoodMutation.mutate({ mealId: meal.id, itemIndex: itemIdx, item: updated })}
                      onDuplicate={() => duplicateItemMutation.mutate({ mealId: meal.id, itemIndex: itemIdx })}
                    />
                  ))}
                </AnimatePresence>
                {meal.items.length === 0 && (
                  <p style={{ color: "#4b5563", fontSize: 12, textAlign: "center", padding: "8px 0" }}>No food logged for this meal yet.</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <WaterGoalSetup
        open={showWaterSetup}
        onClose={() => setShowWaterSetup(false)}
        onSave={(data) => waterGoalMutation.mutate(data)}
        loading={waterGoalMutation.isPending}
        initial={prefs ? {
          waterWeightKg: prefs.waterWeightKg,
          waterActivityLevel: prefs.waterActivityLevel as ActivityLevel,
          waterClimate: prefs.waterClimate as ClimatePreference,
          waterGoal: prefs.waterGoal,
        } : undefined}
      />

      <ConfirmModal
        open={deleteTarget?.type === "item"}
        title="Delete food entry?"
        message={`Remove "${deleteTarget?.type === "item" ? deleteTarget.name : ""}" from your log? Calories and macros will be recalculated.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteFoodMutation.isPending}
      />

      <style>{`
        .nutrition-top-grid { grid-template-columns: 1fr; }
        @media (min-width: 768px) { .nutrition-top-grid { grid-template-columns: repeat(3, 1fr); } }
        .meals-grid { grid-template-columns: 1fr; }
        @media (min-width: 640px) { .meals-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1280px) { .meals-grid { grid-template-columns: repeat(4, 1fr); } }
      `}</style>
    </div>
  );
}
