import type { PlateauInsight } from "./plateauDetection";

/**
 * Turns structured PlateauInsight[] into a short, natural-language coaching
 * message. This is intentionally a thin, optional layer:
 *
 *  - If ANTHROPIC_API_KEY isn't configured, we fall back to a template built
 *    straight from the structured data below — the feature still fully
 *    works, it's just less conversational. Nothing in the product depends
 *    on an LLM call succeeding.
 *  - If it IS configured, we send the structured insights (never raw user
 *    PII beyond first-name-optional) and ask for a short coach-voice
 *    summary. The model explains and motivates; it does not invent the
 *    numbers — those come entirely from detectPlateaus().
 */
export async function generateCoachingNarrative(
  insights: PlateauInsight[],
  opts: { firstName?: string } = {}
): Promise<string> {
  if (insights.length === 0) {
    return opts.firstName
      ? `${opts.firstName}, everything you're tracking is trending up. No plateaus detected right now — keep the current program running.`
      : "Everything you're tracking is trending up. No plateaus detected right now — keep the current program running.";
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return templateNarrative(insights, opts.firstName);
  }

  try {
    const top = insights.slice(0, 3);
    const prompt = [
      "You are a knowledgeable, encouraging strength coach.",
      "Given this structured plateau analysis (already computed, do not recalculate or contradict the numbers), write a short 3-5 sentence coaching note.",
      "Be specific, reference the exercises by name, and end with one clear next action.",
      "Do not invent data that isn't in the JSON below.",
      "",
      JSON.stringify(top, null, 2),
    ].join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error("Coaching narrative API error:", response.status, await response.text());
      return templateNarrative(insights, opts.firstName);
    }

    const data = (await response.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? [])
      .map((block: { type: string; text?: string }) => (block.type === "text" ? block.text : ""))
      .filter(Boolean)
      .join("\n")
      .trim();

    return text || templateNarrative(insights, opts.firstName);
  } catch (error) {
    console.error("Coaching narrative generation failed:", error);
    return templateNarrative(insights, opts.firstName);
  }
}

function templateNarrative(insights: PlateauInsight[], firstName?: string): string {
  const worst = insights[0];
  const greeting = firstName ? `${firstName}, ` : "";
  const plural = insights.length > 1 ? ` (and ${insights.length - 1} other lift${insights.length > 2 ? "s" : ""})` : "";

  return (
    `${greeting}your ${worst.exerciseName}${plural} ${
      worst.type === "regressing" ? "has dropped" : "has plateaued"
    } over the last ${worst.windowDays} days (${worst.percentChange}% change across ${worst.sessionsAnalyzed} sessions). ` +
    `${worst.recommendation.detail}`
  );
}
