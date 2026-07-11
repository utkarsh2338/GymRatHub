import { describe, it, expect, vi, beforeEach } from "vitest";
import router from "../routes/workoutTracking";
import WorkoutTemplateModel from "../models/WorkoutTemplate";
import WorkoutSessionModel from "../models/WorkoutSession";
import UserModel from "../models/User";
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";

// Mock all DB models so no real connection is needed
vi.mock("../models/WorkoutTemplate");
vi.mock("../models/WorkoutSession");
vi.mock("../models/User");
vi.mock("../models/Workout");
vi.mock("../models/Planner");
vi.mock("../services/workoutPlanSync", () => ({
  buildDashboardWorkoutSchedule: vi.fn().mockResolvedValue([]),
}));

// ─── Shared test harness ──────────────────────────────────────────────────────

/** Extracts the last handler (the business logic, not middleware) for a route. */
function getRouteHandler(path: string, method: string) {
  const layer = router.stack.find(
    (s: any) => s.route?.path === path && s.route?.methods?.[method]
  );
  // Take the last stack entry — middleware (validateBody) comes first, handler last
  const stack = layer?.route?.stack ?? [];
  return stack[stack.length - 1]?.handle;
}

describe("Workout Template CRUD — PUT and additional coverage", () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { auth: { userId: "user_123" } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  // ─── PUT /workout-templates/:id ───────────────────────────────────────────

  describe("PUT /workout-templates/:id", () => {
    it("updates template fields and returns the updated document", async () => {
      const handler = getRouteHandler("/workout-templates/:id", "put");
      expect(handler).toBeDefined();

      req.params = { id: "tpl_abc" };
      req.body = { name: "Updated Plan" };

      const updatedTemplate = { _id: "tpl_abc", clerkId: "user_123", name: "Updated Plan" };
      vi.mocked(WorkoutTemplateModel.findOneAndUpdate).mockResolvedValue(updatedTemplate as any);

      await handler!(req as AuthenticatedRequest, res as Response, vi.fn());

      expect(WorkoutTemplateModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "tpl_abc", clerkId: "user_123" },
        { $set: { name: "Updated Plan" } },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(updatedTemplate);
    });

    it("returns 404 when the template doesn't belong to the user", async () => {
      const handler = getRouteHandler("/workout-templates/:id", "put");
      expect(handler).toBeDefined();

      req.params = { id: "tpl_notmine" };
      req.body = { name: "Hack" };
      vi.mocked(WorkoutTemplateModel.findOneAndUpdate).mockResolvedValue(null);

      await handler!(req as AuthenticatedRequest, res as Response, vi.fn());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Template not found." });
    });
  });

  // ─── POST /workout-templates/:id/duplicate ────────────────────────────────

  describe("POST /workout-templates/:id/duplicate", () => {
    it("creates a copy of the template with '(Copy)' suffix", async () => {
      const handler = getRouteHandler("/workout-templates/:id/duplicate", "post");
      expect(handler).toBeDefined();

      req.params = { id: "tpl_original" };
      req.body = {};

      const original = { _id: "tpl_original", name: "Push Day", description: "", goalType: "muscle_gain", days: [] };
      const copy = { ...original, _id: "tpl_copy", name: "Push Day (Copy)" };

      vi.mocked(WorkoutTemplateModel.findOne).mockResolvedValue(original as any);
      vi.mocked(WorkoutTemplateModel.create).mockResolvedValue(copy as any);

      await handler!(req as AuthenticatedRequest, res as Response, vi.fn());

      expect(WorkoutTemplateModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Push Day (Copy)" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(copy);
    });

    it("returns 404 when the original template is not found", async () => {
      const handler = getRouteHandler("/workout-templates/:id/duplicate", "post");
      expect(handler).toBeDefined();

      req.params = { id: "tpl_gone" };
      req.body = {};

      vi.mocked(WorkoutTemplateModel.findOne).mockResolvedValue(null);

      await handler!(req as AuthenticatedRequest, res as Response, vi.fn());

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─── GET /workout-sessions/:id ───────────────────────────────────────────

  describe("GET /workout-sessions/:id", () => {
    it("returns session details for the requesting user", async () => {
      const handler = getRouteHandler("/workout-sessions/:id", "get");
      expect(handler).toBeDefined();

      req.params = { id: "session_abc" };

      const session = {
        _id: "session_abc",
        clerkId: "user_123",
        status: "completed",
        exercises: [],
      };

      vi.mocked(WorkoutSessionModel.findOne).mockResolvedValue(session as any);

      await handler!(req as AuthenticatedRequest, res as Response, vi.fn());

      expect(WorkoutSessionModel.findOne).toHaveBeenCalledWith({
        _id: "session_abc",
        clerkId: "user_123",
      });
      expect(res.json).toHaveBeenCalledWith(session);
    });

    it("returns 404 when session is not found", async () => {
      const handler = getRouteHandler("/workout-sessions/:id", "get");
      expect(handler).toBeDefined();

      req.params = { id: "session_gone" };
      vi.mocked(WorkoutSessionModel.findOne).mockResolvedValue(null);

      await handler!(req as AuthenticatedRequest, res as Response, vi.fn());

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
