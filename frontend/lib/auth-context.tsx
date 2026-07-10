"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface UserInfo {
  id: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  emailAddress: string;
  primaryEmailAddress: { emailAddress: string };
  passwordEnabled: boolean;
  setProfileImage: (options: { file: File }) => Promise<void>;
  reload: () => Promise<void>;
  updatePassword: (options: { currentPassword?: string; newPassword?: string }) => Promise<void>;
}

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  token: string | null;
  user: UserInfo | null;
  getToken: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, goal: string) => Promise<boolean>;
  loginWithGoogle: (accessToken: string, goal: string) => Promise<boolean>;
  signOut: (options?: { redirectUrl?: string }) => Promise<void>;
  openUserProfile: (options?: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:5000/api" : "");
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  const mapUserResponse = (userData: any): UserInfo => {
    const names = (userData.name || "Athlete").split(" ");
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ") || "";
    const isGoogleUser = userData.clerkId?.startsWith("google_");

    return {
      id: userData.clerkId || userData._id,
      fullName: userData.name,
      firstName,
      lastName,
      imageUrl: userData.avatar || null,
      emailAddress: userData.email || "",
      primaryEmailAddress: { emailAddress: userData.email || "" },
      passwordEnabled: !isGoogleUser,
      setProfileImage: async ({ file }) => {
        toast.info("Profile image update is mocked in development mode.");
      },
      reload: async () => {},
      updatePassword: async () => {
        toast.info("Password updates are mocked in development mode.");
      }
    };
  };

  useEffect(() => {
    // Load auth info from localStorage on mount
    try {
      const storedToken = localStorage.getItem("gymrat_token");
      const storedUserJson = localStorage.getItem("gymrat_user");

      if (storedToken && storedUserJson) {
        const storedUser = JSON.parse(storedUserJson);
        setToken(storedToken);
        setUser(mapUserResponse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse stored user:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const getToken = async () => {
    return token;
  };

  const setAuthCookie = (authToken: string) => {
    document.cookie = `token=${authToken}; path=/; max-age=604800; SameSite=Lax; ${
      process.env.NODE_ENV === "production" ? "Secure" : ""
    }`;
  };

  const removeAuthCookie = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("gymrat_token", data.token);
      localStorage.setItem("gymrat_user", JSON.stringify(data.user));
      setAuthCookie(data.token);

      setToken(data.token);
      setUser(mapUserResponse(data.user));

      return true;
    } catch (err: any) {
      console.error("Login request error:", err);
      toast.error(err.message || "Invalid email or password");
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, goal: string): Promise<boolean> => {
    try {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, goal }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await res.json();
      localStorage.setItem("gymrat_token", data.token);
      localStorage.setItem("gymrat_user", JSON.stringify(data.user));
      setAuthCookie(data.token);

      setToken(data.token);
      setUser(mapUserResponse(data.user));

      return true;
    } catch (err: any) {
      console.error("Signup request error:", err);
      toast.error(err.message || "Registration failed. Please try again.");
      return false;
    }
  };

  const loginWithGoogle = async (accessToken: string, goal: string): Promise<boolean> => {
    try {
      const res = await fetch(`${baseUrl}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: accessToken, goal }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Google login failed");
      }

      const data = await res.json();
      localStorage.setItem("gymrat_token", data.token);
      localStorage.setItem("gymrat_user", JSON.stringify(data.user));
      setAuthCookie(data.token);

      setToken(data.token);
      setUser(mapUserResponse(data.user));

      return true;
    } catch (err: any) {
      console.error("Google login request error:", err);
      toast.error(err.message || "Google authentication failed. Please try again.");
      return false;
    }
  };

  const signOut = async (options?: { redirectUrl?: string }) => {
    localStorage.removeItem("gymrat_token");
    localStorage.removeItem("gymrat_user");
    localStorage.removeItem("gymrat_signup_goal");
    removeAuthCookie();
    setToken(null);
    setUser(null);
    window.location.replace(options?.redirectUrl || "/auth");
  };

  const openUserProfile = (options?: any) => {
    toast.info("Profile settings are managed locally in development mode.");
  };

  const value: AuthContextType = {
    isLoaded,
    isSignedIn: !!token,
    token,
    user,
    getToken,
    login,
    signup,
    loginWithGoogle,
    signOut,
    openUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return {
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
    getToken: context.getToken,
  };
}

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return {
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
    user: context.user,
  };
}

export function useClerk() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useClerk must be used within an AuthProvider");
  }
  return {
    signOut: context.signOut,
    openUserProfile: context.openUserProfile,
    login: context.login,
    signup: context.signup,
    loginWithGoogle: context.loginWithGoogle,
  };
}
