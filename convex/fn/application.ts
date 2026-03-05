import { ConvexError, v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { mutation, query } from ".";
import { applicationTypeValidator } from "../shared";

async function assertApplicationsOpen(ctx: MutationCtx | QueryCtx) {
  const settings = await ctx.db
    .query("siteSettings")
    .withIndex("key", (q) => q.eq("key", "global"))
    .first();

  if ((settings?.applicationsState ?? "open") !== "open") {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Applications are not accepting submissions right now.",
    });
  }
}

export const getMyApplication = query({
  args: {},
  handler: async (ctx) => {
    const application = await ctx.db
      .query("application")
      .withIndex("userId", (q) => q.eq("userId", ctx.userId))
      .first();

    const profile = await ctx.db
      .query("userProfile")
      .withIndex("userId", (q) => q.eq("userId", ctx.userId))
      .first();

    return {
      application,
      profileRole: profile?.role ?? null,
    };
  },
});

export const saveMyApplication = mutation({
  args: {
    type: applicationTypeValidator,
    answers: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    await assertApplicationsOpen(ctx);

    const existing = await ctx.db
      .query("application")
      .withIndex("userId", (q) => q.eq("userId", ctx.userId))
      .first();

    if (!existing) {
      return await ctx.db.insert("application", {
        userId: ctx.userId,
        type: args.type,
        status: "draft",
        answers: args.answers,
      });
    }

    if (existing.status === "submitted") {
      throw new ConvexError({ code: "BAD_REQUEST", message: `Cannot save: you already have a ${existing.status} application. ` + `Please contact us if you need to make changes.` });
    }

    if (existing.type !== args.type) {
      await ctx.db.delete(existing._id);
      return await ctx.db.insert("application", {
        userId: ctx.userId,
        type: args.type,
        status: "draft",
        answers: args.answers,
      });
    }

    const mergedAnswers = { ...existing.answers, ...args.answers };
    return await ctx.db.patch(existing._id, { answers: mergedAnswers });
  },
});

// Full question-level validation is performed on the frontend since question
// configs contain React components that cannot be imported into the Convex backend.
export const submitMyApplication = mutation({
  args: {},
  handler: async (ctx) => {
    await assertApplicationsOpen(ctx);

    const existing = await ctx.db
      .query("application")
      .withIndex("userId", (q) => q.eq("userId", ctx.userId))
      .first();

    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "No application found. Please save your application first." });
    }

    if (existing.status !== "draft") {
      throw new ConvexError({ code: "BAD_REQUEST", message: `Application has already been ${existing.status}. Cannot submit again.` });
    }

    if (Object.keys(existing.answers).length === 0) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Cannot submit an empty application." });
    }

    await ctx.db.patch(existing._id, {
      status: "submitted",
      submittedAt: Date.now(),
    });

    if (process.env.ENABLE_AI_PRESCORE === "true") {
      await ctx.scheduler.runAfter(0, internal.fn.ai.index.scoreApplication, {
        applicationId: existing._id,
      });
    }
  },
});

export const deleteMyDraftApplication = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("application")
      .withIndex("userId", (q) => q.eq("userId", ctx.userId))
      .first();

    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "No application found." });
    }

    if (existing.status !== "draft") {
      throw new ConvexError({ code: "BAD_REQUEST", message: `Cannot delete a ${existing.status} application. Only drafts can be deleted.` });
    }

    return await ctx.db.delete(existing._id);
  },
  
});
