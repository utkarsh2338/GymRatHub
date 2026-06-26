"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Pencil, Copy, Check, X } from "lucide-react";
import type { FoodItem } from "@/lib/types";

const inputSty: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid #2a2a2a",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 12,
  color: "#fff",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

interface Props {
  item: FoodItem;
  onDelete: () => void;
  onEdit: (updated: FoodItem) => void;
  onDuplicate: () => void;
}

export default function FoodItemRow({ item, onDelete, onEdit, onDuplicate }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...item });

  const handleSave = () => {
    if (!form.name.trim() || !form.calories) return;
    onEdit({
      ...form,
      calories: Number(form.calories),
      protein: Number(form.protein || 0),
      carbs: Number(form.carbs || 0),
      fat: Number(form.fat || 0),
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({ ...item });
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, padding: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: "flex",
        alignItems: editing ? "flex-start" : "center",
        justifyContent: "space-between",
        background: "#111",
        borderRadius: 8,
        padding: editing ? "14px 16px" : "12px 16px",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {editing ? (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, minWidth: 200 }}>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Food name"
            style={{ ...inputSty, gridColumn: "span 2" }}
          />
          <input
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="Amount"
            style={inputSty}
          />
          <input
            type="number"
            value={form.calories}
            onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
            placeholder="Calories"
            style={inputSty}
          />
          <input
            type="number"
            value={form.protein}
            onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })}
            placeholder="Protein"
            style={inputSty}
          />
          <input
            type="number"
            value={form.carbs}
            onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })}
            placeholder="Carbs"
            style={inputSty}
          />
          <input
            type="number"
            value={form.fat}
            onChange={(e) => setForm({ ...form, fat: Number(e.target.value) })}
            placeholder="Fat"
            style={{ ...inputSty, gridColumn: "span 2" }}
          />
          <div style={{ gridColumn: "span 2", display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleSave}
              style={{ flex: 1, padding: "6px", borderRadius: 6, border: "none", background: "#39E609", color: "#000", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
            >
              <Check size={14} /> Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{ flex: 1, padding: "6px", borderRadius: 6, border: "1px solid #2a2a2a", background: "#1c1c1c", color: "#9ca3af", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, minWidth: 120 }}>
            <p style={{ color: "#fff", fontSize: 14, fontWeight: 500, margin: 0 }}>{item.name}</p>
            <p style={{ color: "#6b7280", fontSize: 12, margin: "2px 0 0" }}>{item.amount}</p>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ color: "#39E609" }}>{item.protein}g P</span>
            <span style={{ color: "#38bdf8" }}>{item.carbs}g C</span>
            <span style={{ color: "#a855f7" }}>{item.fat}g F</span>
            <span style={{ color: "#fff", fontWeight: 600 }}>{item.calories} kcal</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                onClick={() => setEditing(true)}
                title="Edit"
                style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4 }}
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={onDuplicate}
                title="Duplicate"
                style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4 }}
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                title="Delete"
                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
