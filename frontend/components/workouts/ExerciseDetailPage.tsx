"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Bookmark,
  Dumbbell,
  Target,
  AlertTriangle,
  Lightbulb,
  ListOrdered,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import PageTransition from "@/components/layout/PageTransition";
import YouTubeTutorialPlayer from "@/components/workouts/YouTubeTutorialPlayer";
import {
  getAllExercises,
  getExerciseById,
  resolveExerciseId,
} from "@/lib/exercise-library";
import { toast } from "sonner";
import type { Exercise } from "@/lib/types";

interface Props {
  id: string;
}

const DIFFICULTY_STYLES: Record<
  Exercise["difficulty"],
  { bg: string; text: string; border: string }
> = {
  Beginner: { bg: "rgba(57,230,9,0.12)", text: "#39E609", border: "rgba(57,230,9,0.25)" },
  Intermediate: { bg: "rgba(249,115,22,0.12)", text: "#f97316", border: "rgba(249,115,22,0.25)" },
  Advanced: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "rgba(239,68,68,0.25)" },
};

const MUSCLE_COLORS: Record<string, string> = {
  Pectorals: "#39E609",
  Triceps: "#f97316",
  Biceps: "#38bdf8",
  Deltoids: "#a855f7",
  Lats: "#22d3ee",
  Traps: "#14b8a6",
  Rhomboids: "#8b5cf6",
  Quadriceps: "#ec4899",
  Hamstrings: "#f59e0b",
  Glutes: "#10b981",
  Calves: "#84cc16",
  Abs: "#6366f1",
  Obliques: "#a78bfa",
  "Lower Back": "#fb7185",
};

