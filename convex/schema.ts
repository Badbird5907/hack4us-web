import { defineSchema,defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userProfile: defineTable({
    userId: v.string(),
    role: v.union(v.literal("attendee"), v.literal("mentor"), v.literal("volunteer"), v.literal("organizer")),
    educationLevel: v.optional(v.union(v.literal("high_school"), v.literal("university"))),
    birthdate: v.optional(v.string()),
    school: v.optional(v.string()),
    year: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),
    completedOnboarding: v.boolean(),
    links: v.optional(v.object({
      instagram: v.optional(v.string()),
      twitter: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      external: v.array(v.string()),
    })),
  }).index("userId", ["userId"]),

  application: defineTable({
    userId: v.string(),
    type: v.union(v.literal("attendee"), v.literal("mentor"), v.literal("volunteer")),
    status: v.union(v.literal("draft"), v.literal("submitted"), v.literal("accepted"), v.literal("rejected")),
    answers: v.record(v.string(), v.string()),
    submittedAt: v.optional(v.number()),
  })
    .index("userId", ["userId"])
    .index("userId_status", ["userId", "status"]),
})