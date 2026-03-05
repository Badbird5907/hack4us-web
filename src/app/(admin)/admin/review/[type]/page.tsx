"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavbarSlot } from "@/components/navbar-slot";
import { useQuery } from "@/hooks/convex";
import { api } from "@convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApplicationType } from "@/lib/review/rubric";

const TYPE_LABELS: Record<ApplicationType, string> = {
  attendee: "Attendees",
  mentor: "Mentors",
  volunteer: "Volunteers",
};

export default function ReviewBucketPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);
  const applicationType = type as ApplicationType;
  const label = TYPE_LABELS[applicationType] ?? type;
  const router = useRouter();

  const queue = useQuery(api.fn.review.getReviewQueue, { type: applicationType, skipDecision: true });
  const stats = useQuery(api.fn.review.getMyReviewStats, {});

  const handleStartReviewing = () => {
    if (!queue || queue.length === 0) return;
    const first = queue.find((a) => !a.isLocked);
    if (first) {
      router.push(`/admin/review/${type}/${first._id}`);
    }
  };

  return (
    <>
      <NavbarSlot>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black tracking-widest uppercase leading-none">
            Admin
          </span>
          <span className="text-muted-foreground text-sm leading-none">
            &mdash;
          </span>
          <Link
            href="/admin/review"
            className="text-sm font-semibold tracking-wide uppercase leading-none hover:text-primary transition-colors"
          >
            Review
          </Link>
          <span className="text-muted-foreground text-sm leading-none">
            &mdash;
          </span>
          <span className="text-sm font-semibold tracking-wide uppercase leading-none text-primary">
            {label}
          </span>
        </div>
      </NavbarSlot>
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">
              {label} Queue
            </h1>
            {stats !== undefined && (
              <p className="mt-1 text-xs text-muted-foreground">
                You have reviewed{" "}
                <span className="font-mono font-bold text-foreground">
                  {stats.byType[applicationType] ?? 0}
                </span>{" "}
                {label.toLowerCase()} total
              </p>
            )}
          </div>
          <Button
            onClick={handleStartReviewing}
            disabled={!queue || queue.length === 0}
            className="text-xs font-bold tracking-widest uppercase"
          >
            Start Reviewing
          </Button>
        </div>

        <div className="mt-6 space-y-2">
          {queue === undefined ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))
          ) : queue.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No applications to review in this queue.
              </p>
            </div>
          ) : (
            queue.map((app) => (
              <Link
                key={app._id}
                href={`/admin/review/${type}/${app._id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {app._id.slice(-6)}
                  </span>
                  {app.decision && (
                    <Badge
                      variant={
                        app.decision === "accepted"
                          ? "default"
                          : app.decision === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {app.decision}
                    </Badge>
                  )}
                  {app.isLocked && (
                    <Badge variant="outline" className="text-[10px]">
                      Locked
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {app.aiScoreTotal !== null && (
                    <span>
                      AI: <span className="font-mono font-bold text-foreground">{app.aiScoreTotal}</span>
                    </span>
                  )}
                  <span>
                    Reviews: <span className="font-mono font-bold text-foreground">{app.reviewCount}</span>
                  </span>
                  {app.flagCount > 0 && (
                    <span className="text-destructive">
                      Flags: <span className="font-mono font-bold">{app.flagCount}</span>
                    </span>
                  )}
                  {app.submittedAt && (
                    <span className="hidden sm:inline">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
