"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  TrendingUp,
  CalendarDays,
  Users,
  Trophy,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import { getInitials, getPlanLabel } from "@/lib/user-utils";

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workouts", href: "/workouts", icon: Dumbbell },
  { label: "Nutrition", href: "/nutrition", icon: Apple },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Planner", href: "/planner", icon: CalendarDays },
  { label: "Community", href: "/community", icon: Users },
  { label: "Challenges", href: "/challenges", icon: Trophy },
  { label: "Trainers", href: "/trainers", icon: UserCheck },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user: clerkUser } = useUser();
  const api = useApiClient();
  const isApiReady = useIsApiReady();

  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api("/users/profile"),
    enabled: isApiReady,
  });

  const displayName =
    profile?.name ||
    clerkUser?.fullName ||
    `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() ||
    "Athlete";

  const avatarUrl = profile?.avatar || clerkUser?.imageUrl || "";
  const planLabel = getPlanLabel(profile?.plan);
  const initials = getInitials(displayName);

  const W = collapsed ? 64 : 220;

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: W,
        minWidth: W,
        display: "flex",
        flexDirection: "column",
        background: "#111111",
        borderRight: "1px solid #1f1f1f",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 64,
          padding: "0 16px",
          borderBottom: "1px solid #1f1f1f",
          flexShrink: 0,
        }}
      >
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "#39E609",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Dumbbell size={16} color="#000" strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                <span style={{ color: "#fff" }}>GymRat</span>
                <span style={{ color: "#39E609" }}>Hub</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px 8px", scrollbarWidth: "none" }}>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  title={collapsed ? link.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                    position: "relative",
                    transition: "all 0.15s",
                    background: isActive ? "rgba(57,230,9,0.1)" : "transparent",
                    color: isActive ? "#39E609" : "#6b7280",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 4,
                        bottom: 4,
                        width: 3,
                        background: "#39E609",
                        borderRadius: 999,
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon
                    size={16}
                    style={{
                      flexShrink: 0,
                      color: isActive ? "#39E609" : "#6b7280",
                    }}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid #1f1f1f",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px",
            borderRadius: 8,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
                border: "1px solid rgba(57,230,9,0.4)",
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(57,230,9,0.2)",
                border: "1px solid rgba(57,230,9,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#39E609",
                fontWeight: 700,
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ minWidth: 0 }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {displayName}
                </p>
                <p style={{ fontSize: 11, color: "#39E609", fontWeight: 500 }}>{planLabel}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          right: -12,
          top: 80,
          width: 24,
          height: 24,
          background: "#1c1c1c",
          border: "1px solid #2a2a2a",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#9ca3af",
          zIndex: 10,
          transition: "all 0.2s",
        }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
