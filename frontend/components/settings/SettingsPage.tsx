"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Shield, Palette, Dumbbell, CreditCard,
  LogOut, ChevronRight,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import ProfileSettings from "./ProfileSettings";
import NotificationsSettings from "./NotificationsSettings";
import PrivacySettings from "./PrivacySettings";
import AppearanceSettings from "./AppearanceSettings";
import FitnessSettings from "./FitnessSettings";
import BillingSettings from "./BillingSettings";

type Section = "profile" | "notifications" | "privacy" | "appearance" | "fitness" | "billing";

const SECTIONS = [
  { id: "profile" as Section, label: "Profile", icon: User, color: "#39E609" },
  { id: "notifications" as Section, label: "Notifications", icon: Bell, color: "#f97316" },
  { id: "privacy" as Section, label: "Privacy & Security", icon: Shield, color: "#a855f7" },
  { id: "appearance" as Section, label: "Appearance", icon: Palette, color: "#38bdf8" },
  { id: "fitness" as Section, label: "Fitness Settings", icon: Dumbbell, color: "#f97316" },
  { id: "billing" as Section, label: "Billing & Plans", icon: CreditCard, color: "#22d3ee" },
];

const SECTION_COMPONENTS: Record<Section, React.ComponentType> = {
  profile: ProfileSettings,
  notifications: NotificationsSettings,
  privacy: PrivacySettings,
  appearance: AppearanceSettings,
  fitness: FitnessSettings,
  billing: BillingSettings,
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const { signOut } = useClerk();
  const ActiveComponent = SECTION_COMPONENTS[activeSection];

  return (
    <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "clamp(22px, 3vw, 30px)", color: "#fff", marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: "grid", gap: 24, alignItems: "flex-start" }} className="settings-layout">
        <div style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 12, overflow: "hidden", position: "sticky", top: 24 }}>
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(s.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, padding: "14px 16px", border: "none", cursor: "pointer", textAlign: "left",
                  background: active ? `${s.color}10` : "transparent",
                  borderLeft: active ? `3px solid ${s.color}` : "3px solid transparent",
                  borderBottom: i < SECTIONS.length - 1 ? "1px solid #1f1f1f" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: active ? `${s.color}20` : "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={15} color={active ? s.color : "#6b7280"} />
                  </div>
                  <span style={{ color: active ? "#fff" : "#9ca3af", fontSize: 14, fontWeight: active ? 600 : 400 }}>{s.label}</span>
                </div>
                <ChevronRight size={14} color={active ? s.color : "#4b5563"} />
              </motion.button>
            );
          })}
          <div style={{ borderTop: "1px solid #2a2a2a", padding: 12 }}>
            <button
              type="button"
              onClick={() => signOut({ redirectUrl: "/auth" })}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 8, border: "none", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`.settings-layout { grid-template-columns: 1fr; } @media (min-width: 768px) { .settings-layout { grid-template-columns: 240px 1fr; } }`}</style>
    </div>
  );
}
