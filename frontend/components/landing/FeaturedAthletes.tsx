"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const ATHLETES = [
  {
    name: "Marcus Vaughn",
    sport: "Powerlifting",
    bio: "Three-time national champion focused on raw strength and explosive compound lifts.",
    badge: "#1 Ranked",
    color: "#39E609",
    initials: "MV",
  },
  {
    name: "Elena Cruz",
    sport: "CrossFit",
    bio: "Elite CrossFit competitor blending endurance, mobility and functional power training.",
    badge: "Elite",
    color: "#38bdf8",
    initials: "EC",
  },
  {
    name: "Andre Okafor",
    sport: "Bodybuilding",
    bio: "IFBB pro sculpting championship physiques through precision hypertrophy and nutrition.",
    badge: "IFBB Pro",
    color: "#a855f7",
    initials: "AO",
  },
];

export default function FeaturedAthletes() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      style={{ padding: "80px 24px", background: "#0a0a0a" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ color: "#39E609", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
              Featured Athletes
            </p>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 4vw, 36px)", color: "#fff" }}>
              Train With The Best
            </h2>
          </div>
          <Link
            href="/trainers"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              color: "#9ca3af",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{ display: "grid", gap: 20 }}
          className="athletes-grid"
        >
          {ATHLETES.map((athlete, i) => (
            <motion.div
              key={athlete.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ scale: 1.02, y: -4 }}
              style={{
                background: "#1c1c1c",
                border: "1px solid #2a2a2a",
                borderRadius: 16,
                padding: 24,
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onHoverStart={(e) => {
                const el = e.target as HTMLElement;
                if (el.style) el.style.borderColor = "rgba(57,230,9,0.3)";
              }}
              onHoverEnd={(e) => {
                const el = e.target as HTMLElement;
                if (el.style) el.style.borderColor = "#2a2a2a";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: athlete.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#000",
                    flexShrink: 0,
                  }}
                >
                  {athlete.initials}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "#fff", fontSize: 15 }}>{athlete.name}</p>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: `${athlete.color}22`,
                      color: athlete.color,
                    }}
                  >
                    {athlete.sport}
                  </span>
                </div>
              </div>
              <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6 }}>{athlete.bio}</p>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 4,
                    background: `${athlete.color}18`,
                    color: athlete.color,
                  }}
                >
                  {athlete.badge}
                </span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>View Profile →</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .athletes-grid { grid-template-columns: 1fr; }
        @media (min-width: 640px) { .athletes-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .athletes-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </section>
  );
}
