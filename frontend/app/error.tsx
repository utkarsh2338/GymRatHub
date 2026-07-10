"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client error caught by ErrorBoundary:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "var(--font-outfit), sans-serif",
        padding: 24,
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "rgba(25, 25, 25, 0.4)",
          backdropFilter: "blur(12px)",
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

        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 12,
            color: "#fff",
          }}
        >
          Something Went Wrong
        </h2>

        <p
          style={{
            color: "#9ca3af",
            fontSize: 14,
            lineHeight: "1.6",
            marginBottom: 32,
          }}
        >
          An unexpected error occurred in this section of the app. Please try reloading or returning to the dashboard.
        </p>

        <div style={{ display: "flex", gap: 16, width: "100%" }}>
          <button
            onClick={() => reset()}
            style={{
              flex: 1,
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
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <RotateCcw size={16} />
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = "/dashboard")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#1c1c1c",
              border: "1px solid #2a2a2a",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: 10,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1c1c1c")}
          >
            <Home size={16} />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
