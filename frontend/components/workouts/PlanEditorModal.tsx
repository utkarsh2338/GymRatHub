"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Link2, Unlink, ChevronUp, ChevronDown, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client";
import type { Exercise } from "@/lib/types";
import type { TemplateExerciseItem, WorkoutTemplate, WorkoutTemplateDay } from "@/lib/types";
import ExerciseLibraryPicker from "./ExerciseLibraryPicker";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function makeLocalId() {
  return `tex_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeDays(template: WorkoutTemplate): WorkoutTemplateDay[] {
  const existing = new Map(template.days.map((d) => [d.dayLabel, d]));
  return DAY_LABELS.map((dayLabel) => {
    const day = existing.get(dayLabel);
    return (
      day ?? {
        dayLabel,
        name: `${dayLabel} Workout`,
        exercises: [],
      }
    );
  });
}

function exerciseToTemplate(ex: Exercise, order: number): TemplateExerciseItem {
  return {
    exerciseId: ex.id,
    name: ex.name,
    category: ex.category,
    muscleGroups: [...ex.muscleGroups],
    targetSets: ex.sets ?? 3,
    targetReps: ex.reps ?? "10",
    order,
    supersetGroupId: null,
  };
}

interface Props {
  template: WorkoutTemplate;
  open: boolean;
  onClose: () => void;
}

export default function PlanEditorModal({ template, open, onClose }: Props) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [activeDay, setActiveDay] = useState("Mon");
  const [days, setDays] = useState<WorkoutTemplateDay[]>(() => normalizeDays(template));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedForSuperset, setSelectedForSuperset] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) {
      setDays(normalizeDays(template));
      setActiveDay("Mon");
      setSelectedForSuperset(new Set());
    }
  }, [open, template]);

  const currentDay = useMemo(
    () => days.find((d) => d.dayLabel === activeDay) ?? days[0],
    [days, activeDay]
  );

  const updateDay = useCallback((dayLabel: string, updater: (day: WorkoutTemplateDay) => WorkoutTemplateDay) => {
    setDays((prev) => prev.map((d) => (d.dayLabel === dayLabel ? updater(d) : d)));
  }, []);

  const addExercise = (ex: Exercise) => {
    updateDay(activeDay, (day) => {
      const order = day.exercises.length;
      return {
        ...day,
        exercises: [...day.exercises, exerciseToTemplate(ex, order)],
      };
    });
    toast.success(`Added ${ex.name}`);
  };

  const removeExercise = (index: number) => {
    updateDay(activeDay, (day) => ({
      ...day,
      exercises: day.exercises
        .filter((_, i) => i !== index)
        .map((e, i) => ({ ...e, order: i })),
    }));
  };

  const moveExercise = (index: number, dir: -1 | 1) => {
    updateDay(activeDay, (day) => {
      const next = [...day.exercises];
      const j = index + dir;
      if (j < 0 || j >= next.length) return day;
      [next[index], next[j]] = [next[j], next[index]];
      return { ...day, exercises: next.map((e, i) => ({ ...e, order: i })) };
    });
  };

  const updateExerciseField = (
    index: number,
    field: "targetSets" | "targetReps",
    value: number | string
  ) => {
    updateDay(activeDay, (day) => ({
      ...day,
      exercises: day.exercises.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    }));
  };

  const toggleSupersetSelect = (index: number) => {
    setSelectedForSuperset((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const linkSuperset = () => {
    if (selectedForSuperset.size < 2) {
      toast.error("Select at least 2 exercises to link as a superset");
      return;
    }
    const groupId = makeLocalId().replace("tex_", "ss_");
    updateDay(activeDay, (day) => ({
      ...day,
      exercises: day.exercises.map((e, i) =>
        selectedForSuperset.has(i) ? { ...e, supersetGroupId: groupId } : e
      ),
    }));
    setSelectedForSuperset(new Set());
    toast.success("Superset linked");
  };

  const unlinkSuperset = (groupId: string) => {
    updateDay(activeDay, (day) => ({
      ...day,
      exercises: day.exercises.map((e) =>
        e.supersetGroupId === groupId ? { ...e, supersetGroupId: null } : e
      ),
    }));
    toast.success("Superset removed");
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      api(`/workout-templates/${template._id}`, {
        method: "PUT",
        body: JSON.stringify({ days }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardWorkoutSchedule"] });
      queryClient.invalidateQueries({ queryKey: ["todayWorkout"] });
      toast.success("Plan saved");
      onClose();
    },
    onError: () => toast.error("Failed to save plan"),
  });

  const supersetGroups = useMemo(() => {
    const groups = new Map<string, number>();
    currentDay?.exercises.forEach((e) => {
      if (e.supersetGroupId) {
        groups.set(e.supersetGroupId, (groups.get(e.supersetGroupId) ?? 0) + 1);
      }
    });
    return groups;
  }, [currentDay]);

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl flex flex-col bg-[#0f0f0f] sm:rounded-2xl border border-[#2a2a2a] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a] shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white">Edit plan</h2>
                <p className="text-xs text-gray-500 mt-0.5">{template.name}</p>
              </div>
              <button type="button" onClick={onClose} className="w-9 h-9 rounded-lg border border-[#2a2a2a] flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex gap-1 px-4 py-3 border-b border-[#2a2a2a] overflow-x-auto shrink-0">
              {DAY_LABELS.map((label) => {
                const count = days.find((d) => d.dayLabel === label)?.exercises.length ?? 0;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setActiveDay(label);
                      setSelectedForSuperset(new Set());
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      activeDay === label
                        ? "bg-[#39E609] text-black"
                        : "bg-[#1c1c1c] text-gray-500 border border-[#2a2a2a]"
                    }`}
                  >
                    {label}
                    {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                  </button>
                );
              })}
            </div>

            <div className="px-5 py-3 flex flex-wrap gap-2 shrink-0">
              <input
                value={currentDay?.name ?? ""}
                onChange={(e) =>
                  updateDay(activeDay, (d) => ({ ...d, name: e.target.value }))
                }
                className="flex-1 min-w-[160px] bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                placeholder="Day name (e.g. Push Day)"
              />
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#39E609]/10 border border-[#39E609]/30 text-[#39E609] text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add from library
              </button>
              {selectedForSuperset.size >= 2 && (
                <button
                  type="button"
                  onClick={linkSuperset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-bold"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Link superset ({selectedForSuperset.size})
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
              {!currentDay?.exercises.length ? (
                <p className="text-center text-gray-500 text-sm py-16">
                  No exercises for {activeDay}. Tap &quot;Add from library&quot; to build this day.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {currentDay.exercises.map((ex, index) => {
                    const isSelected = selectedForSuperset.has(index);
                    const ssLabel = ex.supersetGroupId
                      ? `Superset ${[...supersetGroups.keys()].indexOf(ex.supersetGroupId) + 1}`
                      : null;
                    return (
                      <li
                        key={`${ex.exerciseId}-${index}`}
                        className={`rounded-xl border p-3 ${
                          ex.supersetGroupId
                            ? "border-[#38bdf8]/40 bg-[#38bdf8]/5"
                            : isSelected
                            ? "border-[#39E609]/50 bg-[#39E609]/5"
                            : "border-[#2a2a2a] bg-[#1c1c1c]"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSupersetSelect(index)}
                            className={`mt-1 w-5 h-5 rounded border shrink-0 flex items-center justify-center text-[10px] ${
                              isSelected
                                ? "border-[#39E609] bg-[#39E609] text-black"
                                : "border-[#4b5563]"
                            }`}
                            title="Select for superset"
                          >
                            {isSelected ? "✓" : ""}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-white">{ex.name}</p>
                              {ssLabel && (
                                <span className="text-[10px] font-bold text-[#38bdf8] bg-[#38bdf8]/15 px-1.5 py-0.5 rounded">
                                  {ssLabel}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">{ex.category}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <label className="text-[10px] text-gray-500 flex items-center gap-1">
                                Sets
                                <input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={ex.targetSets}
                                  onChange={(e) =>
                                    updateExerciseField(index, "targetSets", Number(e.target.value) || 1)
                                  }
                                  className="w-12 bg-[#111] border border-[#2a2a2a] rounded px-1.5 py-0.5 text-white text-xs text-center"
                                />
                              </label>
                              <label className="text-[10px] text-gray-500 flex items-center gap-1">
                                Reps
                                <input
                                  value={ex.targetReps}
                                  onChange={(e) =>
                                    updateExerciseField(index, "targetReps", e.target.value)
                                  }
                                  className="w-16 bg-[#111] border border-[#2a2a2a] rounded px-1.5 py-0.5 text-white text-xs text-center"
                                />
                              </label>
                            </div>
                          </div>
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button type="button" onClick={() => moveExercise(index, -1)} className="p-1 text-gray-600 hover:text-white">
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => moveExercise(index, 1)} className="p-1 text-gray-600 hover:text-white">
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => removeExercise(index)} className="p-1 text-gray-600 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {ex.supersetGroupId && (
                          <button
                            type="button"
                            onClick={() => unlinkSuperset(ex.supersetGroupId!)}
                            className="mt-2 text-[10px] text-gray-500 hover:text-[#38bdf8] flex items-center gap-1"
                          >
                            <Unlink className="w-3 h-3" />
                            Unlink from superset
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="px-5 py-4 border-t border-[#2a2a2a] flex gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-[#2a2a2a] text-sm text-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="flex-1 btn-neon py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? "Saving…" : "Save plan"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <ExerciseLibraryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addExercise}
        title={`Add exercise — ${activeDay}`}
      />
    </>
  );
}
