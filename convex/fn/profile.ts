import { v } from "convex/values";
import { mutation, query } from ".";

export const updateMyProfile = mutation({
  args: {
    role: v.optional(v.union(v.literal("attendee"), v.literal("mentor"), v.literal("volunteer"), v.literal("organizer"))),
    educationLevel: v.optional(v.union(v.literal("high_school"), v.literal("university"))),
    birthdate: v.optional(v.string()),
    school: v.optional(v.string()),
    year: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),
    links: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        twitter: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        github: v.optional(v.string()),
        external: v.array(v.string()),
      })
    ),
    completedOnboarding: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updates = Object.fromEntries(
      Object.entries(args).filter(([_, v]) => v !== undefined)
    );

    const existing = await ctx.db
      .query("userProfile")
      .withIndex("userId", (q) => q.eq("userId", ctx.userId))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, updates);
    }

    return await ctx.db.insert("userProfile", {
      userId: ctx.userId,
      role: args.role || "attendee",
      completedOnboarding: args.completedOnboarding || false,
      ...updates,
    });
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const profile = await ctx.db
      .query("userProfile")
      .withIndex("userId", (q) => q.eq("userId", ctx.userId))
      .first();
    return { data: profile };
  },
});
