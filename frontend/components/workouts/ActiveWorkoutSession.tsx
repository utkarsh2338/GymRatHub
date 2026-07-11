"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Link2,
  Plus,
  Trash2,
  Unlink,
  Flame,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import type { LoggedSet, SessionExercise, WorkoutSession } from "@/lib/types";
import { findExerciseIdByName } from "@/lib/exercise-utils";
import PRCelebration from "./PRCelebration";

interface Props {
  sessionId: string;
}

const DEFAULT_REST_SEC = 90;

export default function ActiveWorkoutSession({ sessionId }: Props) {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();

  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [sessionStart] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [celebrationPRs, setCelebrationPRs] = useState<
    { type: string; exerciseName: string; value: number; label: string }[] | null
  >(null);
  const [supersetPick, setSupersetPick] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<{
    volume: number;
    duration: number;
    insights: string[];
    xpGain?: number;
  } | null>(null);

  const { data: session, isLoading } = useQuery<WorkoutSession>({
    queryKey: ["workoutSession", sessionId],
    queryFn: () => api(`/workout-sessions/${sessionId}`),
    enabled: isApiReady && !!sessionId,
    refetchInterval: false,
  });

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart) / 1000)), 1000);
    return () => clearInterval(t);
  }, [sessionStart]);

  useEffect(() => {
    if (!restRunning || restSeconds <= 0) return;
    const t = setInterval(() => {
      setRestSeconds((s) => {
        if (s <= 1) {
          setRestRunning(false);
          toast.success("Rest complete — next set!");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [restRunning, restSeconds]);

  const saveExerciseMutation = useMutation({
    mutationFn: (payload: {
      exerciseId: string;
      loggedSets: LoggedSet[];
      notes: string;
      status: SessionExercise["status"];
      supersetGroupId?: string | null;
    }) =>
      api(`/workout-sessions/${sessionId}/exercises/${payload.exerciseId}`, {
        method: "PATCH",
        body: JSON.stringify({
          loggedSets: payload.loggedSets,
          notes: payload.notes,
          status: payload.status,
          ...(payload.supersetGroupId !== undefined
            ? { supersetGroupId: payload.supersetGroupId }
            : {}),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutSession", sessionId] });
    },
    onError: () => toast.error("Failed to save set data."),
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      api(`/workout-sessions/${sessionId}/complete`, { method: "POST" }),
    onSuccess: (data: {
      session: WorkoutSession;
      newPRs: { type: string; exerciseName: string; value: number; label: string }[];
      gamification?: { xpGain: number };
      aiInsights: string[];
    }) => {
      queryClient.invalidateQueries({ queryKey: ["workoutSession"] });
      queryClient.invalidateQueries({ queryKey: ["activeWorkoutSession"] });
      queryClient.invalidateQueries({ queryKey: ["progressAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      if (data.newPRs?.length) setCelebrationPRs(data.newPRs);
      setSummary({
        volume: data.session.totalVolumeKg,
        duration: data.session.durationMinutes,
        insights: data.aiInsights ?? [],
        xpGain: data.gamification?.xpGain,
      });
    },
    onError: () => toast.error("Failed to complete workout."),
  });

  const linkSupersetMutation = useMutation({
    mutationFn: (exerciseIds: string[]) =>
      api(`/workout-sessions/${sessionId}/link-superset`, {
        method: "POST",
        body: JSON.stringify({ exerciseIds }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutSession", sessionId] });
      setSupersetPick(new Set());
      toast.success("Superset created");
    },
    onError: () => toast.error("Could not link superset"),
  });

  const unlinkSupersetMutation = useMutation({
    mutationFn: (supersetGroupId: string) =>
      api(`/workout-sessions/${sessionId}/unlink-superset`, {
        method: "POST",
        body: JSON.stringify({ supersetGroupId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutSession", sessionId] });
      toast.success("Superset unlinked");
    },
  });

  const groupedExercises = useMemo(() => {
    if (!session?.exercises) return [];
    const sorted = [...session.exercises].sort((a, b) => a.order - b.order);
    const blocks: { type: "single" | "superset"; supersetId?: string; items: SessionExercise[] }[] = [];
    const seen = new Set<string>();
    for (const ex of sorted) {
      if (ex.supersetGroupId) {
        if (!seen.has(ex.supersetGroupId)) {
          seen.add(ex.supersetGroupId);
          blocks.push({
            type: "superset",
            supersetId: ex.supersetGroupId,
            items: sorted.filter((e) => e.supersetGroupId === ex.supersetGroupId),
          });
        }
      } else {
        blocks.push({ type: "single", items: [ex] });
      }
    }
    return blocks;
  }, [session?.exercises]);

  const toggleSupersetPick = (id: string) => {
    setSupersetPick((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeExercise = useMemo(
    () => session?.exercises.find((e) => e.id === activeExerciseId),
    [session, activeExerciseId]
  );

  const completedCount = session?.exercises.filter((e) => e.status === "completed").length ?? 0;
  const totalCount = session?.exercises.length ?? 0;

  const renderExerciseRow = (ex: SessionExercise, inSuperset: boolean) => {
    const libId = findExerciseIdByName(ex.name);
    const done = ex.status === "completed";
    const vol = ex.loggedSets
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.weightKg * s.reps, 0);
    const picked = supersetPick.has(ex.id);
    return (
      <div
        key={ex.id}
        className={`flex items-center gap-2 ${inSuperset ? "px-1" : ""}`}
      >
        {!inSuperset && (
          <button
            type="button"
            onClick={() => toggleSupersetPick(ex.id)}
            className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center text-[10px] ${
              picked ? "border-[#38bdf8] bg-[#38bdf8] text-black" : "border-[#4b5563]"
            }`}
            title="Select for superset"
          >
            {picked ? "✓" : ""}
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveExerciseId(ex.id)}
          className={`flex-1 flex items-center justify-between gap-3 rounded-xl border px-4 py-4 text-left transition-colors ${
            done
              ? "border-[#39E609]/30 bg-[#39E609]/5"
              : inSuperset
              ? "border-[#38bdf8]/20 bg-[#1c1c1c]/80 hover:border-[#38bdf8]/40"
              : "border-[#2a2a2a] bg-[#1c1c1c] hover:border-[#39E609]/20"
          }`}
        >
          <div className="min-w-0">
            <p className={`font-medium ${done ? "text-[#39E609]" : "text-white"}`}>{ex.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {ex.targetSets} sets · {ex.targetReps} reps
              {vol > 0 ? ` · ${vol} kg` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {libId && (
              <Link
                href={`/workouts/${libId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-gray-500 hover:text-[#39E609] px-2 py-1 border border-[#2a2a2a] rounded"
              >
                Guide
              </Link>
            )}
            {done ? (
              <Check className="w-5 h-5 text-[#39E609]" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </button>
      </div>
    );
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const startRest = () => {
    const duration = activeExercise?.restSeconds ?? DEFAULT_REST_SEC;
    setRestSeconds(duration);
    setRestRunning(true);
  };

  if (isLoading || !session) {
    return (
      <div className="dashboard-page-tight w-full flex items-center justify-center min-h-[40vh] text-gray-500">
        Loading workout…
      </div>
    );
  }

  if (session.status !== "in_progress") {
    return (
      <div className="dashboard-page-tight w-full max-w-2xl mx-auto text-center py-16">
        <p className="text-white font-semibold mb-2">This session is already finished.</p>
        <Link href="/dashboard" className="text-[#39E609] text-sm hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="dashboard-page-tight w-full">
        <div className="max-w-2xl mx-auto flex flex-col gap-6 py-8">
          {celebrationPRs && (
            <PRCelebration prs={celebrationPRs} onClose={() => setCelebrationPRs(null)} />
          )}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#39E609]/30 bg-[#1c1c1c] p-8 text-center"
          >
            <h1 className="text-2xl font-bold text-white mb-2">Workout Complete</h1>
            <p className="text-gray-500 text-sm mb-6">{session.planName}</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-2xl font-bold text-[#39E609]">{summary.volume.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">kg volume</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summary.duration}</p>
                <p className="text-xs text-gray-500 mt-1">minutes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">+{summary.xpGain ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">XP earned</p>
              </div>
            </div>
            {summary.insights.length > 0 && (
              <div className="text-left rounded-xl bg-[#111] border border-[#2a2a2a] p-4 mb-6">
                <p className="text-xs font-semibold text-[#39E609] mb-2">GymRat AI Insights</p>
                <ul className="space-y-2">
                  {summary.insights.map((line, i) => (
                    <li key={i} className="text-sm text-gray-300 leading-relaxed">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link href="/dashboard" className="btn-neon inline-flex px-8 py-3 text-sm font-bold">
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (activeExercise) {
    return (
      <ExerciseLogger
        exercise={activeExercise}
        onBack={() => setActiveExerciseId(null)}
        onSave={(loggedSets, notes, status) => {
          saveExerciseMutation.mutate({
            exerciseId: activeExercise.id,
            loggedSets,
            notes,
            status,
          });
        }}
        onFinishExercise={(loggedSets, notes) => {
          saveExerciseMutation.mutate(
            {
              exerciseId: activeExercise.id,
              loggedSets,
              notes,
              status: "completed",
            },
            {
              onSuccess: () => {
                toast.success(`${activeExercise.name} completed`);
                startRest();
                setActiveExerciseId(null);
              },
            }
          );
        }}
        startRest={startRest}
      />
    );
  }

  return (
    <div className="dashboard-page-tight w-full">
      {celebrationPRs && (
        <PRCelebration prs={celebrationPRs} onClose={() => setCelebrationPRs(null)} />
      )}
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#39E609]"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-4 h-4 text-[#39E609]" />
              {formatTime(elapsed)}
            </span>
            {restRunning && (
              <div className="flex items-center gap-2 bg-[#f97316]/10 border border-[#f97316]/20 px-3 py-1 rounded-full text-xs text-[#f97316] font-semibold">
                <span className="font-mono font-bold">Rest {formatTime(restSeconds)}</span>
                <button
                  type="button"
                  onClick={() => setRestSeconds((s) => s + 30)}
                  className="hover:text-white px-1 font-bold border-l border-[#f97316]/20 ml-1.5"
                  title="Add 30s"
                >
                  +30s
                </button>
                <button
                  type="button"
                  onClick={() => setRestSeconds((s) => Math.max(0, s - 30))}
                  className="hover:text-white px-1 font-bold"
                  title="Sub 30s"
                >
                  -30s
                </button>
                <button
                  type="button"
                  onClick={() => setRestRunning(false)}
                  className="hover:text-white px-1 text-[10px] font-black uppercase text-red-400"
                  title="Skip rest"
                >
                  Skip
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">{session.planName}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {completedCount}/{totalCount} exercises · {session.totalVolumeKg.toLocaleString()} kg logged
          </p>
          <div className="h-1.5 bg-[#2a2a2a] rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#39E609] transition-all duration-500"
              style={{ width: totalCount ? `${(completedCount / totalCount) * 100}%` : "0%" }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => {
              if (supersetPick.size < 2) {
                toast.info("Select 2+ exercises using the checkboxes, then link");
                return;
              }
              linkSupersetMutation.mutate([...supersetPick]);
            }}
            disabled={supersetPick.size < 2 || linkSupersetMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-semibold disabled:opacity-40"
          >
            <Link2 className="w-3.5 h-3.5" />
            Link superset ({supersetPick.size})
          </button>
          {supersetPick.size > 0 && (
            <button
              type="button"
              onClick={() => setSupersetPick(new Set())}
              className="text-xs text-gray-500 hover:text-white"
            >
              Clear selection
            </button>
          )}
        </div>

        <ul className="flex flex-col gap-3">
          {groupedExercises.map((block) => {
            if (block.type === "superset") {
              return (
                <li
                  key={block.supersetId}
                  className="rounded-xl border border-[#38bdf8]/30 bg-[#38bdf8]/5 p-2 space-y-2"
                >
                  <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">
                      Superset
                    </span>
                    <button
                      type="button"
                      onClick={() => unlinkSupersetMutation.mutate(block.supersetId!)}
                      className="text-[10px] text-gray-500 hover:text-[#38bdf8] flex items-center gap-1"
                    >
                      <Unlink className="w-3 h-3" />
                      Unlink
                    </button>
                  </div>
                  {block.items.map((ex) => renderExerciseRow(ex, true))}
                </li>
              );
            }
            return <li key={block.items[0].id}>{renderExerciseRow(block.items[0], false)}</li>;
          })}
        </ul>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={completeMutation.isPending}
          onClick={() => completeMutation.mutate()}
          className="btn-neon w-full py-4 text-sm font-bold disabled:opacity-50"
        >
          {completeMutation.isPending ? "Saving…" : "Complete Workout"}
        </motion.button>
      </div>
    </div>
  );
}

function ExerciseLogger({
  exercise,
  onBack,
  onSave,
  onFinishExercise,
  startRest,
}: {
  exercise: SessionExercise;
  onBack: () => void;
  onSave: (sets: LoggedSet[], notes: string, status: SessionExercise["status"]) => void;
  onFinishExercise: (sets: LoggedSet[], notes: string) => void;
  startRest: () => void;
}) {
  const [sets, setSets] = useState<LoggedSet[]>(exercise.loggedSets);
  const [notes, setNotes] = useState(exercise.notes ?? "");

  useEffect(() => {
    setSets(exercise.loggedSets);
    setNotes(exercise.notes ?? "");
  }, [exercise]);

  const updateSet = (index: number, field: "weightKg" | "reps", value: number) => {
    setSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const toggleComplete = (index: number) => {
    let becameCompleted = false;
    setSets((prev) => {
      const next = [...prev];
      becameCompleted = !next[index].completed;
      next[index] = { ...next[index], completed: becameCompleted };
      return next;
    });
    if (becameCompleted) {
      startRest();
    }
  };

  const addSet = () => {
    setSets((prev) => [
      ...prev,
      {
        setNumber: prev.length + 1,
        weightKg: prev[prev.length - 1]?.weightKg ?? 0,
        reps: prev[prev.length - 1]?.reps ?? 0,
        completed: false,
        isWarmup: false,
        isDropSet: false,
      },
    ]);
  };

  const addDropSet = () => {
    setSets((prev) => {
      const last = prev[prev.length - 1];
      const dropWeight = Math.round((last?.weightKg ?? 0) * 0.85 * 2) / 2;
      return [
        ...prev,
        {
          setNumber: prev.length + 1,
          weightKg: dropWeight,
          reps: last?.reps ?? 0,
          completed: false,
          isWarmup: false,
          isDropSet: true,
        },
      ];
    });
    toast.info("Drop set added — weight reduced ~15%");
  };

  const toggleSetFlag = (index: number, flag: "isWarmup" | "isDropSet") => {
    setSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [flag]: !next[index][flag] };
      return next;
    });
  };

  const removeSet = (index: number) => {
    if (sets.length <= 1) return;
    setSets((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 }))
    );
  };

  return (
    <div className="dashboard-page-tight w-full">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#39E609] w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to session
        </button>

        <div>
          <h2 className="text-xl font-bold text-white">{exercise.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Target: {exercise.targetSets} × {exercise.targetReps}
          </p>
        </div>

        <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 px-4 py-3 border-b border-[#2a2a2a] text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            <span>Set</span>
            <span className="text-center">kg</span>
            <span className="text-center">Reps</span>
            <span className="text-center">Done</span>
          </div>
          {sets.map((set, i) => (
            <div
              key={i}
              className={`px-4 py-3 border-b border-[#1f1f1f] last:border-0 ${
                set.completed ? "bg-[#39E609]/5" : set.isDropSet ? "bg-[#f97316]/5" : set.isWarmup ? "bg-[#38bdf8]/5" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm font-bold text-gray-500 w-8">{set.setNumber}</span>
                {set.isWarmup && (
                  <span className="text-[10px] font-bold text-[#38bdf8] bg-[#38bdf8]/15 px-1.5 py-0.5 rounded">
                    Warm-up
                  </span>
                )}
                {set.isDropSet && (
                  <span className="text-[10px] font-bold text-[#f97316] bg-[#f97316]/15 px-1.5 py-0.5 rounded">
                    Drop set
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleSetFlag(i, "isWarmup")}
                  className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${
                    set.isWarmup
                      ? "border-[#38bdf8] text-[#38bdf8]"
                      : "border-[#2a2a2a] text-gray-600"
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  Warm-up
                </button>
                <button
                  type="button"
                  onClick={() => toggleSetFlag(i, "isDropSet")}
                  className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${
                    set.isDropSet
                      ? "border-[#f97316] text-[#f97316]"
                      : "border-[#2a2a2a] text-gray-600"
                  }`}
                >
                  <TrendingDown className="w-3 h-3" />
                  Drop
                </button>
              </div>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <input
                type="number"
                min={0}
                step={0.5}
                value={set.weightKg || ""}
                onChange={(e) => updateSet(i, "weightKg", Number(e.target.value) || 0)}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-center text-white text-sm"
                placeholder="0"
              />
              <input
                type="number"
                min={0}
                value={set.reps || ""}
                onChange={(e) => updateSet(i, "reps", Number(e.target.value) || 0)}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-center text-white text-sm"
                placeholder="0"
              />
              <div className="flex items-center gap-1 justify-center">
                <button
                  type="button"
                  onClick={() => toggleComplete(i)}
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                    set.completed
                      ? "border-[#39E609] bg-[#39E609]/20 text-[#39E609]"
                      : "border-[#2a2a2a] text-gray-600 hover:border-[#39E609]/40"
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
                {sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSet(i)}
                    className="w-9 h-9 rounded-lg border border-[#2a2a2a] flex items-center justify-center text-gray-600 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              </div>
            </div>
          ))}
          <div className="flex border-t border-[#2a2a2a]">
            <button
              type="button"
              onClick={addSet}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-[#39E609] hover:bg-white/[0.02]"
            >
              <Plus className="w-4 h-4" />
              Add set
            </button>
            <button
              type="button"
              onClick={addDropSet}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-[#f97316] hover:bg-[#f97316]/5 border-l border-[#2a2a2a]"
            >
              <TrendingDown className="w-4 h-4" />
              Add drop set
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-2 w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white resize-none"
            placeholder="Form cues, how it felt…"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              onSave(sets, notes, "in_progress");
              toast.success("Progress saved");
            }}
            className="flex-1 py-3 rounded-xl border border-[#2a2a2a] text-sm font-medium text-gray-300 hover:border-[#39E609]/30"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => onFinishExercise(sets, notes)}
            className="flex-1 btn-neon py-3 text-sm font-bold"
          >
            Finish exercise
          </button>
        </div>
      </div>
    </div>
  );
}
