"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global critical error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: 24,
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "rgba(25, 25, 25, 0.4)",
            border: "1px solid rgba(248, 113, 113, 0.25)",
            borderRadius: 20,
            padding: "48px 32px",
            maxWidth: 480,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(248, 113, 113, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              color: "#f87171",
            }}
          >
            <AlertTriangle size={32} />
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            A Critical Error Occurred
          </h2>

          <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: "1.6", marginBottom: 32 }}>
            We encountered a fatal application error. Please attempt a full reload of the application.
          </p>

          <button
            onClick={() => reset()}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#39E609",
              border: "none",
              color: "#000",
              fontSize: 14,
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={16} />
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
