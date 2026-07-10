import { describe, it, expect, vi, beforeEach } from "vitest";
import router from "../routes/workoutTracking";
import WorkoutTemplateModel from "../models/WorkoutTemplate";
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";

vi.mock("../models/WorkoutTemplate");

describe("Workout Template CRUD Routes", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      auth: { userId: "user_123" },
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  // Extract handlers from router stack
  const getRouteHandler = (path: string, method: string) => {
    const layer = router.stack.find(
      (s: any) => s.route?.path === path && s.route?.methods?.[method]
    );
    return layer?.route?.stack[0]?.handle;
  };

  describe("GET /workout-templates", () => {
    it("should return all templates for the authenticated user", async () => {
      const handler = getRouteHandler("/workout-templates", "get");
      expect(handler).toBeDefined();

      const mockTemplates = [{ name: "Plan A" }, { name: "Plan B" }];
      vi.mocked(WorkoutTemplateModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockTemplates),
      } as any);

      await handler!(mockRequest as AuthenticatedRequest, mockResponse as Response, vi.fn());

      expect(WorkoutTemplateModel.find).toHaveBeenCalledWith({ clerkId: "user_123" });
      expect(mockResponse.json).toHaveBeenCalledWith(mockTemplates);
    });
  });

  describe("POST /workout-templates", () => {
    it("should return 400 if template name is missing", async () => {
      const handler = getRouteHandler("/workout-templates", "post");
      expect(handler).toBeDefined();

      mockRequest.body = { name: "" };

      await handler!(mockRequest as AuthenticatedRequest, mockResponse as Response, vi.fn());

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Plan name is required." });
      expect(WorkoutTemplateModel.create).not.toHaveBeenCalled();
    });

    it("should create and return a new template", async () => {
      const handler = getRouteHandler("/workout-templates", "post");
      expect(handler).toBeDefined();

      const newTemplateData = {
        name: "Push Day",
        description: "Heavy compound chest and tricep day",
        goalType: "muscle_gain",
        days: [],
      };
      mockRequest.body = newTemplateData;

      vi.mocked(WorkoutTemplateModel.create).mockResolvedValue({
        clerkId: "user_123",
        ...newTemplateData,
      } as any);

      await handler!(mockRequest as AuthenticatedRequest, mockResponse as Response, vi.fn());

      expect(WorkoutTemplateModel.create).toHaveBeenCalledWith({
        clerkId: "user_123",
        name: "Push Day",
        description: "Heavy compound chest and tricep day",
        goalType: "muscle_gain",
        planType: "custom",
        days: [],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe("DELETE /workout-templates/:id", () => {
    it("should delete template and return success: true", async () => {
      const handler = getRouteHandler("/workout-templates/:id", "delete");
      expect(handler).toBeDefined();

      mockRequest.params = { id: "template_abc" };
      vi.mocked(WorkoutTemplateModel.deleteOne).mockResolvedValue({ deletedCount: 1 } as any);

      await handler!(mockRequest as AuthenticatedRequest, mockResponse as Response, vi.fn());

      expect(WorkoutTemplateModel.deleteOne).toHaveBeenCalledWith({
        _id: "template_abc",
        clerkId: "user_123",
      });
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it("should return 404 if template not found during delete", async () => {
      const handler = getRouteHandler("/workout-templates/:id", "delete");
      expect(handler).toBeDefined();

      mockRequest.params = { id: "template_abc" };
      vi.mocked(WorkoutTemplateModel.deleteOne).mockResolvedValue({ deletedCount: 0 } as any);

      await handler!(mockRequest as AuthenticatedRequest, mockResponse as Response, vi.fn());

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Template not found." });
    });
  });
});
