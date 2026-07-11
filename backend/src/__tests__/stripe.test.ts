import { describe, it, expect, vi, beforeEach } from "vitest";
import router, { stripe } from "../routes/payments";
import UserModel from "../models/User";
import { Response } from "express";

vi.mock("../models/User");

// Mock stripe construction
vi.spyOn(stripe.webhooks, "constructEvent");

describe("Stripe Webhook Handler", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      headers: {
        "stripe-signature": "t=123,v1=abc,v0=def",
      },
      body: Buffer.from('{"id":"evt_123"}'),
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };
    vi.clearAllMocks();
  });

  const getWebhookHandler = () => {
    const layer = router.stack.find(
      (s: any) => s.route?.path === "/webhook" && s.route?.methods?.post
    );
    return layer?.route?.stack[1]?.handle;
  };

  it("should return 400 if constructEvent throws signature error", async () => {
    const handler = getWebhookHandler();
    expect(handler).toBeDefined();

    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    await handler!(mockRequest, mockResponse, vi.fn());

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith("Webhook Error: Invalid signature");
  });

  it("should process checkout.session.completed and upgrade user plan", async () => {
    const handler = getWebhookHandler();
    expect(handler).toBeDefined();

    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          client_reference_id: "user_clerk_123",
          customer: "cus_stripe_123",
          subscription: "sub_stripe_123",
          metadata: {
            plan: "pro",
            clerkId: "user_clerk_123",
          },
        },
      },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any);
    vi.mocked(UserModel.findOneAndUpdate).mockResolvedValue({} as any);

    await handler!(mockRequest, mockResponse, vi.fn());

    expect(UserModel.findOneAndUpdate).toHaveBeenCalledWith(
      { clerkId: "user_clerk_123" },
      {
        $set: {
          plan: "pro",
          stripeCustomerId: "cus_stripe_123",
          stripeSubscriptionId: "sub_stripe_123",
          subscriptionStatus: "active",
        },
      }
    );
    expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
  });

  it("should process customer.subscription.deleted and downgrade user plan", async () => {
    const handler = getWebhookHandler();
    expect(handler).toBeDefined();

    const mockEvent = {
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_stripe_123",
        },
      },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any);
    vi.mocked(UserModel.findOneAndUpdate).mockResolvedValue({} as any);

    await handler!(mockRequest, mockResponse, vi.fn());

    expect(UserModel.findOneAndUpdate).toHaveBeenCalledWith(
      { stripeSubscriptionId: "sub_stripe_123" },
      {
        $set: {
          plan: "free",
          stripeSubscriptionId: null,
          subscriptionStatus: "canceled",
        },
      }
    );
    expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
  });
});
