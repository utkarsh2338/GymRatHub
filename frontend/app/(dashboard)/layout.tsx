import Sidebar from "@/components/layout/Sidebar";
import { BotMessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#0a0a0a",
        width: "100%",
      }}
    >
      <Sidebar />
      <main
        className="dashboard-main"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          minWidth: 0,
          position: "relative",
        }}
      >
        {/* AI FAB */}
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 50,
          }}
        >
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#1c1c1c",
              border: "1px solid #2a2a2a",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              padding: "10px 18px",
              borderRadius: 999,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <BotMessageSquare size={16} color="#39E609" />
            Ask CyroBot AI →
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
