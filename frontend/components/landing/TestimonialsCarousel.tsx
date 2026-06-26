"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    text: "GymRat Hub completely transformed my training. The structured programs and the community kept me accountable every single day. I've never been stronger.",
    author: "Jordan Mills",
    since: "Member since 2022",
    rating: 5,
    initials: "JM",
    color: "#39E609",
  },
  {
    text: "The elite trainer sessions alone are worth 3x the price. My coach customized everything perfectly. Lost 18kg in 4 months and gained real strength.",
    author: "Derek Lyons",
    since: "Member since 2021",
    rating: 5,
    initials: "DL",
    color: "#f97316",
  },
  {
    text: "Pro analytics keep me accountable. I've hit three PRs since joining. My membership upgrade is the best fitness investment I've ever made.",
    author: "Mia Castellano",
    since: "Member since 2022",
    rating: 5,
    initials: "MC",
    color: "#38bdf8",
  },
  {
    text: "Custom meal plans took the guesswork out of cutting. Finally hitting my macros consistently without obsessing over every gram.",
    author: "Tario Bello",
    since: "Member since 2023",
    rating: 5,
    initials: "TB",
    color: "#a855f7",
  },
];

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };
  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % TESTIMONIALS.length);
  };

  const t = TESTIMONIALS[index];

  return (
    <section
      style={{
        padding: "80px 24px",
        background: "#0d0d0d",
        borderTop: "1px solid #1f1f1f",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p style={{ color: "#39E609", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, textAlign: "center" }}>
          Testimonials
        </p>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 4vw, 36px)", color: "#fff", textAlign: "center", marginBottom: 40 }}>
          What Members Say
        </h2>

        {/* Stars */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 24 }}>
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} size={20} color="#f97316" fill="#f97316" />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 60 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: "center" }}
          >
            <p style={{ color: "#d1d5db", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.7, marginBottom: 32, fontStyle: "italic" }}>
              &ldquo;{t.text}&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: t.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: "#000",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {t.initials}
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>— {t.author}</p>
                <p style={{ color: "#6b7280", fontSize: 12 }}>{t.since}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 32 }}>
          <button
            onClick={prev}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#1c1c1c",
              border: "1px solid #2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#9ca3af",
              transition: "all 0.2s",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                style={{
                  width: i === index ? 24 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: i === index ? "#39E609" : "#2a2a2a",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  padding: 0,
                }}
              />
            ))}
          </div>
          <button
            onClick={next}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#1c1c1c",
              border: "1px solid #2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#9ca3af",
              transition: "all 0.2s",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
