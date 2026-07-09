"use client";

import { useState, useEffect } from "react";
import { useAuth, useClerk } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Dumbbell, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import OAuthButtons from "@/components/auth/OAuthButtons";
import { AUTH_SUCCESS_PATH } from "@/lib/auth-redirect";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  goal: z.enum(["lose_weight", "build_muscle", "improve_endurance"]),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

const GOALS = [
  { value: "lose_weight", label: "Lose Weight" },
  { value: "build_muscle", label: "Build Muscle" },
  { value: "improve_endurance", label: "Improve Endurance" },
] as const;

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 10,
  padding: "12px 16px",
  fontSize: 14,
  color: "#fff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useClerk();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ 
    resolver: zodResolver(loginSchema) 
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success("Welcome back! 🎉");
        window.location.replace(AUTH_SUCCESS_PATH);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 26, color: "#fff", marginBottom: 6 }}>Welcome Back</h2>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Sign in to continue your fitness journey</p>
      </div>

      <OAuthButtons mode="sign-in" />

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
        <span style={{ color: "#4b5563", fontSize: 12 }}>or continue with email</span>
        <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#9ca3af", fontWeight: 500, marginBottom: 6 }}>Email</label>
          <input {...register("email")} type="email" placeholder="you@gymrathub.com" style={inputStyle} />
          {errors.email && <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, color: "#9ca3af", fontWeight: 500, marginBottom: 6 }}>Password</label>
          <div style={{ position: "relative" }}>
            <input {...register("password")} type={showPass ? "text" : "password"} placeholder="Enter your password" style={{ ...inputStyle, paddingRight: 44 }} />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer", display: "flex" }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" style={{ accentColor: "#39E609" }} />
              <span style={{ color: "#6b7280", fontSize: 12 }}>Remember me</span>
            </label>
            <button type="button" style={{ background: "none", border: "none", color: "#39E609", fontSize: 12, cursor: "pointer" }}>
              Forgot Password?
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="btn-neon"
          style={{ width: "100%", padding: "13px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.8 : 1 }}
        >
          {loading && <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", display: "inline-block", animation: "auth-spin 0.6s linear infinite" }} />}
          Sign In
        </motion.button>
      </form>

      <p style={{ textAlign: "center", color: "#6b7280", fontSize: 14 }}>
        Don&apos;t have an account?{" "}
        <button onClick={onSwitch} style={{ background: "none", border: "none", color: "#39E609", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
          Sign Up
        </button>
      </p>
    </div>
  );
}

function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  const [loading, setLoading] = useState(false);
  const { signup } = useClerk();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { goal: "build_muscle" },
  });
  const selectedGoal = watch("goal");

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      const success = await signup(data.name, data.email, data.password, data.goal);
      if (success) {
        localStorage.setItem("gymrat_signup_goal", selectedGoal);
        toast.success("Account created! Welcome to GymRat Hub 🎉");
        window.location.replace(AUTH_SUCCESS_PATH);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 26, color: "#fff", marginBottom: 6 }}>Create Account</h2>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Start your fitness journey today</p>
      </div>

      <OAuthButtons
        mode="sign-up"
        onBeforeRedirect={() => localStorage.setItem("gymrat_signup_goal", selectedGoal)}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
        <span style={{ color: "#4b5563", fontSize: 12 }}>or continue with email</span>
        <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="auth-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <input {...register("name")} placeholder="Full Name" style={inputStyle} />
            {errors.name && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors.name.message}</p>}
          </div>
          <div>
            <input {...register("email")} type="email" placeholder="Email address" style={inputStyle} />
            {errors.email && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors.email.message}</p>}
          </div>
        </div>

        <div className="auth-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <input {...register("password")} type="password" placeholder="Password" style={inputStyle} />
            {errors.password && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors.password.message}</p>}
          </div>
          <div>
            <input {...register("confirmPassword")} type="password" placeholder="Confirm password" style={inputStyle} />
            {errors.confirmPassword && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, marginBottom: 10 }}>Your Primary Goal</p>
          <div className="auth-goal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            {GOALS.map((g) => (
              <label key={g.value} style={{ cursor: "pointer" }}>
                <input {...register("goal")} type="radio" value={g.value} style={{ position: "absolute", opacity: 0, width: 0 }} />
                <div style={{
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "10px 8px",
                  borderRadius: 10,
                  border: `1px solid ${selectedGoal === g.value ? "#39E609" : "#2a2a2a"}`,
                  background: selectedGoal === g.value ? "rgba(57,230,9,0.1)" : "transparent",
                  color: selectedGoal === g.value ? "#39E609" : "#6b7280",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}>
                  {g.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="btn-neon"
          style={{ width: "100%", padding: "13px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.8 : 1 }}
        >
          {loading && <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", display: "inline-block", animation: "auth-spin 0.6s linear infinite" }} />}
          Create Account
        </motion.button>
      </form>

      <p style={{ textAlign: "center", color: "#6b7280", fontSize: 14 }}>
        Already have an account?{" "}
        <button onClick={onSwitch} style={{ background: "none", border: "none", color: "#39E609", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
          Sign In
        </button>
      </p>
    </div>
  );
}

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const { isLoaded, isSignedIn } = useAuth();

  // Already signed in — go to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.replace(AUTH_SUCCESS_PATH);
    }
  }, [isLoaded, isSignedIn]);

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", display: "flex" }}>
      {/* Left panel — hero */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }} className="auth-left-panel">
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.5) 60%, rgba(10,10,10,0.1) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,10,0.95) 0%, transparent 50%)" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 10, padding: 32, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, background: "#39E609", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={22} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22 }}>
            <span style={{ color: "#fff" }}>GymRat</span>
            <span style={{ color: "#39E609" }}>Hub</span>
          </span>
        </div>

        {/* Hero text */}
        <div style={{ position: "relative", zIndex: 10, padding: "0 48px 56px" }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(36px, 4vw, 56px)",
              lineHeight: 1.05,
              color: "#fff",
              marginBottom: 20,
            }}
          >
            Every<span style={{ color: "#39E609" }}>Rep</span>Counts.
            <br />
            Every<span style={{ color: "#38bdf8" }}>Day</span>Matters.
          </motion.h1>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {["10,000+ Workouts", "Expert Trainer Network", "Real-Time Progress Tracking"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <CheckCircle size={16} color="#39E609" />
                <span style={{ color: "#d1d5db", fontSize: 15 }}>{item}</span>
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {["A", "B", "C", "D"].map((l, i) => (
                <div key={l} style={{
                  width: 34, height: 34, borderRadius: "50%",
                  border: "2px solid #0a0a0a",
                  marginLeft: i > 0 ? -10 : 0,
                  background: ["#39E609", "#f97316", "#38bdf8", "#a855f7"][i],
                  color: "#000",
                  fontWeight: 700,
                  fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{l}</div>
              ))}
            </div>
            <span style={{ color: "#9ca3af", fontSize: 14 }}>128K+ athletes already training</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: "100%",
        maxWidth: 560,
        minWidth: 420,
        background: "#0d0d0d",
        borderLeft: "1px solid #1f1f1f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 32px",
        overflowY: "auto",
      }} className="auth-right-panel">
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", background: "#111", padding: 4, borderRadius: 12, marginBottom: 28 }}>
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.2s",
                  background: tab === t ? "#1c1c1c" : "transparent",
                  color: tab === t ? "#fff" : "#6b7280",
                }}
              >
                {t === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <LoginForm onSwitch={() => setTab("signup")} />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <SignupForm onSwitch={() => setTab("login")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        @media (max-width: 1023px) {
          .auth-left-panel { display: none !important; }
          .auth-right-panel { max-width: 100% !important; min-width: 0 !important; }
        }
        @media (max-width: 520px) {
          .auth-right-panel { padding: 28px 18px !important; }
          .auth-form-grid { grid-template-columns: 1fr !important; }
          .auth-goal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
