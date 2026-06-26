"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, Clock, Users, Search, CheckCircle } from "lucide-react";
import { mockTrainers } from "@/lib/mock-data";
import { toast } from "sonner";
import type { Trainer } from "@/lib/types";

const SPECIALTIES = ["All", "Powerlifting", "CrossFit", "Bodybuilding", "HIIT", "Yoga", "Boxing", "Weight Loss"];

const COVER_IMGS = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
  "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=600&q=80",
  "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
  "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
];

const BADGE_COLOR: Record<string, string> = {
  "Top Rated": "#39E609",
  "New": "#38bdf8",
  "Featured": "#f97316",
};

function TrainerCard({ trainer, index }: { trainer: Trainer; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 3) * 0.1 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.02, y: -4 }}
      style={{
        background: "#1c1c1c",
        border: `1px solid ${hovered ? "rgba(57,230,9,0.3)" : "#2a2a2a"}`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "border-color 0.3s, box-shadow 0.3s",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(57,230,9,0.08)" : "none",
      }}
    >
      {/* Cover image */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img
          src={COVER_IMGS[index % COVER_IMGS.length]}
          alt={trainer.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transition: "transform 0.5s",
            transform: hovered ? "scale(1.08)" : "scale(1)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />

        {/* Badge */}
        {trainer.badge && (
          <div style={{ position: "absolute", top: 12, left: 12 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 999,
              background: BADGE_COLOR[trainer.badge] ?? "#39E609", color: "#000",
            }}>
              {trainer.badge}
            </span>
          </div>
        )}

        {/* Availability */}
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.55)", padding: "4px 8px", borderRadius: 999, backdropFilter: "blur(4px)" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: trainer.available ? "#39E609" : "#6b7280", boxShadow: trainer.available ? "0 0 6px #39E609" : "none" }} />
          <span style={{ fontSize: 11, color: trainer.available ? "#fff" : "#9ca3af", fontWeight: 600 }}>
            {trainer.available ? "Available" : "Booked"}
          </span>
        </div>

        {/* Avatar */}
        <div style={{ position: "absolute", bottom: -22, left: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg, #39E609, #22c55e)",
            border: "3px solid #1c1c1c",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, color: "#000", fontSize: 16,
          }}>
            {trainer.name.split(" ").map(n => n[0]).join("")}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "30px 16px 16px" }}>
        {/* Name + rating */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", lineHeight: 1.2 }}>{trainer.name}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <Star size={13} fill="#f97316" color="#f97316" />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{trainer.rating}</span>
            <span style={{ color: "#6b7280", fontSize: 12 }}>({trainer.reviewCount})</span>
          </div>
        </div>

        {/* Specialty tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {trainer.specialty.slice(0, 2).map(s => (
            <span key={s} style={{ fontSize: 11, color: "#9ca3af", background: "#111", border: "1px solid #2a2a2a", padding: "2px 8px", borderRadius: 999 }}>
              {s}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#6b7280", marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={12} />
            <span>{trainer.experience}yr exp</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Users size={12} />
            <span>{trainer.clientsCount} clients</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CheckCircle size={12} color="#39E609" />
            <span>{trainer.sessionsCount} sessions</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 20, fontFamily: "'Outfit', sans-serif" }}>${trainer.price}</span>
            <span style={{ color: "#6b7280", fontSize: 12 }}>/session</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => toast.info(`Viewing ${trainer.name}'s profile`)}
              style={{ fontSize: 12, color: "#39E609", border: "1px solid rgba(57,230,9,0.3)", padding: "7px 14px", borderRadius: 8, background: "rgba(57,230,9,0.05)", cursor: "pointer", fontWeight: 600 }}
            >
              Profile
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => trainer.available
                ? toast.success(`Booking session with ${trainer.name}! 🎉`)
                : toast.error("Trainer is currently fully booked")
              }
              style={{
                fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                ...(trainer.available
                  ? { background: "#39E609", color: "#000", border: "none" }
                  : { background: "#1f1f1f", border: "1px solid #2a2a2a", color: "#6b7280", cursor: "not-allowed" })
              }}
            >
              {trainer.available ? "Book Session" : "Fully Booked"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TrainersPage() {
  const [activeSpec, setActiveSpec] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = mockTrainers.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialty.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchSpec = activeSpec === "All" || t.specialty.includes(activeSpec);
    return matchSearch && matchSpec;
  });

  return (
    <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "clamp(22px, 3vw, 30px)", color: "#fff", marginBottom: 4 }}>
          Find Your Perfect Trainer
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Connect with certified fitness professionals to accelerate your results</p>
      </motion.div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 480 }}>
        <Search size={16} color="#6b7280" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search trainers by name, specialty..."
          style={{
            width: "100%", background: "#1c1c1c", border: "1px solid #2a2a2a",
            borderRadius: 10, padding: "11px 14px 11px 42px",
            fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Specialty filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SPECIALTIES.map(s => (
          <motion.button
            key={s}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSpec(s)}
            style={{
              padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
              border: activeSpec === s ? "none" : "1px solid #2a2a2a",
              background: activeSpec === s ? "#39E609" : "#1c1c1c",
              color: activeSpec === s ? "#000" : "#9ca3af",
            }}
          >
            {s}
          </motion.button>
        ))}
      </div>

      {/* Results count */}
      <div style={{ color: "#4b5563", fontSize: 13 }}>
        Showing <span style={{ color: "#fff", fontWeight: 600 }}>{filtered.length}</span> trainers
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gap: 20 }} className="trainers-grid">
        {filtered.map((trainer, i) => (
          <TrainerCard key={trainer.id} trainer={trainer} index={i} />
        ))}
      </div>

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: "linear-gradient(135deg, #0f1f0f 0%, #111 100%)",
          border: "1px solid rgba(57,230,9,0.2)",
          borderRadius: 16, padding: "32px 24px", textAlign: "center",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>🏋️</div>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", marginBottom: 8 }}>Are You a Certified Trainer?</h3>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>Join our platform and grow your client base while doing what you love.</p>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => toast.success("Trainer application started! 🎉")}
          className="btn-neon"
          style={{ padding: "12px 32px", fontSize: 14, fontWeight: 700 }}
        >
          Apply Now
        </motion.button>
      </motion.div>

      <style>{`
        .trainers-grid { grid-template-columns: 1fr; }
        @media (min-width: 640px) { .trainers-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1280px) { .trainers-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </div>
  );
}
