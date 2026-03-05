import { ConvexError, v } from "convex/values";
import { queryWithPermission, mutationWithPermission } from ".";
import { getRubricForType, validateScores, computeWeightedTotal } from "@/lib/review/scoring";
import { FLAG_REASONS } from "@/lib/review/rubric";
import type { DataModel, Id } from "../_generated/dataModel";
import type { GenericMutationCtx } from "convex/server";
import { authComponent, createAuth } from "../auth";
import { applicationTypeValidator } from "../shared";

const LOCK_TTL_MS = 5 * 60 * 1000;

const reviewQuery = queryWithPermission({ review: ["submit"] });
const reviewMutation = mutationWithPermission({ review: ["submit"] });
const flagMutation = mutationWithPermission({ review: ["flag"] });
const bypassMutation = mutationWithPermission({ review: ["bypass"] });

function isLockActive(lockedBy: string | undefined, lockedAt: number | undefined): boolean {
  if (!lockedBy || !lockedAt) return false;
  return Date.now() - lockedAt < LOCK_TTL_MS;
}

export const getReviewQueue = reviewQuery({
  args: { type: applicationTypeValidator, skipDecision: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const applications = (
      await ctx.db
        .query("application")
        .withIndex("type_status", (q) =>
          q.eq("type", args.type).eq("status", "submitted"),
        )
        .collect()
    ).filter((app) => !args.skipDecision || app.decision == null);

    const now = Date.now();
    const reviewableApps = [];

    for (const app of applications) {
      if (app.bypassDecision) continue;

      const lockedByOther =
        app.lockedBy &&
        app.lockedBy !== ctx.userId &&
        app.lockedAt &&
        now - app.lockedAt < LOCK_TTL_MS;
      if (lockedByOther) continue;

      const existingReview = await ctx.db
        .query("review")
        .withIndex("reviewerId_applicationId", (q) =>
          q.eq("reviewerId", ctx.userId).eq("applicationId", app._id),
        )
        .first();
      if (existingReview) continue;

      const reviews = await ctx.db
        .query("review")
        .withIndex("applicationId", (q) => q.eq("applicationId", app._id))
        .collect();

      const flags = await ctx.db
        .query("applicationFlag")
        .withIndex("applicationId", (q) => q.eq("applicationId", app._id))
        .collect();

      reviewableApps.push({
        _id: app._id,
        type: app.type,
        submittedAt: app.submittedAt,
        aiScoreTotal: app.aiScore?.total ?? null,
        reviewCount: reviews.length,
        flagCount: flags.length,
        decision: app.decision?.status ?? null,
        isLocked: isLockActive(app.lockedBy, app.lockedAt),
      });
    }

    const hasAiScores = reviewableApps.some((a) => a.aiScoreTotal !== null);
    if (hasAiScores) {
      reviewableApps.sort((a, b) => (b.aiScoreTotal ?? 0) - (a.aiScoreTotal ?? 0));
    } else {
      reviewableApps.sort((a, b) => (a.submittedAt ?? 0) - (b.submittedAt ?? 0));
    }

    return reviewableApps;
  },
});

