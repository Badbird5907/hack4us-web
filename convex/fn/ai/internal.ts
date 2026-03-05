import { internalMutation,internalQuery } from "@convex/_generated/server";
import { v } from "convex/values";

export const readApplication = internalQuery({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app || app.status !== "submitted") return null;
    return {
      type: app.type,
      answers: app.answers,
      aiScore: app.aiScore ?? null,
    };
  },
});

export const saveAiScore = internalMutation({
  args: {
    applicationId: v.id("application"),
    scores: v.record(v.string(), v.number()),
    total: v.number(),
    summary: v.string(),
    flags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.applicationId, {
      aiScore: {
        scores: args.scores,
        total: args.total,
        summary: args.summary,
        flags: args.flags,
      },
    });
  },
});
