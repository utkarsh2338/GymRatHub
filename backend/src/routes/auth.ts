import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import axios from "axios";
import UserModel from "../models/User";
import { FRESH_USER_STATS } from "../constants/freshUser";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, goal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields (name, email, password)." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate custom clerkId (to maintain schema compatibility)
    const customClerkId = `usr_${new mongoose.Types.ObjectId().toString()}`;

    // Map goal to fitnessGoal enum
    let fitnessGoal = "build_muscle";
    if (goal === "lose_weight" || goal === "build_muscle" || goal === "improve_endurance" || goal === "stay_active") {
      fitnessGoal = goal;
    }

    const defaultStats = { ...FRESH_USER_STATS };

    const newUser = new UserModel({
      clerkId: customClerkId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      fitnessGoal,
      stats: defaultStats,
      plan: "free",
      targetConfigured: true, // Auto configure targets for custom signups
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign({ userId: customClerkId }, JWT_SECRET, { expiresIn: "7d" });

    // Strip password select option
    const userResponse = newUser.toObject();
    delete userResponse.password;

    console.log(`Registered user: ${newUser.email} with clerkId: ${customClerkId}`);

    return res.status(201).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Registration failed. Internal server error." });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Retrieve user including the password field
    const user = await UserModel.findOne({ email: normalizedEmail }).select("+password");
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.clerkId }, JWT_SECRET, { expiresIn: "7d" });

    // Strip password from returned object
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log(`Logged in user: ${user.email}`);

    return res.json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed. Internal server error." });
  }
});

// POST /api/auth/google
router.post("/google", async (req: Request, res: Response) => {
  try {
    const { token, goal } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Missing Google access token." });
    }

    // Fetch user details from Google
    let googleUser;
    try {
      const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      googleUser = googleRes.data;
    } catch (err: any) {
      console.error("Google token verification failed:", err.response?.data || err.message);
      return res.status(401).json({ error: "Unauthorized: Invalid Google token." });
    }

    const { sub, email, name, picture } = googleUser;

    if (!email) {
      return res.status(400).json({ error: "Google account does not provide an email address." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await UserModel.findOne({ email: normalizedEmail });

    if (user) {
      // User exists - update avatar/name if missing
      let modified = false;
      if (!user.avatar && picture) {
        user.avatar = picture;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
      console.log(`Google login: found existing user: ${user.email} (clerkId: ${user.clerkId})`);
    } else {
      // User doesn't exist - register them
      const customClerkId = `google_${sub}`;

      // Map goal
      let fitnessGoal = "build_muscle";
      if (goal === "lose_weight" || goal === "build_muscle" || goal === "improve_endurance" || goal === "stay_active") {
        fitnessGoal = goal;
      }

      const defaultStats = { ...FRESH_USER_STATS };

      user = new UserModel({
        clerkId: customClerkId,
        name: name || "Google User",
        email: normalizedEmail,
        fitnessGoal,
        stats: defaultStats,
        avatar: picture || "",
        plan: "free",
        targetConfigured: true,
      });

      await user.save();
      console.log(`Google login: registered new user: ${user.email} with clerkId: ${customClerkId}`);
    }

    // Generate JWT
    const jwtToken = jwt.sign({ userId: user.clerkId }, JWT_SECRET, { expiresIn: "7d" });

    // Strip password select option
    const userResponse = user.toObject();
    if ('password' in userResponse) {
      delete userResponse.password;
    }

    return res.status(200).json({
      token: jwtToken,
      user: userResponse,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({ error: "Google authentication failed. Internal server error." });
  }
});

export default router;
