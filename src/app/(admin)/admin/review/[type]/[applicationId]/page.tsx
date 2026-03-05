"use client";

import { use, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "@/hooks/convex";
import { NavbarSlot } from "@/components/navbar-slot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RubricForm } from "@/components/review/rubric-form";
import { ApplicationResponseView } from "@/components/review/application-response-view";
import { FlagDialog } from "@/components/review/flag-dialog";
import type { ApplicationType } from "@/lib/review/rubric";
import { toast } from "sonner";
import { Flag, FlagOff, SkipForward, ShieldCheck, ShieldX, Eye, EyeOff } from "lucide-react";
import { Comments } from "@/components/review/comments";

const TYPE_LABELS: Record<ApplicationType, string> = {
  attendee: "Attendees",
  mentor: "Mentors",
  volunteer: "Volunteers",
};

const LOCK_RENEW_MS = 2 * 60 * 1000;

export default function ReviewApplicationPage({
  params,
}: {
  params: Promise<{ type: string; applicationId: string }>;
}) {
  const { type, applicationId } = use(params);
  const applicationType = type as ApplicationType;
  const appId = applicationId as Id<"application">;
  const router = useRouter();

  const app = useQuery(api.fn.review.getApplicationForReview, { applicationId: appId });
  const queue = useQuery(api.fn.review.getReviewQueue, { type: applicationType, skipDecision: true });

  const lock = useMutation(api.fn.review.lockApplication);
  const renewLock = useMutation(api.fn.review.renewLock);
  const unlock = useMutation(api.fn.review.unlockApplication);
  const submitReview = useMutation(api.fn.review.submitReview);
  const skip = useMutation(api.fn.review.skipApplication);
  const flagApp = useMutation(api.fn.review.flagApplication);
  const unflagApp = useMutation(api.fn.review.unflagApplication);
  const bypassAcceptMut = useMutation(api.fn.review.bypassAccept);
  const bypassRejectMut = useMutation(api.fn.review.bypassReject);
  const undoBypassDecisionMut = useMutation(api.fn.review.undoBypassDecision);

  const [submitting, setSubmitting] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const lockAcquired = useRef(false);

  const acquireLock = useCallback(async () => {
    if (lockAcquired.current) return;
    try {
      await lock({ applicationId: appId });
      lockAcquired.current = true;
    } catch {
      toast.error("Could not lock application — it may be claimed by another reviewer.");
      router.push(`/admin/review/${type}`);
    }
  }, [lock, appId, router, type]);

  useEffect(() => {
    acquireLock();
  }, [acquireLock]);

  useEffect(() => {
    if (!lockAcquired.current) return;
    const interval = setInterval(() => {
      renewLock({ applicationId: appId }).catch(() => { });
    }, LOCK_RENEW_MS);
    return () => clearInterval(interval);
  }, [renewLock, appId]);

  useEffect(() => {
    const handleUnload = () => {
      if (lockAcquired.current) {
        unlock({ applicationId: appId });
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload();
    };
  }, [unlock, appId]);

  const goToNext = useCallback(() => {
    if (!queue || queue.length === 0) {
      router.push(`/admin/review/${type}`);
      return;
    }
    const currentIndex = queue.findIndex((a) => a._id === appId);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    for (let i = 1; i <= queue.length; i++) {
      const candidate = queue[(startIndex + i) % queue.length];
      if (candidate._id !== appId && !candidate.isLocked) {
        router.push(`/admin/review/${type}/${candidate._id}`);
        return;
      }
    }
    router.push(`/admin/review/${type}`);
  }, [queue, appId, router, type]);

  const handleSubmit = async (scores: Record<string, number>) => {
    setSubmitting(true);
    try {
      await submitReview({ applicationId: appId, scores });
      lockAcquired.current = false;
      toast.success("Review submitted");
      goToNext();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to submit review";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    await skip({ applicationId: appId });
    lockAcquired.current = false;
    goToNext();
  };

  const handleFlag = async (reason: string, details?: string) => {
    try {
      await flagApp({ applicationId: appId, reason, details });
      toast.success("Application flagged");
    } catch {
      toast.error("Failed to flag application");
    }
  };

  const handleUnflag = async () => {
    try {
      await unflagApp({ applicationId: appId });
      toast.success("Application unflagged");
    } catch {
      toast.error("Failed to unflag application");
    }
  };

  const handleBypassAccept = async () => {
    try {
      await bypassAcceptMut({ applicationId: appId });
      lockAcquired.current = false;
      toast.success("Application accepted (bypass)");
      goToNext();
    } catch {
      toast.error("Failed to bypass accept");
    }
  };

  const handleBypassReject = async () => {
    try {
      await bypassRejectMut({ applicationId: appId });
      lockAcquired.current = false;
      toast.success("Application rejected (bypass)");
      goToNext();
    } catch {
      toast.error("Failed to bypass reject");
    }
  };

  const handleUndoBypassDecision = async () => {
    try {
      await undoBypassDecisionMut({ applicationId: appId });
      toast.success("Bypass decision undone");
    } catch {
      toast.error("Failed to undo bypass decision");
    }
  };

  const label = TYPE_LABELS[applicationType] ?? type;

  return (
    <>
      <NavbarSlot>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black tracking-widest uppercase leading-none">
            Admin
          </span>
          <span className="text-muted-foreground text-sm leading-none">&mdash;</span>
          <Link
            href="/admin/review"
            className="text-sm font-semibold tracking-wide uppercase leading-none hover:text-primary transition-colors"
          >
            Review
          </Link>
          <span className="text-muted-foreground text-sm leading-none">&mdash;</span>
          <Link
            href={`/admin/review/${type}`}
            className="text-sm font-semibold tracking-wide uppercase leading-none hover:text-primary transition-colors"
          >
            {label}
          </Link>
        </div>
      </NavbarSlot>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        {app === undefined ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <Skeleton className="h-96" />
            <Skeleton className="h-72" />
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="outline" className="text-[10px] font-bold tracking-wider uppercase">
                {applicationType}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {app.reviewCount} review{app.reviewCount !== 1 ? "s" : ""}
              </span>
              {app.flags.length > 0 && (
                <span className="text-xs text-destructive">
                  {app.flags.length} flag{app.flags.length !== 1 ? "s" : ""}
                </span>
              )}
              {app.myReview && (
                <Badge variant="secondary" className="text-[10px]">
                  Already reviewed
                </Badge>
              )}
              {app.bypassDecision && app.decision && (
                <Badge
                  variant={app.decision.status === "accepted" ? "default" : "destructive"}
                  className="text-[10px]"
                >
                  Bypass: {app.decision.status}
                </Badge>
              )}
              <span className="font-mono text-[10px] text-muted-foreground ml-auto">
                {appId.slice(-8)}
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <div className="space-y-6">
                {showAll && app.applicant && (
                  <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <h2 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                      Applicant Profile
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">Name</p>
                        <p className="text-sm">{app.applicant.user.name ?? "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">Email</p>
                        <p className="text-sm break-all">{app.applicant.user.email ?? "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">Role</p>
                        <p className="text-sm">{app.applicant.profile?.role ?? "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">School</p>
                        <p className="text-sm">
                          {app.applicant.profile?.school
                            ? app.applicant.profile?.year
                              ? `${app.applicant.profile.school}, ${app.applicant.profile.year}`
                              : app.applicant.profile.school
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                    {app.applicant.profile?.bio && (
                      <div>
                        <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">Bio</p>
                        <p className="text-sm whitespace-pre-wrap">{app.applicant.profile.bio}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                    Application Responses
                  </h2>
                  <ApplicationResponseView answers={app.answers} showAll={showAll} applicationType={applicationType} />
                </div>

                {app.flags.length > 0 && (
                  <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                      Flags
                    </h3>
                    {app.flags.map((f, i) => (
                      <div key={i} className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{f.reason}</span>
                        {f.details && <span className="ml-1">— {f.details}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <Comments applicationId={appId} />
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                    Score
                  </h2>
                  <RubricForm
                    applicationType={applicationType}
                    onSubmit={handleSubmit}
                    disabled={submitting || !!app.myReview || app.bypassDecision}
                    aiScore={app.aiScore}
                  />
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-row w-full gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSkip}
                      className="text-[10px] flex-1 min-w-0 tracking-wider uppercase gap-1.5"
                    >
                      <SkipForward className="size-3 shrink-0" />
                      Skip
                    </Button>
                    {app.flags.length > 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUnflag}
                        className="text-[10px] flex-1 min-w-0 tracking-wider uppercase gap-1.5"
                      >
                        <FlagOff className="size-3 shrink-0" />
                        Unflag
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFlagOpen(true)}
                        className="text-[10px] flex-1 min-w-0 tracking-wider uppercase gap-1.5"
                      >
                        <Flag className="size-3 shrink-0" />
                        Flag
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-row w-full gap-2">
                    {app.bypassDecision ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndoBypassDecision}
                        className="text-[10px] flex-1 min-w-0 tracking-wider uppercase gap-1.5"
                      >
                        <ShieldX className="size-3 shrink-0" />
                        Undo Bypass Decision
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBypassAccept}
                          className="text-[10px] flex-1 min-w-0 tracking-wider uppercase gap-1.5 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                        >
                          <ShieldCheck className="size-3 shrink-0" />
                          Bypass Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBypassReject}
                          className="text-[10px] flex-1 min-w-0 tracking-wider uppercase gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <ShieldX className="size-3 shrink-0" />
                          Bypass Reject
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex flex-row w-full gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAll((value) => !value)}
                      className="text-[10px] flex-1 min-w-0 tracking-wider uppercase gap-1.5"
                    >
                      {showAll ? <EyeOff className="size-3 shrink-0" /> : <Eye className="size-3 shrink-0" />}
                      {showAll ? "Hide all" : "I'm biased"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <FlagDialog
        open={flagOpen}
        onOpenChange={setFlagOpen}
        onSubmit={handleFlag}
      />
    </>
  );
}
