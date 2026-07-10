import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import jwt from "jsonwebtoken";
import UserModel from "../models/User";
import { Response, NextFunction } from "express";

vi.mock("jsonwebtoken");
vi.mock("../models/User");

describe("Auth Middleware - requireAuth", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = vi.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    nextFunction = vi.fn();
    vi.clearAllMocks();
  });

  it("should return 401 if Authorization header is missing", async () => {
    mockRequest.headers = {};

    await requireAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized: Missing or invalid token." });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if Authorization header does not start with Bearer", async () => {
    mockRequest.headers = { authorization: "Basic base64token" };

    await requireAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized: Missing or invalid token." });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if jwt.verify fails", async () => {
    mockRequest.headers = { authorization: "Bearer invalid_token" };
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    await requireAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized: Token verification failed." });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if user does not exist in database", async () => {
    mockRequest.headers = { authorization: "Bearer valid_token" };
    vi.mocked(jwt.verify).mockReturnValue({ userId: "user_123" } as any);
    vi.mocked(UserModel.exists).mockResolvedValue(null as any);

    await requireAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(UserModel.exists).toHaveBeenCalledWith({ clerkId: "user_123" });
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized: User not found." });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should call next() if token is valid and user exists", async () => {
    mockRequest.headers = { authorization: "Bearer valid_token" };
    vi.mocked(jwt.verify).mockReturnValue({ userId: "user_123" } as any);
    vi.mocked(UserModel.exists).mockResolvedValue({ _id: "some_id" } as any);

    await requireAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(mockRequest.auth).toEqual({ userId: "user_123" });
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
});
