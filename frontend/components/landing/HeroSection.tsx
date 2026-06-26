"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "#0a0a0a",
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Gradient overlays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(10,10,10,0.97) 40%, rgba(10,10,10,0.6) 70%, rgba(10,10,10,0.2) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(10,10,10,1) 0%, transparent 40%)",
        }}
      />

      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(rgba(57,230,9,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(57,230,9,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "100px 24px 60px",
        }}
      >
        <div style={{ maxWidth: 620 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(57,230,9,0.1)",
              border: "1px solid rgba(57,230,9,0.3)",
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: 12,
              fontWeight: 600,
              color: "#39E609",
              marginBottom: 24,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "#39E609",
                borderRadius: "50%",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            Built for Serious Athletes
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(48px, 8vw, 88px)",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "#fff",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            UNLEASH YOUR
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #39E609, #22c55e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              INNER BEAST
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{
              color: "#9ca3af",
              fontSize: "clamp(16px, 2.5vw, 20px)",
              lineHeight: 1.6,
              marginBottom: 36,
              maxWidth: 480,
            }}
          >
            Train harder. Recover smarter. Dominate every rep.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 40 }}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#39E609",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "14px 28px",
                  borderRadius: 10,
                  textDecoration: "none",
                  boxShadow: "0 0 24px rgba(57,230,9,0.4)",
                  transition: "all 0.2s",
                }}
              >
                🚀 Start Training
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/community"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: 15,
                  padding: "14px 28px",
                  borderRadius: 10,
                  textDecoration: "none",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.2s",
                }}
              >
                <Users size={16} />
                Join Community
              </Link>
            </motion.div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div style={{ display: "flex" }}>
              {["A", "B", "C", "D"].map((l, i) => (
                <div
                  key={l}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "2px solid #0a0a0a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    marginLeft: i > 0 ? -10 : 0,
                    background: ["#39E609", "#f97316", "#38bdf8", "#a855f7"][i],
                    color: "#000",
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <p style={{ color: "#9ca3af", fontSize: 14 }}>
              <span style={{ color: "#fff", fontWeight: 600 }}>128K+ athletes</span> already training
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.15em" }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: 2,
            height: 32,
            background: "linear-gradient(to bottom, #39E609, transparent)",
            borderRadius: 999,
          }}
        />
      </motion.div>
    </section>
  );
}
