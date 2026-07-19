"use client";

import { Check, ExternalLink, CreditCard, Zap, Crown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import type { UserPreferencesResponse } from "@/lib/settings-types";
import { cardStyle, sectionTitleStyle } from "./settings-ui";
import { useState } from "react";

const PLAN_DETAILS = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    icon: "🌱",
    color: "#6b7280",
    features: ["5 workouts/week", "Basic progress tracking", "Community access"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$14.99",
    period: "month",
    icon: "⚡",
    color: "#39E609",
    popular: true,
    features: ["Unlimited workouts", "Advanced analytics", "Custom workout plans", "Nutrition tracking"],
  },
  elite: {
    id: "elite",
    name: "Elite",
    price: "$24.99",
    period: "month",
    icon: "👑",
    color: "#f97316",
    features: ["Everything in Pro", "1-on-1 trainer sessions", "Custom meal plans", "Priority support 24/7"],
  },
} as const;

type PlanId = keyof typeof PLAN_DETAILS;

export default function BillingSettings() {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { data } = useQuery<UserPreferencesResponse>({
    queryKey: ["userPreferences"],
    queryFn: () => api("/users/preferences"),
    enabled: isApiReady,
  });

  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api("/users/profile"),
    enabled: isApiReady,
  });

  const currentPlan = (data?.plan ?? "free") as PlanId;
  const subscriptionStatus = profile?.subscriptionStatus;
  const hasActiveSubscription = profile?.stripeSubscriptionId && ["active", "trialing"].includes(subscriptionStatus ?? "");
  const isCanceling = subscriptionStatus === "canceling";

  const checkoutMutation = useMutation({
    mutationFn: (args: { plan: string; interval: string }) =>
      api("/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify(args),
      }),
    onSuccess: (data: { url: string }) => {
      if (data.url) window.location.href = data.url;
      else toast.error("Could not initialize Stripe Checkout.");
    },
    onError: () => toast.error("Failed to start checkout. Please try again."),
  });

  const portalMutation = useMutation({
    mutationFn: () => api("/payments/create-portal-session", { method: "POST" }),
    onSuccess: (data: { url: string }) => {
      if (data.url) window.location.href = data.url;
      else toast.error("Could not open billing portal.");
    },
    onError: () => toast.error("Could not open billing portal. Please try again."),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api("/payments/cancel-subscription", { method: "POST" }),
    onSuccess: () => {
      toast.success("Subscription will be canceled at the end of the billing period.");
      setShowCancelConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: () => toast.error("Could not cancel subscription. Please try from the billing portal."),
  });

  const current = PLAN_DETAILS[currentPlan] ?? PLAN_DETAILS.free;
  const isPending = checkoutMutation.isPending || portalMutation.isPending || cancelMutation.isPending;

  const statusBadge = () => {
    if (isCanceling) return { label: "Canceling", bg: "rgba(239,68,68,0.15)", color: "#ef4444" };
    if (hasActiveSubscription) return { label: "Active", bg: "rgba(57,230,9,0.15)", color: "#39E609" };
    return { label: "Free", bg: "rgba(107,114,128,0.15)", color: "#9ca3af" };
  };

  const badge = statusBadge();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Current Plan Card */}
      <div style={{ ...cardStyle, borderColor: `${current.color}40` }}>
        <p style={sectionTitleStyle}>Current Plan</p>
        <div style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${current.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              {current.icon}
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{current.name} Plan</p>
              <p style={{ color: "#6b7280", fontSize: 13 }}>{current.price}/{current.period}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isCanceling && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "3px 10px", borderRadius: 999 }}>
                <AlertTriangle size={10} /> Cancels at period end
              </span>
            )}
            <span style={{ fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color, padding: "4px 12px", borderRadius: 999 }}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Actions for paid plans */}
        {currentPlan !== "free" && (
          <div style={{ padding: "0 20px 20px", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => portalMutation.mutate()}
              disabled={isPending}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "rgba(57,230,9,0.1)", border: "1px solid rgba(57,230,9,0.3)", color: "#39E609", cursor: "pointer" }}
            >
              <CreditCard size={13} /> {portalMutation.isPending ? "Opening…" : "Manage Billing"}
              <ExternalLink size={11} />
            </button>

            {!isCanceling && (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isPending}
                style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "transparent", border: "1px solid #2a2a2a", color: "#6b7280", cursor: "pointer" }}
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}

        {/* Cancel confirmation */}
        {showCancelConfirm && (
          <div style={{ margin: "0 20px 20px", padding: 16, borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <p style={{ color: "#ef4444", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
              Cancel subscription?
            </p>
            <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 14 }}>
              You'll keep your {current.name} benefits until the end of your billing period. No refunds are issued for partial periods.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "#ef4444", border: "none", color: "#fff", cursor: "pointer" }}
              >
                {cancelMutation.isPending ? "Canceling…" : "Yes, Cancel"}
              </button>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "transparent", border: "1px solid #2a2a2a", color: "#9ca3af", cursor: "pointer" }}
              >
                Keep Plan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Options — only show if not already on elite */}
      {currentPlan !== "elite" && (
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={sectionTitleStyle}>Upgrade Plan</p>
            {/* Billing interval toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 20, marginTop: -4 }}>
              <button
                type="button"
                onClick={() => setInterval("monthly")}
                style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: interval === "monthly" ? "#39E609" : "transparent", color: interval === "monthly" ? "#000" : "#6b7280", border: "1px solid", borderColor: interval === "monthly" ? "#39E609" : "#2a2a2a", cursor: "pointer" }}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInterval("annual")}
                style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: interval === "annual" ? "#39E609" : "transparent", color: interval === "annual" ? "#000" : "#6b7280", border: "1px solid", borderColor: interval === "annual" ? "#39E609" : "#2a2a2a", cursor: "pointer" }}
              >
                Annual <span style={{ fontSize: 9, fontWeight: 800 }}>-20%</span>
              </button>
            </div>
          </div>

          <div style={{ padding: 20, display: "grid", gap: 16 }} className="billing-plans-grid">
            {(["pro", "elite"] as PlanId[])
              .filter((id) => id !== currentPlan)
              .map((planId) => {
                const plan = PLAN_DETAILS[planId];
                const price = planId === "pro"
                  ? (interval === "monthly" ? "$14.99" : "$11.99")
                  : (interval === "monthly" ? "$24.99" : "$19.99");

                return (
                  <div
                    key={plan.id}
                    style={{ padding: 20, borderRadius: 12, border: `1px solid ${plan.color}40`, background: `${plan.color}08`, position: "relative" }}
                  >
                    {planId === "pro" && (
                      <div style={{ position: "absolute", top: -10, left: 16 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, background: "#39E609", color: "#000", padding: "3px 10px", borderRadius: 999 }}>POPULAR</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{plan.icon}</span>
                      <p style={{ color: plan.color, fontWeight: 700, fontSize: 15 }}>{plan.name}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 24, color: "#fff" }}>{price}</span>
                      <span style={{ color: "#6b7280", fontSize: 12 }}>/mo</span>
                      {interval === "annual" && (
                        <span style={{ fontSize: 10, color: "#39E609", fontWeight: 700, marginLeft: 4 }}>billed annually</span>
                      )}
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                      {plan.features.map((f) => (
                        <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#d1d5db" }}>
                          <Check size={13} color={plan.color} /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => checkoutMutation.mutate({ plan: plan.id, interval })}
                      disabled={isPending}
                      style={{
                        width: "100%", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: isPending ? "default" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        background: plan.id === "pro" ? "#39E609" : "linear-gradient(135deg, #f97316, #f59e0b)",
                        color: "#000", border: "none",
                        opacity: isPending ? 0.7 : 1,
                      }}
                    >
                      {plan.id === "pro" ? <Zap size={13} /> : <Crown size={13} />}
                      {checkoutMutation.isPending ? "Redirecting to Stripe…" : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Already on elite — show portal button */}
      {currentPlan === "elite" && !isCanceling && (
        <div style={{ ...cardStyle, padding: 20 }}>
          <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 12 }}>
            You're on the Elite plan. Manage your billing, view invoices, or update payment details via the Stripe billing portal.
          </p>
          <button
            type="button"
            onClick={() => portalMutation.mutate()}
            disabled={isPending}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "rgba(57,230,9,0.1)", border: "1px solid rgba(57,230,9,0.3)", color: "#39E609", cursor: "pointer" }}
          >
            <CreditCard size={13} /> {portalMutation.isPending ? "Opening…" : "Open Billing Portal"}
            <ExternalLink size={11} />
          </button>
        </div>
      )}

      <p style={{ color: "#4b5563", fontSize: 11, padding: "0 4px" }}>
        Payments are processed securely by Stripe. GymRatHub does not store your card details.
      </p>
      <style>{`.billing-plans-grid { grid-template-columns: 1fr; } @media (min-width: 768px) { .billing-plans-grid { grid-template-columns: repeat(2, 1fr); } }`}</style>
    </div>
  );
}