function GuideSection({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="w-full rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: accent }}
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2a2a] bg-[#161616]">
        <Icon className="w-5 h-5 shrink-0" style={{ color: accent }} />
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

export default function ExerciseDetailPage({ id }: Props) {
  const resolvedId = resolveExerciseId(id);
  const exercise = getExerciseById(resolvedId);
  const allExercises = getAllExercises();
  const alternatives = exercise
    ? allExercises
        .filter((e) => e.id !== exercise.id && e.category === exercise.category)
        .slice(0, 4)
    : [];

  const [saved, setSaved] = useState(false);

  if (!exercise) {
    return (
      <PageTransition>
        <div className="dashboard-page-tight w-full flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h1 className="text-xl font-bold text-white mb-2">Exercise not found</h1>
          <p className="text-gray-500 text-sm mb-6">This exercise may have moved to a new link.</p>
          <Link
            href="/workouts"
            className="inline-flex items-center gap-2 text-[#39E609] text-sm font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workout Library
          </Link>
        </div>
      </PageTransition>
    );
  }

  const instructions = exercise.instructions;
  const tips = exercise.tips ?? [];
  const commonMistakes = exercise.commonMistakes ?? [];
  const diffStyle = DIFFICULTY_STYLES[exercise.difficulty];
  const hasPrescription = Boolean(exercise.sets || exercise.reps || exercise.rest);

  return (
    <PageTransition>
      <div className="dashboard-page-tight w-full box-border">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-8">
          {/* Top bar */}
          <div className="flex flex-col gap-6 border-b border-[#2a2a2a] pb-6">
            <Link
              href="/workouts"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#39E609] transition-colors w-fit"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              Workout Library
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-[#39E609] bg-[#39E609]/10 px-2.5 py-1 rounded-md">
                    {exercise.category}
                  </span>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-md border"
                    style={{
                      background: diffStyle.bg,
                      color: diffStyle.text,
                      borderColor: diffStyle.border,
                    }}
                  >
                    {exercise.difficulty}
                  </span>
                </div>
                <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight">
                  {exercise.name}
                </h1>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSaved((p) => !p);
                    toast.success(saved ? "Removed from favorites" : "Saved to favorites");
                  }}
                  className="w-11 h-11 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center hover:border-[#39E609]/40 transition-colors"
                  aria-label={saved ? "Remove from favorites" : "Save to favorites"}
                >
                  <Bookmark
                    className="w-5 h-5"
                    style={{ color: saved ? "#39E609" : "#6b7280", fill: saved ? "#39E609" : "none" }}
                  />
                </button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  className="btn-neon flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold whitespace-nowrap"
                  onClick={() => toast.success("Added to today's workout!")}
                >
                  <Plus className="w-4 h-4" />
                  Add to Planner
                </motion.button>
              </div>
            </div>
          </div>

          {/* Main grid — fills width on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 w-full">
            {/* Left: video + meta */}
            <aside className="lg:col-span-5 flex flex-col gap-6 w-full min-w-0">
              <section aria-label="Tutorial video" className="w-full">
                <YouTubeTutorialPlayer exerciseName={exercise.name} />
              </section>

              <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full">
                <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] p-5 w-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-[#39E609]" />
                    <h3 className="text-sm font-semibold text-white">Muscles worked</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exercise.muscleGroups.map((m, i) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-[#111] border border-[#2a2a2a] text-gray-200"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: MUSCLE_COLORS[m] ?? "#6b7280" }}
                        />
                        {m}
                        {i === 0 && (
                          <span className="text-xs text-[#39E609] font-normal">primary</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] p-5 w-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Dumbbell className="w-4 h-4 text-[#39E609]" />
                    <h3 className="text-sm font-semibold text-white">Equipment</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exercise.equipment.length > 0 ? (
                      exercise.equipment.map((eq) => (
                        <span
                          key={eq}
                          className="text-sm text-gray-300 bg-[#111] border border-[#2a2a2a] px-3 py-2 rounded-lg"
                        >
                          {eq}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Bodyweight only</span>
                    )}
                  </div>
                </div>
              </div>

              {hasPrescription && (
                <div className="grid grid-cols-3 gap-3 w-full">
                  {exercise.sets != null && (
                    <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] px-4 py-4 text-center">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Sets</p>
                      <p className="text-lg font-bold text-white">{exercise.sets}</p>
                    </div>
                  )}
                  {exercise.reps && (
                    <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] px-4 py-4 text-center">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Reps</p>
                      <p className="text-lg font-bold text-white">{exercise.reps}</p>
                    </div>
                  )}
                  {exercise.rest && (
                    <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] px-4 py-4 text-center">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Rest</p>
                      <p className="text-lg font-bold text-white">{exercise.rest}</p>
                    </div>
                  )}
                </div>
              )}

              {alternatives.length > 0 && (
                <section className="w-full">
                  <h3 className="text-sm font-semibold text-white mb-3">Similar exercises</h3>
                  <ul className="grid sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {alternatives.map((alt) => (
                      <li key={alt.id}>
                        <Link
                          href={`/workouts/${alt.id}`}
                          className="group flex items-center justify-between gap-3 rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] px-4 py-3.5 hover:border-[#39E609]/30 hover:bg-[#1f1f1f] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-[#39E609] transition-colors">
                              {alt.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {alt.difficulty}
                              {alt.muscleGroups[0] ? ` · ${alt.muscleGroups[0]}` : ""}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 shrink-0 text-gray-600 group-hover:text-[#39E609]" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>

            {/* Right: form guides — uses remaining width */}
            <div className="lg:col-span-7 flex flex-col gap-5 w-full min-w-0">
              <GuideSection icon={ListOrdered} title="How to perform" accent="#39E609">
                <ol className="space-y-5">
                  {instructions.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#39E609]/15 text-sm font-bold text-[#39E609]">
                        {i + 1}
                      </span>
                      <p className="text-base text-gray-200 leading-relaxed pt-1 flex-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </GuideSection>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
                {tips.length > 0 && (
                  <GuideSection icon={Lightbulb} title="Things to keep in mind" accent="#38bdf8">
                    <ul className="space-y-4">
                      {tips.map((tip, i) => (
                        <li key={i} className="flex gap-3 text-base text-gray-200 leading-relaxed">
                          <span className="text-[#38bdf8] shrink-0 font-bold">•</span>
                          <span className="flex-1">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </GuideSection>
                )}

                {commonMistakes.length > 0 && (
                  <GuideSection icon={AlertTriangle} title="Common mistakes to avoid" accent="#f97316">
                    <ul className="space-y-4">
                      {commonMistakes.map((m, i) => (
                        <li key={i} className="flex gap-3 text-base text-gray-300 leading-relaxed">
                          <span className="text-[#f97316] shrink-0 font-bold">•</span>
                          <span className="flex-1">{m}</span>
                        </li>
                      ))}
                    </ul>
                  </GuideSection>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
