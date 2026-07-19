"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check, X, Crown, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";

const PLANS = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    subtitle: "For getting started",
    icon: "🌱",
    color: "#6b7280",
    features: [
      { text: "Basic workout library", included: true },
      { text: "Progress tracking", included: true },
      { text: "Community access", included: true },
      { text: "Custom meal plans", included: false },
      { text: "1-on-1 trainer sessions", included: false },
    ],
    cta: "Current Plan",
    ctaType: "ghost",
  },
  {
    name: "Pro",
    price: { monthly: 14.99, annual: 11.99 },
    subtitle: "For dedicated lifters",
    icon: "⚡",
    color: "#39E609",
    badge: "Most Popular",
    features: [
      { text: "Unlimited workout library", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom workout plans", included: true },
      { text: "Nutrition tracking", included: true },
      { text: "1-on-1 trainer sessions", included: false },
    ],
    cta: "Upgrade to Pro",
    ctaType: "primary",
  },
  {
    name: "Elite",
    price: { monthly: 24.99, annual: 19.99 },
    subtitle: "For serious athletes",
    icon: "👑",
    color: "#f97316",
    badge: "Best Value",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "1-on-1 trainer sessions", included: true },
      { text: "Custom meal plans", included: true },
      { text: "Priority support 24/7", included: true },
      { text: "Exclusive challenges", included: true },
    ],
    cta: "Go Elite",
    ctaType: "elite",
  },
];

const FEATURE_COMPARISON = [
  { feature: "Workout Library", free: true, pro: true, elite: true },
  { feature: "Custom Plans", free: false, pro: true, elite: true },
  { feature: "Nutrition Tracking", free: false, pro: true, elite: true },
  { feature: "Progress Analytics", free: false, pro: true, elite: true },
  { feature: "Community Access", free: true, pro: true, elite: true },
  { feature: "Trainer Sessions", free: false, pro: false, elite: true },
  { feature: "Priority Support", free: false, pro: false, elite: true },
];

const TESTIMONIALS = [
  {
    stars: 5,
    text: "The Elite plan's trainer session completely changed my workout form. Worth every penny.",
    name: "Derek Lyons",
    since: "Member since 2021",
    initials: "DL",
    color: "#39E609",
  },
  {
    stars: 5,
    text: "Pro analytics keep me accountable. I've hit three PRs since upgrading my membership.",
    name: "Mia Castellano",
    since: "Member since 2022",
    initials: "MC",
    color: "#38bdf8",
  },
  {
    stars: 5,
    text: "Custom meal plans took the guesswork out of cutting. Best fitness investment I've made.",
    name: "Tario Bello",
    since: "Member since 2022",
    initials: "TB",
    color: "#a855f7",
  },
];

function PricingCard({
  plan,
  billing,
  index,
  currentPlan,
  onChangePlan,
  isPending
}: {
  plan: (typeof PLANS)[0];
  billing: "monthly" | "annual";
  index: number;
  currentPlan: string;
  onChangePlan: (plan: string) => void;
  isPending: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const isPro = plan.name === "Pro";
  const isElite = plan.name === "Elite";
  const price = plan.price[billing];
  const isAnnualSaving = billing === "annual" && price > 0;

  const isActive = currentPlan === plan.name.toLowerCase();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        "relative rounded-2xl p-6 transition-all duration-300 spotlight",
        isPro
          ? "bg-[#0f1f0f] border-2 border-[#39E609]/60 shadow-neon-sm"
          : "bg-[#1c1c1c] border border-[#2a2a2a]"
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className="text-[10px] font-black px-3 py-1 rounded-full"
            style={{
              background: isPro ? "#39E609" : "#f97316",
              color: "#000",
            }}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <div className="text-2xl mb-2">{plan.icon}</div>
      <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-1">
        {plan.name}
      </p>
      <div className="flex items-end gap-1 mb-1">
        <span className="font-display font-black text-4xl text-white">
          ${price === 0 ? "0" : price.toFixed(2)}
        </span>
        {price > 0 && <span className="text-gray-500 text-sm mb-1">/mo</span>}
      </div>
      {isAnnualSaving && (
        <p className="text-[#39E609] text-xs font-bold mb-1">
          Save ${((plan.price.monthly - price) * 12).toFixed(0)}/yr
        </p>
      )}
      <p className="text-gray-500 text-xs mb-5">{plan.subtitle}</p>

      <ul className="space-y-2.5 mb-6">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5">
            {f.included ? (
              <Check
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: isPro ? "#39E609" : isElite ? "#f97316" : "#6b7280" }}
              />
            ) : (
              <X className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
            )}
            <span className={cn("text-xs", f.included ? "text-gray-300" : "text-gray-600")}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={isActive ? undefined : { scale: 1.03 }}
        whileTap={isActive ? undefined : { scale: 0.97 }}
        onClick={() => !isActive && onChangePlan(plan.name.toLowerCase())}
        disabled={isActive || isPending}
        className={cn(
          "w-full py-3 rounded-xl text-sm font-bold transition-all",
          isActive
            ? "bg-[#111] border border-[#2a2a2a] text-gray-400 cursor-default"
            : isPro
            ? "btn-neon pulse-glow"
            : isElite
            ? "bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-black"
            : "bg-[#222] border border-[#2a2a2a] text-gray-300"
        )}
      >
        {isActive ? "Current Plan" : isPending ? "Updating..." : plan.name === "Free" ? "Switch to Free" : plan.cta}
      </motion.button>
    </motion.div>
  );
}

