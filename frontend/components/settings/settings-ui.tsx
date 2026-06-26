export const cardStyle: React.CSSProperties = {
  background: "#1c1c1c",
  border: "1px solid #2a2a2a",
  borderRadius: 12,
  overflow: "hidden",
};

export const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 600,
  fontSize: 16,
  color: "#fff",
  padding: "16px 20px",
  borderBottom: "1px solid #2a2a2a",
  margin: 0,
};

export function SettingsRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #1f1f1f", gap: 16, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ color: "#fff", fontSize: 14, fontWeight: 500, margin: 0 }}>{label}</p>
        {description && <p style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{description}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export function ToggleSwitch({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={() => !disabled && onChange(!value)} disabled={disabled} style={{ width: 44, height: 24, borderRadius: 999, background: value ? "#39E609" : "#2a2a2a", border: "none", cursor: disabled ? "not-allowed" : "pointer", padding: 2, display: "flex", alignItems: "center", opacity: disabled ? 0.5 : 1 }} role="switch" aria-checked={value}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", transform: value ? "translateX(20px)" : "translateX(0)", transition: "transform 0.2s" }} />
    </button>
  );
}

export function InputField({ label, value, onChange, type = "text", placeholder, disabled }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, color: "#9ca3af", fontWeight: 500, marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={{ width: "100%", background: disabled ? "#151515" : "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: disabled ? "#6b7280" : "#fff", outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}
