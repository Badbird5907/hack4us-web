import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { applicationTypeValidator } from "./shared";

export default defineSchema({
  userProfile: defineTable({
    userId: v.string(),
    role: v.union(
      v.literal("attendee"),
      v.literal("mentor"),
      v.literal("volunteer"),
      v.literal("organizer"),
    ),
    educationLevel: v.optional(
      v.union(v.literal("high_school"), v.literal("university")),
    ),
    marketingOptIn: v.optional(v.boolean()),
    birthdate: v.optional(v.string()),
    school: v.optional(v.string()),
    year: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),
    completedOnboarding: v.boolean(),
    links: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        twitter: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        github: v.optional(v.string()),
        external: v.array(v.string()),
      }),
    ),
  }).index("userId", ["userId"]),

  application: defineTable({
    userId: v.string(),
    type: applicationTypeValidator,
    status: v.union(v.literal("draft"), v.literal("submitted")),
    answers: v.record(v.string(), v.string()),
    submittedAt: v.optional(v.number()),

    decision: v.optional(
      v.object({
        status: v.union(
          v.literal("accepted"),
          v.literal("rejected"),
          v.literal("waitlist"),
        ),
        at: v.optional(v.number()),
        by: v.optional(v.string()),
      }),
    ),
    bypassDecision: v.optional(v.boolean()),

    aiScore: v.optional(
      v.object({
        scores: v.record(v.string(), v.number()),
        total: v.number(),
        summary: v.string(),
        flags: v.array(v.string()),
      }),
    ),

    lockedBy: v.optional(v.string()),
    lockedAt: v.optional(v.number()),
  })
    .index("userId", ["userId"])
    .index("userId_status", ["userId", "status"])
    .index("type_status", ["type", "status"]),

  applicationComments: defineTable({
    applicationId: v.id("application"),
    content: v.string(),
    authorId: v.string(),
    createdAt: v.number(),
  }).index("applicationId", ["applicationId"]),

  review: defineTable({
    applicationId: v.id("application"),
    reviewerId: v.string(),
    scores: v.record(v.string(), v.number()),
    total: v.number(),
    createdAt: v.number(),
  })
    .index("applicationId", ["applicationId"])
    .index("reviewerId", ["reviewerId"])
    .index("reviewerId_applicationId", ["reviewerId", "applicationId"]),

  applicationFlag: defineTable({
    applicationId: v.id("application"),
    reviewerId: v.string(),
    reason: v.string(),
    details: v.optional(v.string()),
    createdAt: v.number(),
  }).index("applicationId", ["applicationId"]),

  emailPreferences: defineTable({
    email: v.string(),
    marketingOptIn: v.boolean(),
    userId: v.optional(v.string()),
    mailrelaySyncedAt: v.optional(v.number()),
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("email", ["email"])
    .index("userId", ["userId"]),

  siteSettings: defineTable({
    key: v.literal("global"),
    applicationsState: v.union(
      v.literal("open"),
      v.literal("closed"),
      v.literal("ended"),
    ),
    updatedAt: v.number(),
    updatedBy: v.string(),
  }).index("key", ["key"]),

  
});
