"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setEmail("");
    toast.success("You're in! 🎉 Check your inbox for your free workouts.");
  };

  return (
    <section
      style={{
        padding: "64px 24px",
        background: "#0a0a0a",
        borderTop: "1px solid #1f1f1f",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            background: "#111111",
            border: "1px solid #2a2a2a",
            borderRadius: 20,
            padding: "clamp(32px, 5vw, 56px)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(22px, 3vw, 32px)",
                color: "#fff",
                marginBottom: 8,
              }}
            >
              Join 128,000+ Athletes
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14 }}>
              Get Free Workouts &amp; Tips delivered straight to your inbox.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", flex: 1, minWidth: 280, maxWidth: 480 }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                flex: 1,
                minWidth: 200,
                background: "#1c1c1c",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 14,
                color: "#fff",
                outline: "none",
              }}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="btn-neon"
              style={{
                padding: "10px 20px",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid rgba(0,0,0,0.3)",
                    borderTopColor: "#000",
                    display: "inline-block",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
              ) : (
                <Send size={15} />
              )}
              Subscribe
            </motion.button>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
