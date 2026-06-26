"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Dumbbell } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Workouts", href: "/workouts" },
  { label: "Nutrition", href: "/nutrition" },
  { label: "Progress", href: "/progress" },
  { label: "Community", href: "/community" },
  { label: "Trainers", href: "/trainers" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: "all 0.3s ease",
          background: scrolled ? "rgba(10,10,10,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid #1f1f1f" : "none",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                style={{
                  width: 36,
                  height: 36,
                  background: "#39E609",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Dumbbell size={20} color="#000" strokeWidth={2.5} />
              </motion.div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, lineHeight: 1 }}>
                <span style={{ color: "#fff" }}>GymRat</span>
                <span style={{ color: "#39E609" }}>Hub</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden-mobile">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      position: "relative",
                      padding: "8px 12px",
                      fontSize: 14,
                      fontWeight: 500,
                      color: isActive ? "#39E609" : "#9ca3af",
                      textDecoration: "none",
                      borderRadius: 6,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.target as HTMLElement).style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.target as HTMLElement).style.color = "#9ca3af";
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 12,
                          right: 12,
                          height: 2,
                          background: "#39E609",
                          borderRadius: 999,
                        }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTAs */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="hidden-mobile">
              <Link
                href="/auth"
                style={{ fontSize: 14, fontWeight: 500, color: "#d1d5db", textDecoration: "none", padding: "6px 12px" }}
              >
                Login
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  className="btn-neon"
                  style={{ fontSize: 14, padding: "8px 20px", display: "inline-block", textDecoration: "none" }}
                >
                  Get Started
                </Link>
              </motion.div>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                padding: 8,
                display: "none",
              }}
              className="show-mobile"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: 64,
              left: 0,
              right: 0,
              zIndex: 40,
              background: "#0d0d0d",
              borderBottom: "1px solid #2a2a2a",
              padding: "16px",
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                    marginBottom: 4,
                    background: pathname === link.href ? "rgba(57,230,9,0.1)" : "transparent",
                    color: pathname === link.href ? "#39E609" : "#9ca3af",
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "1px solid #2a2a2a",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#d1d5db",
                  textDecoration: "none",
                }}
              >
                Login
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="btn-neon"
                style={{ display: "block", textAlign: "center", padding: "10px 16px", fontSize: 14, textDecoration: "none" }}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 768px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
