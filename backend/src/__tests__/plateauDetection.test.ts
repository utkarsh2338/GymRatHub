import { describe, it, expect } from "vitest";
import {
  classifySeverity,
  recommendAction,
  type PlateauSeverity,
  type PlateauType,
} from "../services/plateauDetection";

// ─── classifySeverity ─────────────────────────────────────────────────────────

describe("classifySeverity", () => {
  it("returns 'none' when sessions are below minimum trend threshold (< 3)", () => {
    expect(classifySeverity(50, 0)).toBe("none");
    expect(classifySeverity(50, 1)).toBe("none");
    expect(classifySeverity(50, 2)).toBe("none");
  });

  it("returns 'severe' for regression equal to or beyond -3%", () => {
    expect(classifySeverity(-3, 5)).toBe("severe");
    expect(classifySeverity(-10, 5)).toBe("severe");
    expect(classifySeverity(-100, 10)).toBe("severe");
  });

  it("returns 'moderate' for change below 1% (STALL_THRESHOLD * 0.4 = 1.0)", () => {
    // STALL_THRESHOLD_PCT = 2.5, * 0.4 = 1.0
    expect(classifySeverity(0, 4)).toBe("moderate");
    expect(classifySeverity(0.5, 4)).toBe("moderate");
    expect(classifySeverity(0.99, 4)).toBe("moderate");
  });

  it("returns 'mild' for change between 1% and 2.5%", () => {
    expect(classifySeverity(1.0, 4)).toBe("mild");
    expect(classifySeverity(2.0, 4)).toBe("mild");
    expect(classifySeverity(2.49, 4)).toBe("mild");
  });

  it("returns 'none' for genuine progress (>= 2.5%)", () => {
    expect(classifySeverity(2.5, 4)).toBe("none");
    expect(classifySeverity(10, 4)).toBe("none");
  });
});

// ─── recommendAction ──────────────────────────────────────────────────────────

describe("recommendAction", () => {
  const exercise = "Bench Press";
  const category = "Chest";

  it("recommends 'increase_frequency' for inconsistent type", () => {
    const rec = recommendAction("inconsistent", "none", exercise, category);
    expect(rec.action).toBe("increase_frequency");
    expect(rec.detail).toContain(exercise);
  });

  it("recommends 'deload' for regressing type regardless of severity", () => {
    const severities: PlateauSeverity[] = ["mild", "moderate", "severe", "none"];
    for (const severity of severities) {
      const rec = recommendAction("regressing", severity, exercise, category);
      expect(rec.action).toBe("deload");
      expect(rec.detail).toContain(exercise);
    }
  });

  it("recommends 'rep_range_shift' for severe or moderate strength_stall", () => {
    expect(recommendAction("strength_stall", "severe", exercise, category).action).toBe("rep_range_shift");
    expect(recommendAction("strength_stall", "moderate", exercise, category).action).toBe("rep_range_shift");
  });

  it("recommends 'rep_range_shift' for severe or moderate volume_stall", () => {
    expect(recommendAction("volume_stall", "severe", exercise, category).action).toBe("rep_range_shift");
    expect(recommendAction("volume_stall", "moderate", exercise, category).action).toBe("rep_range_shift");
  });

  it("recommends 'exercise_swap' for mild stalls", () => {
    const rec = recommendAction("strength_stall", "mild", exercise, category);
    expect(rec.action).toBe("exercise_swap");
    expect(rec.detail).toContain(category);
  });

  it("includes exercise name in all recommendation details", () => {
    const types: PlateauType[] = ["strength_stall", "volume_stall", "inconsistent", "regressing"];
    for (const type of types) {
      const rec = recommendAction(type, "mild", exercise, category);
      expect(rec.detail).toContain(exercise);
    }
  });
});
