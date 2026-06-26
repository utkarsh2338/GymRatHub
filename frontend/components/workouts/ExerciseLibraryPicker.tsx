"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { getAllExercises } from "@/lib/exercise-library";
import type { Exercise, ExerciseCategory } from "@/lib/types";

const CATEGORIES: (ExerciseCategory | "All")[] = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Cardio",
  "Full Body",
  "Flexibility",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  title?: string;
}

export default function ExerciseLibraryPicker({
  open,
  onClose,
  onSelect,
  title = "Add exercise from library",
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return getAllExercises().filter((ex) => {
      const matchCat = category === "All" || ex.category === category;
      const matchSearch =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.muscleGroups.some((m) => m.toLowerCase().includes(q)) ||
        ex.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, category]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-[#2a2a2a] bg-[#141414] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#2a2a2a] shrink-0">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="px-5 py-3 border-b border-[#2a2a2a] shrink-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exercises…"
                className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-[#39E609]/40"
                autoFocus
              />
            </div>
            <div className="flex gap-1.5 flex-wrap max-h-20 overflow-y-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    category === cat
                      ? "bg-[#39E609] text-black"
                      : "bg-[#1c1c1c] text-gray-500 border border-[#2a2a2a]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <ul className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
            {filtered.length === 0 ? (
              <li className="text-center text-gray-500 text-sm py-12">No exercises match your search.</li>
            ) : (
              filtered.map((ex) => (
                <li key={ex.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(ex);
                      onClose();
                      setSearch("");
                    }}
                    className="w-full text-left px-3 py-3 rounded-lg hover:bg-[#1c1c1c] transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{ex.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ex.category}
                        {ex.muscleGroups[0] ? ` · ${ex.muscleGroups[0]}` : ""}
                        {" · "}
                        {ex.difficulty}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#39E609] bg-[#39E609]/10 px-2 py-1 rounded shrink-0">
                      Add
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          <p className="text-[10px] text-gray-600 text-center py-2 border-t border-[#2a2a2a] shrink-0">
            {filtered.length} exercises shown
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