export const getApplicationForReview = reviewQuery({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new ConvexError({ code: "NOT_FOUND", message: "Application not found" });
    if (app.status !== "submitted") {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Application is not submitted" });
    }

    const myReview = await ctx.db
      .query("review")
      .withIndex("reviewerId_applicationId", (q) =>
        q.eq("reviewerId", ctx.userId).eq("applicationId", args.applicationId),
      )
      .first();

    const flags = await ctx.db
      .query("applicationFlag")
      .withIndex("applicationId", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    const allReviews = await ctx.db
      .query("review")
      .withIndex("applicationId", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    const userProfile = await ctx.db
      .query("userProfile")
      .withIndex("userId", (q) => q.eq("userId", app.userId))
      .first();

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const user = await auth.api
      .getUser({
        query: { id: app.userId },
        headers,
      })
      .catch(() => null);

    return {
      _id: app._id,
      type: app.type,
      answers: app.answers,
      submittedAt: app.submittedAt,
      aiScore: app.aiScore ?? null,
      decision: app.decision ?? null,
      bypassDecision: app.bypassDecision ?? false,
      myReview: myReview
        ? { scores: myReview.scores, total: myReview.total, createdAt: myReview.createdAt }
        : null,
      flags: flags.map((f) => ({
        reason: f.reason,
        details: f.details,
        createdAt: f.createdAt,
      })),
      applicant: {
        user: {
          id: app.userId,
          name: user?.name ?? null,
          email: user?.email ?? null,
          image: user?.image ?? null,
        },
        profile: userProfile
          ? {
            role: userProfile.role,
            educationLevel: userProfile.educationLevel ?? null,
            birthdate: userProfile.birthdate ?? null,
            school: userProfile.school ?? null,
            year: userProfile.year ?? null,
            bio: userProfile.bio ?? null,
            skills: userProfile.skills ?? [],
            interests: userProfile.interests ?? [],
            links: userProfile.links ?? null,
          }
          : null,
      },
      reviewCount: allReviews.length,
      isLockedByMe: app.lockedBy === ctx.userId && isLockActive(app.lockedBy, app.lockedAt),
    };
  },
});

export const getMyReviewStats = reviewQuery({
  args: {},
  handler: async (ctx) => {
    const reviews = await ctx.db
      .query("review")
      .withIndex("reviewerId", (q) => q.eq("reviewerId", ctx.userId))
      .collect();

    const byType: Record<string, number> = {};
    for (const r of reviews) {
      const app = await ctx.db.get(r.applicationId);
      if (!app) continue;
      byType[app.type] = (byType[app.type] ?? 0) + 1;
    }

    return { total: reviews.length, byType };
  },
});

export const getApplicationComments = reviewQuery({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("applicationComments")
      .withIndex("applicationId", (q) => q.eq("applicationId", args.applicationId))
      .collect();
    const userIds = new Set(comments.map((c) => c.authorId));

    if (userIds.size === 0) {
      return [];
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const users = await Promise.all(
      Array.from(userIds).map(async (userId) => {
        try {
          const user = await auth.api.getUser({
            query: { id: userId },
            headers,
          });
          return [userId, { name: user.name ?? null, image: user.image ?? null }] as const;
        } catch {
          return [userId, { name: null, image: null }] as const;
        }
      }),
    );

    return comments.map((c) => ({
      ...c,
      author: users.find((u) => u[0] === c.authorId)?.[1],
    }));
  },
});

export const addApplicationComment = reviewMutation({
  args: { applicationId: v.id("application"), content: v.string() },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new ConvexError({ code: "NOT_FOUND", message: "Application not found" });
    
    await ctx.db.insert("applicationComments", {
      applicationId: args.applicationId,
      content: args.content,
      authorId: ctx.userId,
      createdAt: Date.now(),
    });
  },
});

export const deleteApplicationComment = reviewMutation({
  args: { commentId: v.id("applicationComments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new ConvexError({ code: "NOT_FOUND", message: "Comment not found" });
    if (comment.authorId !== ctx.userId) throw new ConvexError({ code: "FORBIDDEN", message: "You do not own this comment" });
    await ctx.db.delete(args.commentId);
  },
});

export const lockApplication = reviewMutation({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new ConvexError({ code: "NOT_FOUND", message: "Application not found" });

    if (app.lockedBy && app.lockedBy !== ctx.userId && isLockActive(app.lockedBy, app.lockedAt)) {
      throw new ConvexError({ code: "CONFLICT", message: "Application is locked by another reviewer" });
    }

    await ctx.db.patch(args.applicationId, {
      lockedBy: ctx.userId,
      lockedAt: Date.now(),
    });
  },
});

export const renewLock = reviewMutation({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new ConvexError({ code: "NOT_FOUND", message: "Application not found" });

    if (app.lockedBy !== ctx.userId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "You do not hold the lock" });
    }

    await ctx.db.patch(args.applicationId, { lockedAt: Date.now() });
  },
});

