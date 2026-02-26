import { ConvexError, v } from "convex/values";
import { mutation, query } from ".";

const applicationTypeValidator = v.union(
  v.literal("attendee"),
  v.literal("mentor"),
  v.literal("volunteer")
);

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

    if (existing.status !== "draft") {
      throw new ConvexError({ code: "BAD_REQUEST", message: `Cannot save: you already have a ${existing.status} application. ` + `Please contact support if you need to make changes.` });
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

    return await ctx.db.patch(existing._id, {
      status: "submitted",
      submittedAt: Date.now(),
    });
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
