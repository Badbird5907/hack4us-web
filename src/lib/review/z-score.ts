const MIN_REVIEWS_FOR_ZSCORE = 10;

export interface ReviewerStats {
  mean: number;
  stddev: number;
  count: number;
}

export function computeReviewerStats(totals: number[]): ReviewerStats {
  const count = totals.length;
  if (count === 0) return { mean: 0, stddev: 0, count: 0 };

  const mean = totals.reduce((sum, t) => sum + t, 0) / count;

  const variance =
    totals.reduce((sum, t) => sum + (t - mean) ** 2, 0) / count;
  const stddev = Math.sqrt(variance);

  return { mean, stddev, count };
}

export function computeZScore(
  total: number,
  mean: number,
  stddev: number,
): number {
  if (stddev === 0) return 0;
  return (total - mean) / stddev;
}

export function normalizeApplicationScore(
  reviews: { reviewerId: string; total: number }[],
  reviewerStatsMap: Map<string, ReviewerStats>,
): number | null {
  if (reviews.length === 0) return null;

  let sum = 0;
  let count = 0;

  for (const review of reviews) {
    const stats = reviewerStatsMap.get(review.reviewerId);

    if (!stats || stats.count < MIN_REVIEWS_FOR_ZSCORE) {
      sum += review.total;
    } else {
      sum += computeZScore(review.total, stats.mean, stats.stddev);
    }
    count++;
  }

  return sum / count;
}

export function buildReviewerStatsMap(
  allReviews: { reviewerId: string; total: number }[],
): Map<string, ReviewerStats> {
  const grouped = new Map<string, number[]>();
  for (const review of allReviews) {
    const totals = grouped.get(review.reviewerId) ?? [];
    totals.push(review.total);
    grouped.set(review.reviewerId, totals);
  }

  const statsMap = new Map<string, ReviewerStats>();
  for (const [reviewerId, totals] of grouped) {
    statsMap.set(reviewerId, computeReviewerStats(totals));
  }

  return statsMap;
}
