import { Router, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import UserModel from "../models/User";
import { detectPlateaus } from "../services/plateauDetection";
import { generateCoachingNarrative } from "../services/coachingService";

const router = Router();

/**
 * GET /api/insights/plateaus
 * Structured plateau report only — cheap, deterministic, no LLM call.
 * Good for a dashboard widget that needs to render fast for every user.
 */
router.get("/insights/plateaus", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const windowDays = Number(req.query.windowDays) || undefined;
    const insights = await detectPlateaus(clerkId, windowDays);
    return res.json({ insights });
  } catch (error) {
    console.error("GET /insights/plateaus error:", error);
    return res.status(500).json({ error: "Failed to analyze training history." });
  }
});

/**
 * GET /api/insights/coach
 * Structured plateau report + a natural-language coaching note on top.
 * Slightly slower (may call an LLM) — meant for a "Coach" page/chat entry
 * point rather than a widget that renders on every page load.
 */
router.get("/insights/coach", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const windowDays = Number(req.query.windowDays) || undefined;

    const [insights, user] = await Promise.all([
      detectPlateaus(clerkId, windowDays),
      UserModel.findOne({ clerkId }).select("name").lean(),
    ]);

    const firstName = user?.name?.split(" ")[0];
    const narrative = await generateCoachingNarrative(insights, { firstName });

    return res.json({ insights, narrative });
  } catch (error) {
    console.error("GET /insights/coach error:", error);
    return res.status(500).json({ error: "Failed to generate coaching insight." });
  }
});

export default router;