export default function PremiumPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const api = useApiClient();
  const isApiReady = useIsApiReady();

  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api("/users/profile"),
    enabled: isApiReady,
  });

  const currentPlan = profile?.plan ?? "free";

  const checkoutMutation = useMutation({
    mutationFn: (args: { plan: string; interval: string }) =>
      api("/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify(args),
      }),
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not initialize Stripe Checkout.");
      }
    },
    onError: () => toast.error("Stripe Checkout failed to initialize."),
  });

  const portalMutation = useMutation({
    mutationFn: () =>
      api("/payments/create-portal-session", { method: "POST" }),
    onSuccess: (data: { url: string }) => {
      if (data.url) window.location.href = data.url;
      else toast.error("Could not open billing portal.");
    },
    onError: () => toast.error("Could not open billing portal."),
  });

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-[#39E609]/10 border border-[#39E609]/20 rounded-full px-4 py-1.5 text-xs font-bold text-[#39E609] mb-5">
            <Crown className="w-3.5 h-3.5" /> Premium Plans
          </div>
          <h1 className="font-display font-black text-4xl lg:text-5xl mb-4">
            Go Premium.
            <br />
            <span className="text-gradient-green">Train Like a Pro.</span>
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Unlock unlimited workouts, expert trainers, and advanced analytics
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={cn("text-sm", billing === "monthly" ? "text-white" : "text-gray-500")}>
            Monthly
          </span>
          <button
            onClick={() => setBilling((b) => (b === "monthly" ? "annual" : "monthly"))}
            className="relative w-14 h-7 bg-[#39E609] rounded-full transition-all"
          >
            <motion.div
              animate={{ x: billing === "annual" ? 28 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-5 h-5 bg-black rounded-full"
            />
          </button>
          <span className={cn("text-sm", billing === "annual" ? "text-white" : "text-gray-500")}>
            Annual
            <span className="ml-1.5 text-[10px] font-bold text-black bg-[#39E609] px-1.5 py-0.5 rounded-full">
              Save 20%
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              billing={billing}
              index={i}
              currentPlan={currentPlan}
              onChangePlan={(p) => {
                if (p === "free") {
                  // Route to Stripe portal if they have a subscription, else no-op
                  if (profile?.stripeSubscriptionId) {
                    portalMutation.mutate();
                  } else {
                    toast.info("You are already on the free plan.");
                  }
                } else {
                  checkoutMutation.mutate({ plan: p, interval: billing });
                }
              }}
              isPending={checkoutMutation.isPending || portalMutation.isPending}
            />
          ))}
        </div>

        {/* Feature Comparison */}
        <div>
          <h2 className="font-display font-bold text-2xl mb-6 text-center">Compare Features</h2>
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="px-6 py-4 text-left text-gray-400 font-medium w-1/2">Feature</th>
                  <th className="px-4 py-4 text-center text-gray-400 font-medium">Free</th>
                  <th className="px-4 py-4 text-center text-[#39E609] font-bold">Pro</th>
                  <th className="px-4 py-4 text-center text-[#f97316] font-bold">Elite</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((row, i) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[#1f1f1f] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 text-gray-300">{row.feature}</td>
                    {[row.free, row.pro, row.elite].map((val, j) => (
                      <td key={j} className="px-4 py-4 text-center">
                        {val ? (
                          <Check className="w-4 h-4 mx-auto" style={{ color: j === 1 ? "#39E609" : j === 2 ? "#f97316" : "#6b7280" }} />
                        ) : (
                          <X className="w-4 h-4 text-gray-700 mx-auto" />
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h2 className="font-display font-bold text-2xl mb-6 text-center">What Members Say</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl p-5"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[#f97316] text-[#f97316]" />
                  ))}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-black text-xs"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.since}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#0f1f0f] border border-[#39E609]/30 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="font-display font-bold text-2xl mb-1">Join 128K+ Athletes</h3>
            <p className="text-gray-500 text-sm">
              Start your premium journey today. Cancel anytime.
            </p>
          </div>
          <motion.button
            whileHover={currentPlan === "elite" ? undefined : { scale: 1.04 }}
            whileTap={currentPlan === "elite" ? undefined : { scale: 0.97 }}
            onClick={() => {
              if (currentPlan === "free") {
                checkoutMutation.mutate({ plan: "pro", interval: billing });
              } else if (currentPlan === "pro") {
                checkoutMutation.mutate({ plan: "elite", interval: billing });
              } else {
                // Already elite — open portal to manage subscription
                portalMutation.mutate();
              }
            }}
            disabled={checkoutMutation.isPending || portalMutation.isPending}
            className="btn-neon flex items-center gap-2 px-8 py-3 text-sm font-bold shrink-0 pulse-glow"
          >
            <Zap className="w-4 h-4" /> {checkoutMutation.isPending || portalMutation.isPending ? "Redirecting..." : currentPlan === "free" ? "Upgrade to Pro" : currentPlan === "pro" ? "Upgrade to Elite" : "Manage Subscription"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
