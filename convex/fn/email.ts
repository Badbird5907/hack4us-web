import { action, internalMutation, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { syncMailrelaySubscriber } from "@/lib/mailrelay-subscriber";

export const saveSignupEmailPreferences = mutation({
  args: {
    email: v.string(),
    marketingOptIn: v.boolean(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const now = Date.now();

    const existing = await ctx.db
      .query("emailPreferences")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        marketingOptIn: args.marketingOptIn,
        updatedAt: now,
      });
      return;
    }

    await ctx.db.insert("emailPreferences", {
      email,
      marketingOptIn: args.marketingOptIn,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const markEmailPreferenceSynced = internalMutation({
  args: {
    email: v.string(),
    userId: v.string(),
    mailrelaySyncedAt: v.number(),
    marketingOptIn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    const existing = await ctx.db
      .query("emailPreferences")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        marketingOptIn:
          typeof args.marketingOptIn === "boolean"
            ? args.marketingOptIn
            : existing.marketingOptIn,
        userId: args.userId,
        mailrelaySyncedAt: args.mailrelaySyncedAt,
        updatedAt: Date.now(),
      });
      return;
    }

    await ctx.db.insert("emailPreferences", {
      email,
      marketingOptIn: args.marketingOptIn === true,
      userId: args.userId,
      mailrelaySyncedAt: args.mailrelaySyncedAt,
      createdAt: args.mailrelaySyncedAt,
      updatedAt: args.mailrelaySyncedAt,
    });
  },
});

export const syncEmailToMailrelay = action({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    marketingOptIn: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const normalizedEmail = args.email.trim().toLowerCase();
    const identityEmail = typeof identity.email === "string"
      ? identity.email.trim().toLowerCase()
      : null;

    if (identityEmail && identityEmail !== normalizedEmail) {
      throw new Error("Email mismatch");
    }

    await syncMailrelaySubscriber({
      email: normalizedEmail,
      name: args.name,
      marketingOptIn: args.marketingOptIn,
    });

    await ctx.runMutation(internal.fn.email.markEmailPreferenceSynced, {
      email: normalizedEmail,
      userId: identity.subject,
      mailrelaySyncedAt: Date.now(),
      marketingOptIn: args.marketingOptIn,
    });
  },
});
