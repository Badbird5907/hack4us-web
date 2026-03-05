import { ConvexError, v } from "convex/values";
import { queryWithPermission, mutationWithPermission } from ".";
import { buildReviewerStatsMap, normalizeApplicationScore } from "@/lib/review/z-score";
import { applicationTypeValidator } from "../shared";

const decisionValidator = v.union(
  v.literal("accepted"),
  v.literal("rejected"),
  v.literal("waitlist"),
);

const adminQuery = queryWithPermission({ adminDashboard: ["view"] });
const adminMutation = mutationWithPermission({ adminDashboard: ["view"] });

// this is extremely inefficient
// but there is no better way since we are using z-scores
// should be fine for like 1k applications though
export const getRankingDashboard = adminQuery({
  args: { type: applicationTypeValidator },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("application")
      .withIndex("type_status", (q) =>
        q.eq("type", args.type).eq("status", "submitted"),
      )
      .collect();

    const allReviews = await ctx.db.query("review").collect();
    const reviewerStatsMap = buildReviewerStatsMap(
      allReviews.map((r) => ({ reviewerId: r.reviewerId, total: r.total })),
    );

    const reviewsByApp = new Map<string, typeof allReviews>();
    for (const review of allReviews) {
      const key = review.applicationId as string;
      const arr = reviewsByApp.get(key) ?? [];
      arr.push(review);
      reviewsByApp.set(key, arr);
    }

    const allFlags = await ctx.db.query("applicationFlag").collect();
    const flagsByApp = new Map<string, number>();
    for (const flag of allFlags) {
      const key = flag.applicationId as string;
      flagsByApp.set(key, (flagsByApp.get(key) ?? 0) + 1);
    }

    const ranked = applications.map((app) => {
      const appReviews = reviewsByApp.get(app._id as string) ?? [];
      const reviewCount = appReviews.length;

      let rawAverage: number | null = null;
      if (reviewCount > 0) {
        rawAverage = appReviews.reduce((sum, r) => sum + r.total, 0) / reviewCount;
      }

      const normalizedScore = normalizeApplicationScore(
        appReviews.map((r) => ({ reviewerId: r.reviewerId, total: r.total })),
        reviewerStatsMap,
      );

      return {
        _id: app._id,
        type: app.type,
        submittedAt: app.submittedAt,
        rawAverage,
        normalizedScore,
        aiScoreTotal: app.aiScore?.total ?? null,
        reviewCount,
        flagCount: flagsByApp.get(app._id as string) ?? 0,
        decision: app.decision?.status ?? null,
        bypassDecision: app.bypassDecision ?? false,
      };
    });

    ranked.sort((a, b) => {
      if (a.bypassDecision !== b.bypassDecision) return a.bypassDecision ? 1 : -1;
      return (b.normalizedScore ?? -Infinity) - (a.normalizedScore ?? -Infinity);
    });

    return ranked;
  },
});

export const getApplicationDetail = adminQuery({
  args: { applicationId: v.id("application") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new ConvexError({ code: "NOT_FOUND", message: "Application not found" });

    const reviews = await ctx.db
      .query("review")
      .withIndex("applicationId", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    const flags = await ctx.db
      .query("applicationFlag")
      .withIndex("applicationId", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    const allReviews = await ctx.db.query("review").collect();
    const reviewerStatsMap = buildReviewerStatsMap(
      allReviews.map((r) => ({ reviewerId: r.reviewerId, total: r.total })),
    );

    const normalizedScore = normalizeApplicationScore(
      reviews.map((r) => ({ reviewerId: r.reviewerId, total: r.total })),
      reviewerStatsMap,
    );

    return {
      _id: app._id,
      type: app.type,
      answers: app.answers,
      submittedAt: app.submittedAt,
      decision: app.decision ?? null,
      bypassDecision: app.bypassDecision ?? false,
      aiScore: app.aiScore ?? null,
      normalizedScore,
      reviews: reviews.map((r) => ({
        reviewerId: r.reviewerId,
        scores: r.scores,
        total: r.total,
        createdAt: r.createdAt,
      })),
      flags: flags.map((f) => ({
        reviewerId: f.reviewerId,
        reason: f.reason,
        details: f.details,
        createdAt: f.createdAt,
      })),
    };
  },
});

export const getReviewerOverview = adminQuery({
  args: {},
  handler: async (ctx) => {
    const allReviews = await ctx.db.query("review").collect();

    const byReviewer = new Map<
      string,
      { count: number; totalScore: number; lastReviewAt: number }
    >();

    for (const review of allReviews) {
      const existing = byReviewer.get(review.reviewerId);
      if (existing) {
        existing.count++;
        existing.totalScore += review.total;
        existing.lastReviewAt = Math.max(existing.lastReviewAt, review.createdAt);
      } else {
        byReviewer.set(review.reviewerId, {
          count: 1,
          totalScore: review.total,
          lastReviewAt: review.createdAt,
        });
      }
    }

    return Array.from(byReviewer.entries()).map(([reviewerId, stats]) => ({
      reviewerId,
      reviewCount: stats.count,
      averageScore: stats.totalScore / stats.count,
      lastReviewAt: stats.lastReviewAt,
    }));
  },
});

export const getDashboardStats = adminQuery({
  args: { type: applicationTypeValidator },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("application")
      .withIndex("type_status", (q) =>
        q.eq("type", args.type).eq("status", "submitted"),
      )
      .collect();

    const allReviews = await ctx.db.query("review").collect();
    const reviewedAppIds = new Set(allReviews.map((r) => r.applicationId as string));

    let reviewed = 0;
    let unreviewed = 0;
    let accepted = 0;
    let rejected = 0;
    let waitlisted = 0;

    for (const app of applications) {
      if (reviewedAppIds.has(app._id as string)) {
        reviewed++;
      } else {
        unreviewed++;
      }
      if (app.decision?.status === "accepted") accepted++;
      if (app.decision?.status === "rejected") rejected++;
      if (app.decision?.status === "waitlist") waitlisted++;
    }

    const totalReviewsForType = allReviews.filter((r) =>
      applications.some((a) => (a._id as string) === (r.applicationId as string)),
    ).length;

    return {
      total: applications.length,
      reviewed,
      unreviewed,
      accepted,
      rejected,
      waitlisted,
      averageReviewsPerApp: applications.length > 0
        ? totalReviewsForType / applications.length
        : 0,
    };
  },
});

// ─── Mutations ───────────────────────────────────────────────────────

export const setDecisions = adminMutation({
  args: {
    applicationIds: v.array(v.id("application")),
    decision: decisionValidator,
  },
  handler: async (ctx, args) => {
    const warnings: string[] = [];

    for (const applicationId of args.applicationIds) {
      const app = await ctx.db.get(applicationId);
      if (!app) {
        warnings.push(`Application ${applicationId} not found, skipped`);
        continue;
      }

      if (app.bypassDecision) {
        warnings.push(`Application ${applicationId} has bypass decision, skipped`);
        continue;
      }

      const reviews = await ctx.db
        .query("review")
        .withIndex("applicationId", (q) => q.eq("applicationId", applicationId))
        .collect();

      if (reviews.length < 2) {
        warnings.push(`Application ${applicationId} has fewer than 2 reviews`);
      }

      await ctx.db.patch(applicationId, {
        decision: {
          status: args.decision,
          at: Date.now(),
          by: ctx.userId,
        },
      });
    }

    return { updated: args.applicationIds.length, warnings };
  },
});
