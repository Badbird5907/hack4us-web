import { v } from "convex/values";

export const applicationTypeValidator = v.union(
  v.literal("attendee"),
  v.literal("mentor"),
  v.literal("volunteer"),
);
