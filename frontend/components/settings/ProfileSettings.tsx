"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Save, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUser, useClerk } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import { useEffect } from "react";
import { cardStyle, sectionTitleStyle, InputField } from "./settings-ui";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function ProfileSettings() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api("/users/profile"),
    enabled: isApiReady,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
    } else if (clerkUser) {
      setName(clerkUser.fullName || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim());
    }
  }, [profile, clerkUser]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api("/users/profile", { method: "PUT", body: JSON.stringify({ name, bio, location }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setSaved(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => setSaved(false), 2000);
    },
    onError: () => toast.error("Failed to save profile."),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api("/users/account", { method: "DELETE", body: JSON.stringify({ confirm: "DELETE" }) }),
    onSuccess: async () => {
      toast.success("Account deleted.");
      await signOut({ redirectUrl: "/auth" });
    },
    onError: () => toast.error("Failed to delete account."),
  });

  const displayName = name || clerkUser?.fullName || "Athlete";
  const avatarUrl = clerkUser?.imageUrl || profile?.avatar || "";
  const displayEmail = profile?.email || clerkUser?.primaryEmailAddress?.emailAddress || "";
  const planLabel =
    profile?.plan === "elite" ? "Elite Member" : profile?.plan === "pro" ? "Pro Member" : "Free Member";

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clerkUser) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setPhotoLoading(true);
    try {
      await clerkUser.setProfileImage({ file });
      await clerkUser.reload();
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to upload photo. Try a JPG or PNG under 5 MB.");
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePasswordUpdate = async () => {
    if (!clerkUser) return;
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!clerkUser.passwordEnabled) {
      toast.error("You signed in with Google/social login. Add a password via Clerk account settings.");
      return;
    }
    setPasswordLoading(true);
    try {
      await clerkUser.updatePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not update password.";
      toast.error(msg.includes("incorrect") ? "Current password is incorrect." : msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading && isApiReady) {
    return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading profile…</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handlePhotoSelect} />

      <div style={cardStyle}>
        <p style={sectionTitleStyle}>Profile Photo</p>
        <div style={{ padding: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid #39E609" }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #39E609, #22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 28, color: "#000" }}>
                {getInitials(displayName)}
              </div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={photoLoading} style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, background: "#39E609", borderRadius: "50%", border: "2px solid #1c1c1c", display: "flex", alignItems: "center", justifyContent: "center", cursor: photoLoading ? "wait" : "pointer" }}>
              <Camera size={13} color="#000" />
            </button>
          </div>
          <div>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>{displayName}</p>
            <p style={{ color: "#6b7280", fontSize: 13 }}>{planLabel}</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={photoLoading} style={{ marginTop: 8, fontSize: 12, color: "#39E609", background: "rgba(57,230,9,0.08)", border: "1px solid rgba(57,230,9,0.25)", padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              {photoLoading ? "Uploading…" : "Change Photo"}
            </button>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <p style={sectionTitleStyle}>Personal Information</p>
        <div style={{ padding: 20 }}>
          <InputField label="Full Name" value={name} onChange={setName} placeholder="Your full name" />
          <InputField label="Email Address" value={displayEmail} onChange={() => {}} type="email" placeholder="your@email.com" disabled />
          <p style={{ color: "#6b7280", fontSize: 11, marginTop: -8, marginBottom: 16 }}>Email is managed through your sign-in provider (Clerk).</p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: "#9ca3af", fontWeight: 500, marginBottom: 6 }}>Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} placeholder="Tell others about your fitness journey..." />
          </div>
          <InputField label="Location" value={location} onChange={setLocation} placeholder="City, Country" />
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => { if (!name.trim()) { toast.error("Please enter your name."); return; } saveMutation.mutate(); }} disabled={saveMutation.isPending} className="btn-neon" style={{ padding: "11px 24px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> {saveMutation.isPending ? "Saving…" : "Save Changes"}</>}
          </motion.button>
        </div>
      </div>

      <div style={cardStyle}>
        <p style={sectionTitleStyle}>Change Password</p>
        <div style={{ padding: 20 }}>
          {!clerkUser?.passwordEnabled && (
            <p style={{ color: "#f97316", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
              Your account uses social sign-in. Password change is only available for email/password accounts.
            </p>
          )}
          <InputField label="Current Password" value={currentPassword} onChange={setCurrentPassword} type="password" placeholder="••••••••" disabled={!clerkUser?.passwordEnabled} />
          <InputField label="New Password" value={newPassword} onChange={setNewPassword} type="password" placeholder="Min. 8 characters" disabled={!clerkUser?.passwordEnabled} />
          <InputField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="••••••••" disabled={!clerkUser?.passwordEnabled} />
          <button type="button" onClick={handlePasswordUpdate} disabled={passwordLoading || !clerkUser?.passwordEnabled} style={{ fontSize: 13, color: "#39E609", background: "rgba(57,230,9,0.08)", border: "1px solid rgba(57,230,9,0.25)", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, opacity: clerkUser?.passwordEnabled ? 1 : 0.5 }}>
            {passwordLoading ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>

      <div style={{ ...cardStyle, borderColor: "rgba(239,68,68,0.2)" }}>
        <p style={{ ...sectionTitleStyle, color: "#ef4444", borderBottomColor: "rgba(239,68,68,0.15)" }}>Danger Zone</p>
        <div style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>Delete Account</p>
            <p style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>Permanently delete your account and all data.</p>
          </div>
          <button type="button" onClick={() => setShowDeleteModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            <Trash2 size={14} /> Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowDeleteModal(false)}>
          <div style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, maxWidth: 420, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#ef4444", fontWeight: 700, marginBottom: 8 }}>Delete your account?</h3>
            <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>This removes all workouts, nutrition logs, and progress. Type <strong style={{ color: "#fff" }}>DELETE</strong> to confirm.</p>
            <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="Type DELETE" style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 14px", color: "#fff", marginBottom: 16, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowDeleteModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #2a2a2a", background: "#111", color: "#9ca3af", cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={() => deleteMutation.mutate()} disabled={deleteConfirm !== "DELETE" || deleteMutation.isPending} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, cursor: deleteConfirm === "DELETE" ? "pointer" : "not-allowed", opacity: deleteConfirm === "DELETE" ? 1 : 0.5 }}>
                {deleteMutation.isPending ? "Deleting…" : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
