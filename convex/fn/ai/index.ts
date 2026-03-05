"use node";

import { v } from "convex/values";
import { internalAction } from "@convex/_generated/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";
import { getRubricForType, getRankingFields, computeWeightedTotal } from "@/lib/review/scoring";
import type { ApplicationType } from "@/lib/review/rubric";
import { internal } from "@convex/_generated/api";

const aiScoreSchema = z.object({
  scores: z.object({
    effort: z.number().int().min(1).max(5),
    motivation: z.number().int().min(1).max(5),
    communityFit: z.number().int().min(1).max(5),
  }),
  summary: z.string().max(300),
  flags: z.array(z.string()),
});

function buildSystemPrompt(type: ApplicationType): string {
  const rubric = getRubricForType(type);
  const rankingFields = getRankingFields(rubric);

  const fieldDescriptions = rankingFields
    .map(
      (f) =>
        `- ${f.id} (${f.label}): ${f.description ?? "No description"} ` +
        `[${f.scale?.min ?? 1}-${f.scale?.max ?? 5}]`,
    )
    .join("\n");

  return `You are a fair, neutral application reviewer for a beginner-friendly high school hackathon.

Your task is to score an application using the rubric below. Return structured JSON.

## Rubric Fields
${fieldDescriptions}

## Scoring Guidelines
- Score each field on the given integer scale.
- Optimize for: effort, motivation, growth mindset, community fit, engagement likelihood.
- Do NOT penalize for: poor grammar, lack of writing sophistication, low hackathon count, or absence of prestige signals.
- Be generous to beginners who show genuine enthusiasm.
- If a response is clearly low-effort (e.g., single word answers, copy-paste, gibberish), flag it.
- If a response contains inappropriate or offensive content, flag it.

## Output
- scores: integer scores for each rubric field
- summary: a 1-2 sentence neutral summary of the application's strengths
- flags: an array of short strings describing any concerns (empty if none)

Be concise. Do not explain your reasoning in the output.`;
}

function buildUserPrompt(answers: Record<string, string>): string {
  const entries = Object.entries(answers)
    .map(([key, value]) => `### ${key}\n${value}`)
    .join("\n\n");

  return `## Application Responses\n\n${entries}`;
}

export const scoreApplication = internalAction({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    const app = await ctx.runQuery(internal.fn.ai.internal.readApplication, {
      applicationId: args.applicationId,
    });

    if (!app) return;
    if (app.aiScore) return;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set, skipping AI scoring");
      return;
    }

    const openrouter = createOpenRouter({ apiKey });
    const model = openrouter("openai/gpt-5-mini", {
      plugins: [{ id: "response-healing" }],
    });

    const type = app.type as ApplicationType;

    const { object } = await generateObject({
      model,
      schema: aiScoreSchema,
      system: buildSystemPrompt(type),
      prompt: buildUserPrompt(app.answers),
    });

    const rubric = getRubricForType(type);
    const scores: Record<string, number> = {
      effort: object.scores.effort,
      motivation: object.scores.motivation,
      communityFit: object.scores.communityFit,
    };
    const total = computeWeightedTotal(scores, rubric);

    await ctx.runMutation(internal.fn.ai.internal.saveAiScore, {
      applicationId: args.applicationId,
      scores,
      total,
      summary: object.summary,
      flags: object.flags,
    });
  },
});
