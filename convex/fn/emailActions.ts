import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { emailWorkpool } from "../workpools";

export const enqueueEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await emailWorkpool.enqueueAction(ctx, internal.fn.emailWorker.sendSmtpEmail, args);
  },
});
