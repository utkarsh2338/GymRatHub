import express, { Router, Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../config/env";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import UserModel from "../models/User";

const router = Router();
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16" as any,
});

// Create Checkout Session
router.post("/create-checkout-session", express.json(), requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    const { plan, interval } = req.body; // plan: "pro" | "elite", interval: "monthly" | "annual"

    if (!["pro", "elite"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan selection." });
    }
    if (!["monthly", "annual"].includes(interval)) {
      return res.status(400).json({ error: "Invalid billing interval." });
    }

    const user = await UserModel.findOne({ clerkId });
    if (!user) return res.status(404).json({ error: "User not found." });

    // Map plan + interval to price ID
    let priceId = "";
    if (plan === "pro") {
      priceId = interval === "monthly" ? env.STRIPE_PRO_MONTHLY_PRICE_ID : env.STRIPE_PRO_ANNUAL_PRICE_ID;
    } else {
      priceId = interval === "monthly" ? env.STRIPE_ELITE_MONTHLY_PRICE_ID : env.STRIPE_ELITE_ANNUAL_PRICE_ID;
    }

    // Define checkout parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${env.FRONTEND_URL || "http://localhost:3000"}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL || "http://localhost:3000"}/premium/cancel`,
      client_reference_id: clerkId,
      customer_email: user.email as string,
      metadata: {
        plan,
        clerkId,
      },
    };

    // If customer already has a stripeCustomerId, reuse it
    if (user.stripeCustomerId) {
      sessionParams.customer = user.stripeCustomerId;
      delete sessionParams.customer_email; // customer and customer_email cannot be set together
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.json({ url: session.url });
  } catch (error) {
    console.error("Create Checkout Session error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Webhook endpoint (Requires RAW body parsing to confirm signatures)
router.post("/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // This must be the raw buffer
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle Stripe webhook events
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkId = session.client_reference_id;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;
        const plan = session.metadata?.plan;

        if (clerkId && plan) {
          await UserModel.findOneAndUpdate(
            { clerkId },
            {
              $set: {
                plan,
                stripeCustomerId,
                stripeSubscriptionId,
                subscriptionStatus: "active",
              },
            }
          );
          console.log(`Successfully upgraded user ${clerkId} to ${plan}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = subscription.id;
        const subscriptionStatus = subscription.status;

        // If subscription is canceled/unpaid
        if (["unpaid", "canceled", "incomplete_expired"].includes(subscriptionStatus)) {
          await UserModel.findOneAndUpdate(
            { stripeSubscriptionId },
            {
              $set: {
                plan: "free",
                subscriptionStatus,
              },
            }
          );
        } else {
          // Sync current active subscription status
          await UserModel.findOneAndUpdate(
            { stripeSubscriptionId },
            {
              $set: {
                subscriptionStatus,
              },
            }
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = subscription.id;

        await UserModel.findOneAndUpdate(
          { stripeSubscriptionId },
          {
            $set: {
              plan: "free",
              stripeSubscriptionId: null,
              subscriptionStatus: "canceled",
            },
          }
        );
        console.log(`Subscription ${stripeSubscriptionId} deleted, reset user to free plan`);
        break;
      }
      default:
        // Other events ignored
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Create Stripe Customer Portal Session
router.post("/create-portal-session", express.json(), requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const user = await UserModel.findOne({ clerkId });
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: "No billing account found. Please subscribe first." });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.FRONTEND_URL || "http://localhost:3000"}/settings?tab=billing`,
    });

    return res.json({ url: portalSession.url });
  } catch (error) {
    console.error("Create Portal Session error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Cancel Subscription at period end
router.post("/cancel-subscription", express.json(), requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const user = await UserModel.findOne({ clerkId });
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active subscription found." });
    }

    // Cancel at period end (user keeps access until billing period ends)
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Mark subscription as canceling in DB
    await UserModel.findOneAndUpdate(
      { clerkId },
      { $set: { subscriptionStatus: "canceling" } }
    );

    console.log(`Subscription ${user.stripeSubscriptionId} set to cancel at period end for user ${clerkId}`);
    return res.json({ success: true, message: "Subscription will be canceled at the end of the billing period." });
  } catch (error) {
    console.error("Cancel Subscription error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