export const unlockApplication = reviewMutation({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) return;

    if (app.lockedBy === ctx.userId || !isLockActive(app.lockedBy, app.lockedAt)) {
      await ctx.db.patch(args.applicationId, {
        lockedBy: undefined,
        lockedAt: undefined,
      });
    }
  },
});

export const submitReview = reviewMutation({
  args: {
    applicationId: v.id("application"),
    scores: v.record(v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new ConvexError({ code: "NOT_FOUND", message: "Application not found" });
    if (app.status !== "submitted") {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Application is not submitted" });
    }

    const existing = await ctx.db
      .query("review")
      .withIndex("reviewerId_applicationId", (q) =>
        q.eq("reviewerId", ctx.userId).eq("applicationId", args.applicationId),
      )
      .first();
    if (existing) {
      throw new ConvexError({ code: "CONFLICT", message: "You already reviewed this application" });
    }

    const rubric = getRubricForType(app.type);
    const error = validateScores(args.scores, rubric);
    if (error) throw new ConvexError({ code: "BAD_REQUEST", message: error });

    const total = computeWeightedTotal(args.scores, rubric);

    await ctx.db.insert("review", {
      applicationId: args.applicationId,
      reviewerId: ctx.userId,
      scores: args.scores,
      total,
      createdAt: Date.now(),
    });

    if (app.lockedBy === ctx.userId) {
      await ctx.db.patch(args.applicationId, {
        lockedBy: undefined,
        lockedAt: undefined,
      });
    }
  },
});

export const skipApplication = reviewMutation({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) return;

    if (app.lockedBy === ctx.userId) {
      await ctx.db.patch(args.applicationId, {
        lockedBy: undefined,
        lockedAt: undefined,
      });
    }
  },
});

export const flagApplication = flagMutation({
  args: {
    applicationId: v.id("application"),
    reason: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new ConvexError({ code: "NOT_FOUND", message: "Application not found" });

    const validReasons = FLAG_REASONS.map((r) => r.id);
    if (!validReasons.includes(args.reason as typeof validReasons[number])) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Invalid flag reason" });
    }

    await ctx.db.insert("applicationFlag", {
      applicationId: args.applicationId,
      reviewerId: ctx.userId,
      reason: args.reason,
      details: args.details,
      createdAt: Date.now(),
    });
  },
});

export const unflagApplication = flagMutation({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new ConvexError({ code: "NOT_FOUND", message: "Application not found" });

    const flags = await ctx.db
      .query("applicationFlag")
      .withIndex("applicationId", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    const myFlags = flags.filter((f) => f.reviewerId === ctx.userId);
    await Promise.all(myFlags.map((f) => ctx.db.delete(f._id)));
  },
});

export const bypassAccept = bypassMutation({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    await setBypassDecision(ctx, args.applicationId, "accepted");
  },
});

export const bypassReject = bypassMutation({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    await setBypassDecision(ctx, args.applicationId, "rejected");
  },
});

export const undoBypassDecision = bypassMutation({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    await clearBypassDecision(ctx, args.applicationId);
  },
});

async function setBypassDecision(
  ctx: GenericMutationCtx<DataModel> & { userId: string },
  applicationId: Id<"application">,
  status: "accepted" | "rejected",
) {
  const app = await ctx.db.get(applicationId);
  if (!app) throw new ConvexError({ code: "NOT_FOUND", message: "Application not found" });

  await ctx.db.patch(applicationId, {
    decision: { status, at: Date.now(), by: ctx.userId },
    bypassDecision: true,
    lockedBy: undefined,
    lockedAt: undefined,
  });
}

async function clearBypassDecision(
  ctx: GenericMutationCtx<DataModel> & { userId: string },
  applicationId: Id<"application">,
) {
  const app = await ctx.db.get(applicationId);
  if (!app) throw new ConvexError({ code: "NOT_FOUND", message: "Application not found" });

  await ctx.db.patch(applicationId, {
    decision: undefined,
    bypassDecision: undefined,
  });
}
