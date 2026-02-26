import { query } from ".";

export const getApplicationStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const profile = await ctx.db.query("userProfile").withIndex("userId", (q) => q.eq("userId", ctx.userId)).first();
    if (!profile) {
      return { profileCompleted: false };
    }
    return {  };
  },
})