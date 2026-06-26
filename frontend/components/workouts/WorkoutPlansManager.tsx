"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Copy,
  Calendar,
  Plus,
  Trash2,
  Dumbbell,
  Sparkles,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import type { PresetPlanSummary, WorkoutTemplate } from "@/lib/types";
import PlanEditorModal from "./PlanEditorModal";

const GOAL_LABELS: Record<string, string> = {
  muscle_gain: "Muscle Gain",
  fat_loss: "Fat Loss",
  strength: "Strength",
  endurance: "Endurance",
  beginner: "Beginner",
};

const DEFAULT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayLabel) => ({
  dayLabel,
  name: `${dayLabel} — Rest`,
  exercises: [] as WorkoutTemplate["days"][0]["exercises"],
}));

export default function WorkoutPlansManager() {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"presets" | "custom">("presets");
  const [showCreate, setShowCreate] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

  const { data: presets = [] } = useQuery<PresetPlanSummary[]>({
    queryKey: ["workoutPresets"],
    queryFn: () => api("/workout-templates/presets"),
    enabled: isApiReady,
  });

  const { data: templates = [], isLoading } = useQuery<WorkoutTemplate[]>({
    queryKey: ["workoutTemplates"],
    queryFn: () => api("/workout-templates"),
    enabled: isApiReady,
  });

  const importPreset = useMutation({
    mutationFn: (presetKey: string) =>
      api("/workout-templates/from-preset", {
        method: "POST",
        body: JSON.stringify({ presetKey }),
      }),
    onSuccess: (created: WorkoutTemplate) => {
      queryClient.invalidateQueries({ queryKey: ["workoutTemplates"] });
      api(`/workout-templates/${created._id}/activate`, { method: "PUT" })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["dashboardWorkoutSchedule"] });
          queryClient.invalidateQueries({ queryKey: ["todayWorkout"] });
        })
        .catch(() => {});
      toast.success("Plan added and set as active on dashboard");
      setTab("custom");
    },
    onError: () => toast.error("Failed to import plan"),
  });

  const applyWeek = useMutation({
    mutationFn: (id: string) =>
      api(`/workout-templates/${id}/apply-week`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plannerWeek"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardWorkoutSchedule"] });
      queryClient.invalidateQueries({ queryKey: ["todayWorkout"] });
      toast.success("Plan applied to week and dashboard");
    },
    onError: () => toast.error("Failed to apply schedule"),
  });

  const duplicate = useMutation({
    mutationFn: (id: string) =>
      api(`/workout-templates/${id}/duplicate`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutTemplates"] });
      toast.success("Plan duplicated");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/workout-templates/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutTemplates"] });
      toast.success("Plan deleted");
    },
  });

  const createPlan = useMutation({
    mutationFn: () =>
      api("/workout-templates", {
        method: "POST",
        body: JSON.stringify({
          name: newPlanName.trim(),
          goalType: "muscle_gain",
          days: DEFAULT_DAYS.map((d) =>
            d.dayLabel === "Mon"
              ? { ...d, name: newPlanName.trim(), exercises: [] }
              : { ...d }
          ),
        }),
      }),
    onSuccess: (created: WorkoutTemplate) => {
      queryClient.invalidateQueries({ queryKey: ["workoutTemplates"] });
      setNewPlanName("");
      setShowCreate(false);
      setEditingTemplate(created);
      toast.success("Plan created — add exercises from the library");
    },
    onError: () => toast.error("Failed to create plan"),
  });

  const totalExercises = (t: WorkoutTemplate) =>
    t.days.reduce((sum, d) => sum + d.exercises.length, 0);

  return (
    <div className="flex flex-col gap-6">
      {editingTemplate && (
        <PlanEditorModal
          template={editingTemplate}
          open={!!editingTemplate}
          onClose={() => {
            setEditingTemplate(null);
            queryClient.invalidateQueries({ queryKey: ["workoutTemplates"] });
          }}
        />
      )}

      <div className="flex gap-2 flex-wrap">
        {(["presets", "custom"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-[#39E609] text-black"
                : "bg-[#1c1c1c] border border-[#2a2a2a] text-gray-500"
            }`}
          >
            {t === "presets" ? "Pre-built plans" : `My plans (${templates.length})`}
          </button>
        ))}
      </div>

      {tab === "presets" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((p) => (
            <motion.div
              key={p.presetKey}
              layout
              className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] p-5 flex flex-col gap-3"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-[#39E609] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white text-sm leading-snug">{p.name}</h3>
                  <p className="text-xs text-[#39E609] mt-1">{GOAL_LABELS[p.goalType] ?? p.goalType}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed flex-1">{p.description}</p>
              <p className="text-[10px] text-gray-600">{p.dayCount} training days / week</p>
              <button
                type="button"
                onClick={() => importPreset.mutate(p.presetKey)}
                disabled={importPreset.isPending}
                className="w-full py-2.5 rounded-lg bg-[#39E609]/10 border border-[#39E609]/30 text-[#39E609] text-xs font-bold hover:bg-[#39E609]/20"
              >
                Add to my plans
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "custom" && (
        <>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[#39E609]/40 text-[#39E609] text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              New custom plan
            </button>
          </div>

          {showCreate && (
            <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] p-4 flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-gray-500 block mb-1">Plan name</label>
                <input
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="e.g. Push-Pull-Legs"
                />
              </div>
              <button
                type="button"
                onClick={() => createPlan.mutate()}
                disabled={!newPlanName.trim() || createPlan.isPending}
                className="btn-neon px-4 py-2 text-sm font-bold disabled:opacity-50"
              >
                Create & edit
              </button>
            </div>
          )}

          {isLoading ? (
            <p className="text-gray-500 text-sm">Loading plans…</p>
          ) : templates.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No custom plans yet. Import a pre-built plan or create your own.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {templates.map((t) => (
                <li
                  key={t._id}
                  className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Dumbbell className="w-5 h-5 text-[#39E609] shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white">{t.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {totalExercises(t)} exercises · {t.days.filter((d) => d.exercises.length).length} active days
                        {t.planType === "preset" ? " · from preset" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setEditingTemplate(t)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#39E609]/30 bg-[#39E609]/10 text-xs text-[#39E609] font-semibold"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit exercises
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        api(`/workout-templates/${t._id}/activate`, { method: "PUT" })
                          .then(() => {
                            queryClient.invalidateQueries({ queryKey: ["dashboardWorkoutSchedule"] });
                            queryClient.invalidateQueries({ queryKey: ["todayWorkout"] });
                            toast.success("Using this plan on dashboard");
                          })
                          .catch(() => toast.error("Failed to activate plan"));
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#39E609]/30 bg-[#39E609]/10 text-xs text-[#39E609] font-semibold"
                    >
                      Use on dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWeek.mutate(t._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2a2a2a] text-xs text-gray-300 hover:border-[#39E609]/30"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Apply to week
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicate.mutate(t._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2a2a2a] text-xs text-gray-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => remove.mutate(t._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2a2a2a] text-xs text-red-400/80"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
