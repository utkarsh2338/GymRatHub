"use client";

import { Check } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import type { UserPreferencesResponse } from "@/lib/settings-types";
import { cardStyle, sectionTitleStyle } from "./settings-ui";

export default function BillingSettings() {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();

  const { data } = useQuery<UserPreferencesResponse>({
    queryKey: ["userPreferences"],
    queryFn: () => api("/users/preferences"),
    enabled: isApiReady,
  });

  const currentPlan = data?.plan ?? "free";

  const planMutation = useMutation({
    mutationFn: (plan: string) => api("/users/plan", { method: "PUT", body: JSON.stringify({ plan }) }),
    onSuccess: (_, plan) => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success(`Plan updated to ${plan}!`);
    },
    onError: () => toast.error("Could not update plan."),
  });

  const PLANS = [
    { id: "free", name: "Free", price: "$0", period: "forever", features: ["5 workouts/week", "Basic progress tracking", "Community access"], color: "#6b7280" },
    { id: "pro", name: "Pro", price: "$9.99", period: "month", features: ["Unlimited workouts", "Advanced analytics", "AI coaching", "Priority support"], color: "#39E609", popular: true },
    { id: "elite", name: "Elite", price: "$24.99", period: "month", features: ["Everything in Pro", "1-on-1 trainer sessions", "Custom meal plans", "Dedicated coach"], color: "#f97316" },
  ];

  const current = PLANS.find((p) => p.id === currentPlan) ?? PLANS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...cardStyle, borderColor: "rgba(57,230,9,0.25)" }}>
        <p style={sectionTitleStyle}>Current Plan</p>
        <div style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(57,230,9,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚡</div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{current.name} Plan</p>
              <p style={{ color: "#6b7280", fontSize: 13 }}>{current.price}/{current.period}</p>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(57,230,9,0.15)", color: "#39E609", padding: "4px 12px", borderRadius: 999 }}>Active</span>
        </div>
      </div>

      <div style={cardStyle}>
        <p style={sectionTitleStyle}>Change Plan</p>
        <div style={{ padding: 20, display: "grid", gap: 16 }} className="billing-plans-grid">
          {PLANS.map((plan) => (
            <div key={plan.id} style={{ padding: 20, borderRadius: 12, border: `1px solid ${currentPlan === plan.id ? "rgba(57,230,9,0.4)" : "#2a2a2a"}`, background: currentPlan === plan.id ? "rgba(57,230,9,0.05)" : "#1a1a1a", position: "relative" }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -10, left: 16 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, background: "#39E609", color: "#000", padding: "3px 10px", borderRadius: 999 }}>POPULAR</span>
                </div>
              )}
              <p style={{ color: plan.color, fontWeight: 700, fontSize: 15 }}>{plan.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4, marginBottom: 12 }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 24, color: "#fff" }}>{plan.price}</span>
                <span style={{ color: "#6b7280", fontSize: 12 }}>/{plan.period}</span>
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
                onClick={() => currentPlan !== plan.id && planMutation.mutate(plan.id)}
                disabled={currentPlan === plan.id || planMutation.isPending}
                style={{
                  width: "100%", padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: currentPlan === plan.id ? "default" : "pointer",
                  ...(currentPlan === plan.id
                    ? { background: "#39E609", color: "#000", border: "none" }
                    : { background: "#222", color: "#9ca3af", border: "1px solid #2a2a2a" }),
                }}
              >
                {currentPlan === plan.id ? "Current Plan" : planMutation.isPending ? "Updating…" : `Switch to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      <p style={{ color: "#6b7280", fontSize: 12, padding: "0 4px" }}>Payment processing is not connected yet — plan changes update your account tier immediately for demo purposes.</p>
      <style>{`.billing-plans-grid { grid-template-columns: 1fr; } @media (min-width: 768px) { .billing-plans-grid { grid-template-columns: repeat(3, 1fr); } }`}</style>
    </div>
  );
}
