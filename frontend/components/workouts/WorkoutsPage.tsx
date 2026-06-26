"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Bookmark, BookmarkCheck, Play, Video } from "lucide-react";
import type { Exercise, ExerciseCategory } from "@/lib/types";
import Link from "next/link";
import { toast } from "sonner";
import {
  getAllExercises,
  getExerciseCountByCategory,
} from "@/lib/exercise-library";

const CATEGORIES: ExerciseCategory[] = [
  "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Cardio", "Full Body", "Flexibility",
];

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "#39E609",
  Intermediate: "#f97316",
  Advanced: "#ef4444",
};

const CATEGORY_COUNTS = getExerciseCountByCategory();
const ALL_EXERCISES = getAllExercises();

const CATEGORY_IMAGES: Record<string, string> = {
  Chest: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70",
  Back: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=70",
  Shoulders: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&q=70",
  Arms: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=400&q=70",
  Legs: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=70",
  Core: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=70",
  Cardio: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=70",
  "Full Body": "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=70",
  Flexibility: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70",
};

function groupByPrimaryMuscle(exercises: Exercise[]): Map<string, Exercise[]> {
  const groups = new Map<string, Exercise[]>();
  for (const ex of exercises) {
    const key = ex.muscleGroups[0] ?? "General";
    const list = groups.get(key) ?? [];
    list.push(ex);
    groups.set(key, list);
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

export default function WorkoutsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeDiff, setActiveDiff] = useState("All");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return ALL_EXERCISES.filter((ex) => {
      const matchSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroups.some((m) => m.toLowerCase().includes(search.toLowerCase())) ||
        ex.equipment.some((eq) => eq.toLowerCase().includes(search.toLowerCase()));
      const matchCat = activeCategory === "All" || ex.category === activeCategory;
      const matchDiff = activeDiff === "All" || ex.difficulty === activeDiff;
      return matchSearch && matchCat && matchDiff;
    });
  }, [search, activeCategory, activeDiff]);

  const grouped = useMemo(() => {
    if (activeCategory === "All") return null;
    return groupByPrimaryMuscle(filtered);
  }, [filtered, activeCategory]);

  const toggleSave = (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast("Removed from favorites");
      } else {
        next.add(id);
        toast.success(`${name} saved to favorites!`);
      }
      return next;
    });
  };

  const totalLabel =
    activeCategory === "All"
      ? `${filtered.length} exercises`
      : `${filtered.length} ${activeCategory.toLowerCase()} exercises`;

  return (
    <div className="dashboard-page-tight" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "clamp(22px, 3vw, 30px)", color: "#fff", marginBottom: 4 }}>
          Workout Library
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          {ALL_EXERCISES.length}+ exercises with form guides and YouTube tutorials — {totalLabel}
        </p>
      </motion.div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={16} color="#6b7280" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises, muscles, equipment..."
            style={{
              width: "100%",
              background: "#1c1c1c",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              padding: "10px 14px 10px 38px",
              fontSize: 14,
              color: "#fff",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          type="button"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#1c1c1c", border: "1px solid #2a2a2a",
            borderRadius: 8, padding: "10px 16px",
            color: "#9ca3af", fontSize: 14, fontWeight: 500,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["All", ...CATEGORIES].map((cat) => {
          const count =
            cat === "All"
              ? ALL_EXERCISES.length
              : CATEGORY_COUNTS[cat as ExerciseCategory] ?? 0;
          return (
            <motion.button
              key={cat}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: activeCategory === cat ? "none" : "1px solid #2a2a2a",
                background: activeCategory === cat ? "#39E609" : "#1c1c1c",
                color: activeCategory === cat ? "#000" : "#6b7280",
                transition: "all 0.15s",
              }}
            >
              {cat}
              {cat !== "All" && (
                <span style={{ marginLeft: 6, opacity: activeCategory === cat ? 0.7 : 0.5 }}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setActiveDiff(d)}
            style={{
              padding: "5px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              border: activeDiff === d ? "1px solid rgba(57,230,9,0.4)" : "none",
              background: activeDiff === d ? "rgba(57,230,9,0.12)" : "transparent",
              color: activeDiff === d ? "#39E609" : "#6b7280",
              transition: "all 0.15s",
            }}
          >
            {d}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {grouped ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {[...grouped.entries()].map(([muscle, exercises]) => (
              <section key={muscle}>
                <h2
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 12,
                  }}
                >
                  {muscle}
                  <span style={{ color: "#4b5563", fontWeight: 500, marginLeft: 8 }}>
                    ({exercises.length})
                  </span>
                </h2>
                <motion.div layout className="workout-grid" style={{ display: "grid", gap: 16 }}>
                  {exercises.map((ex, i) => (
                    <WorkoutCard
                      key={ex.id}
                      exercise={ex}
                      index={i}
                      saved={savedIds.has(ex.id)}
                      onSave={toggleSave}
                      imageUrl={CATEGORY_IMAGES[ex.category] ?? CATEGORY_IMAGES.Chest}
                    />
                  ))}
                </motion.div>
              </section>
            ))}
          </div>
        ) : (
          <motion.div layout className="workout-grid" style={{ display: "grid", gap: 16 }}>
            {filtered.map((ex, i) => (
              <WorkoutCard
                key={ex.id}
                exercise={ex}
                index={i}
                saved={savedIds.has(ex.id)}
                onSave={toggleSave}
                imageUrl={CATEGORY_IMAGES[ex.category] ?? CATEGORY_IMAGES.Chest}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#4b5563" }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No exercises found</p>
          <p style={{ fontSize: 14 }}>Try different filters or search terms</p>
        </div>
      )}

      <style>{`
        .workout-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
      `}</style>
    </div>
  );
}

function WorkoutCard({
  exercise, index, saved, onSave, imageUrl,
}: {
  exercise: Exercise; index: number; saved: boolean;
  onSave: (id: string, name: string, e: React.MouseEvent) => void;
  imageUrl: string;
}) {
  const [hovered, setHovered] = useState(false);
  const diffColor = DIFFICULTY_COLORS[exercise.difficulty] ?? "#6b7280";
  const hasGuide = exercise.instructions.length > 0;

  return (
    <Link href={`/workouts/${exercise.id}`} style={{ textDecoration: "none" }}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.4) }}
        whileHover={{ scale: 1.02, y: -3 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          background: "#1c1c1c",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          overflow: "hidden",
          cursor: "pointer",
          transition: "box-shadow 0.3s",
          boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.4), 0 0 16px rgba(57,230,9,0.1)" : "none",
          height: "100%",
        }}
      >
        <div style={{ position: "relative", height: 144, overflow: "hidden" }}>
          <img
            src={imageUrl}
            alt={exercise.name}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.5s",
              transform: hovered ? "scale(1.1)" : "scale(1)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />

          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
          }}>
            <div style={{ width: 40, height: 40, background: "#39E609", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={16} color="#000" fill="#000" style={{ marginLeft: 2 }} />
            </div>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={(e) => onSave(exercise.id, exercise.name, e)}
            style={{
              position: "absolute", top: 8, right: 8,
              width: 28, height: 28, background: "rgba(0,0,0,0.6)", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", cursor: "pointer", backdropFilter: "blur(4px)",
            }}
          >
            {saved ? <BookmarkCheck size={14} color="#39E609" /> : <Bookmark size={14} color="#fff" />}
          </motion.button>

          <div style={{ position: "absolute", bottom: 8, left: 8, display: "flex", gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", background: "rgba(0,0,0,0.65)", borderRadius: 4, color: "#e5e7eb", backdropFilter: "blur(4px)" }}>
              {exercise.category}
            </span>
            {hasGuide && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", background: "rgba(57,230,9,0.25)", borderRadius: 4, color: "#39E609", display: "flex", alignItems: "center", gap: 3 }}>
                <Video size={10} /> Guide
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: "12px" }}>
          <h3 style={{ fontWeight: 600, color: "#fff", fontSize: 14, marginBottom: 6, lineHeight: 1.3 }}>
            {exercise.name}
          </h3>
          {exercise.instructions[0] && (
            <p style={{
              fontSize: 11, color: "#6b7280", lineHeight: 1.4, marginBottom: 8,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {exercise.instructions[0]}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {exercise.muscleGroups.slice(0, 2).map((m: string) => (
                <span key={m} style={{ fontSize: 10, color: "#6b7280", background: "#111", padding: "2px 6px", borderRadius: 4 }}>
                  {m}
                </span>
              ))}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: `${diffColor}18`, color: diffColor, whiteSpace: "nowrap" }}>
              {exercise.difficulty}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
