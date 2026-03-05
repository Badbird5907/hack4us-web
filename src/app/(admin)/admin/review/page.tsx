"use client";

import Link from "next/link";
import { NavbarSlot } from "@/components/navbar-slot";
import { useQuery } from "@/hooks/convex";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardCheck } from "lucide-react";

const BUCKETS = [
  { type: "attendee" as const, label: "Attendees" },
  { type: "mentor" as const, label: "Mentors" },
  { type: "volunteer" as const, label: "Volunteers" },
] as const;

export default function ReviewQueuePage() {
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
          <span className="text-sm font-semibold tracking-wide uppercase leading-none">
            Review
          </span>
        </div>
      </NavbarSlot>
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
        <h1 className="text-2xl font-black tracking-tight uppercase">
          Review Queue
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select an application type to begin reviewing.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {BUCKETS.map((bucket) => (
            <BucketCard key={bucket.type} type={bucket.type} label={bucket.label} />
          ))}
        </div>
      </div>
    </>
  );
}

function BucketCard({ type, label }: { type: "attendee" | "mentor" | "volunteer"; label: string }) {
  const stats = useQuery(api.fn.admin.getDashboardStats, { type });

  return (
    <Link
      href={`/admin/review/${type}`}
      className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
    >
      <div className="flex items-center gap-3">
        <ClipboardCheck className="size-5 text-primary" />
        <span className="text-sm font-bold tracking-wider uppercase">{label}</span>
      </div>
      <div className="mt-4 space-y-1">
        {stats === undefined ? (
          <>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono font-bold text-foreground">{stats.unreviewed}</span> pending
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono font-bold text-foreground">{stats.total}</span> total submitted
            </p>
          </>
        )}
      </div>
    </Link>
  );
}
