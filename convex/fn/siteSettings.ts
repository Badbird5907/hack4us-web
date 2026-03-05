import { v } from "convex/values";
import { query, mutationWithPermission, queryWithPermission } from ".";

const SETTINGS_KEY = "global" as const;
const applicationsStateValidator = v.union(
  v.literal("open"),
  v.literal("closed"),
  v.literal("ended"),
);

const adminSiteSettingsQuery = queryWithPermission({ siteSettings: ["manage"] });
const adminSiteSettingsMutation = mutationWithPermission({ siteSettings: ["manage"] });

export const getAdminSiteSettings = adminSiteSettingsQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("key", (q) => q.eq("key", SETTINGS_KEY))
      .first();

    return {
      applicationsState: settings?.applicationsState ?? "open",
      updatedAt: settings?.updatedAt ?? null,
      updatedBy: settings?.updatedBy ?? null,
    };
  },
});

export const setApplicationsState = adminSiteSettingsMutation({
  args: { state: applicationsStateValidator },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("key", (q) => q.eq("key", SETTINGS_KEY))
      .first();

    const patch = {
      applicationsState: args.state,
      updatedAt: Date.now(),
      updatedBy: ctx.userId,
    };

    if (settings) {
      await ctx.db.patch(settings._id, patch);
      return;
    }

    await ctx.db.insert("siteSettings", {
      key: SETTINGS_KEY,
      ...patch,
    });
  },
});

export const isApplicationsOpen = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("key", (q) => q.eq("key", SETTINGS_KEY))
      .first();

    return (settings?.applicationsState ?? "open") === "open";
  },
});

export const getApplicationsState = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("key", (q) => q.eq("key", SETTINGS_KEY))
      .first();

    return settings?.applicationsState ?? "open";
  },
});
