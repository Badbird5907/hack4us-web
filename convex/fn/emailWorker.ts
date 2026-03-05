"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { sendEmail } from "../../src/lib/email/smtp";

export const sendSmtpEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    await sendEmail(args);
  },
});
