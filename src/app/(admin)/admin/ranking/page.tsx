"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "@/hooks/convex";
import { NavbarSlot } from "@/components/navbar-slot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApplicationType } from "@/lib/review/rubric";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";

const TYPES: { value: ApplicationType; label: string }[] = [
  { value: "attendee", label: "Attendees" },
  { value: "mentor", label: "Mentors" },
  { value: "volunteer", label: "Volunteers" },
];

export default function RankingDashboardPage() {
  const [activeType, setActiveType] = useState<ApplicationType>("attendee");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const ranking = useQuery(api.fn.admin.getRankingDashboard, { type: activeType });
  const stats = useQuery(api.fn.admin.getDashboardStats, { type: activeType });
  const setDecisions = useMutation(api.fn.admin.setDecisions);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!ranking) return;
    const eligible = ranking.filter((a) => !a.bypassDecision);
    if (selected.size === eligible.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(eligible.map((a) => a._id as string)));
    }
  };

  const handleBulkDecision = async (decision: "accepted" | "rejected" | "waitlist") => {
    if (selected.size === 0) return;
    try {
      const result = await setDecisions({
        applicationIds: Array.from(selected) as Id<"application">[],
        decision,
      });
      toast.success(`Updated ${result.updated} applications`);
      if (result.warnings.length > 0) {
        result.warnings.forEach((w: string) => toast.warning(w));
      }
      setSelected(new Set());
    } catch {
      toast.error("Failed to set decisions");
    }
  };

  return (
    <>
      <NavbarSlot>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black tracking-widest uppercase leading-none">
            Admin
          </span>
          <span className="text-muted-foreground text-sm leading-none">&mdash;</span>
          <span className="text-sm font-semibold tracking-wide uppercase leading-none">
            Ranking
          </span>
        </div>
      </NavbarSlot>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center gap-2 mb-6">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => { setActiveType(t.value); setSelected(new Set()); }}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors",
                activeType === t.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {stats !== undefined && (
          <div className="mb-6 flex flex-wrap gap-6 rounded-lg border border-border bg-card px-6 py-4">
            <Stat label="Total" value={stats.total} />
            <Stat label="Reviewed" value={stats.reviewed} />
            <Stat label="Unreviewed" value={stats.unreviewed} />
            <Stat label="Accepted" value={stats.accepted} icon={<CheckCircle className="size-3 text-emerald-500" />} />
            <Stat label="Rejected" value={stats.rejected} icon={<XCircle className="size-3 text-destructive" />} />
            <Stat label="Waitlisted" value={stats.waitlisted} icon={<Clock className="size-3 text-amber-500" />} />
            <Stat label="Avg Reviews" value={stats.averageReviewsPerApp.toFixed(1)} />
          </div>
        )}

        {selected.size > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
            <span className="text-xs font-bold tracking-wider uppercase">
              {selected.size} selected
            </span>
            <Button size="xs" onClick={() => handleBulkDecision("accepted")} className="text-[10px] tracking-wider uppercase">
              Accept
            </Button>
            <Button size="xs" variant="secondary" onClick={() => handleBulkDecision("waitlist")} className="text-[10px] tracking-wider uppercase">
              Waitlist
            </Button>
            <Button size="xs" variant="destructive" onClick={() => handleBulkDecision("rejected")} className="text-[10px] tracking-wider uppercase">
              Reject
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setSelected(new Set())} className="text-[10px] tracking-wider uppercase ml-auto">
              Clear
            </Button>
          </div>
        )}

        <div className="rounded-xl border border-border">
          <Table className="w-full text-left text-xs">
            <TableHeader>
              <TableRow className="border-b border-border bg-card hover:bg-card">
                <TableHead className="px-3 py-3 w-8">
                  <input
                    type="checkbox"
                    onChange={selectAll}
                    checked={ranking ? selected.size === ranking.filter((a) => !a.bypassDecision).length && selected.size > 0 : false}
                    className="accent-primary"
                  />
                </TableHead>
                <TableHead className="px-3 py-3 font-bold tracking-wider uppercase text-muted-foreground">#</TableHead>
                <TableHead className="px-3 py-3 font-bold tracking-wider uppercase text-muted-foreground">ID</TableHead>
                <TableHead className="px-3 py-3 font-bold tracking-wider uppercase text-muted-foreground text-right">Normalized</TableHead>
                <TableHead className="px-3 py-3 font-bold tracking-wider uppercase text-muted-foreground text-right">Raw Avg</TableHead>
                <TableHead className="px-3 py-3 font-bold tracking-wider uppercase text-muted-foreground text-right">AI</TableHead>
                <TableHead className="px-3 py-3 font-bold tracking-wider uppercase text-muted-foreground text-center">Reviews</TableHead>
                <TableHead className="px-3 py-3 font-bold tracking-wider uppercase text-muted-foreground text-center">Flags</TableHead>
                <TableHead className="px-3 py-3 font-bold tracking-wider uppercase text-muted-foreground">Status</TableHead>
                <TableHead className="px-3 py-3 font-bold tracking-wider uppercase text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking === undefined ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border hover:bg-transparent">
                    <TableCell colSpan={10} className="px-3 py-3">
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : ranking.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="px-3 py-8 text-center text-muted-foreground">
                    No submitted applications.
                  </TableCell>
                </TableRow>
              ) : (
                ranking.map((app, rank) => (
                  <TableRow
                    key={app._id}
                    className={cn(
                      "border-b border-border transition-colors",
                      app.bypassDecision && "opacity-50",
                      selected.has(app._id as string) && "bg-primary/5 hover:bg-primary/5",
                    )}
                  >
                    <TableCell className="px-3 py-2.5">
                      {!app.bypassDecision && (
                        <input
                          type="checkbox"
                          checked={selected.has(app._id as string)}
                          onChange={() => toggleSelect(app._id as string)}
                          className="accent-primary"
                        />
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 font-mono text-muted-foreground">
                      {app.bypassDecision ? "—" : rank + 1}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 font-mono">
                      {(app._id as string).slice(-8)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right font-mono font-bold">
                      {app.normalizedScore !== null ? app.normalizedScore.toFixed(2) : "—"}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right font-mono">
                      {app.rawAverage !== null ? app.rawAverage.toFixed(1) : "—"}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right font-mono">
                      {app.aiScoreTotal ?? "—"}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-center font-mono">
                      <span className={cn(app.reviewCount < 2 && "text-amber-500")}>
                        {app.reviewCount}
                      </span>
                      {app.reviewCount < 2 && (
                        <AlertTriangle className="ml-1 inline size-3 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-center font-mono">
                      {app.flagCount > 0 ? (
                        <span className="text-destructive">{app.flagCount}</span>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <DecisionBadge decision={app.decision} bypass={app.bypassDecision} />
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      {!app.bypassDecision && (
                        <div className="flex gap-1">
                          <ActionButton
                            label={<CheckCircle className="size-3 text-emerald-500" />}
                            title="Accept"
                            active={app.decision === "accepted"}
                            onClick={() => handleBulkDecision("accepted")}
                            appId={app._id as string}
                            setDecisions={setDecisions}
                          />
                          <ActionButton
                            label={<Clock className="size-3 text-amber-500" />}
                            title="Waitlist"
                            active={app.decision === "waitlist"}
                            onClick={() => handleBulkDecision("waitlist")}
                            appId={app._id as string}
                            setDecisions={setDecisions}
                          />
                          <ActionButton
                            label={<XCircle className="size-3 text-destructive" />}
                            title="Reject"
                            active={app.decision === "rejected"}
                            onClick={() => handleBulkDecision("rejected")}
                            appId={app._id as string}
                            setDecisions={setDecisions}
                          />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-bold">{value}</span>
    </div>
  );
}

function DecisionBadge({ decision, bypass }: { decision: string | null; bypass: boolean }) {
  if (!decision) return <span className="text-muted-foreground">—</span>;

  const variant =
    decision === "accepted"
      ? "default"
      : decision === "rejected"
        ? "destructive"
        : "secondary";

  return (
    <Badge variant={variant as "default" | "destructive" | "secondary"} className="text-[10px]">
      {bypass ? `Bypass: ${decision}` : decision}
    </Badge>
  );
}

function ActionButton({
  label,
  title,
  active,
  appId,
  setDecisions,
}: {
  label: React.ReactNode;
  title: string;
  active: boolean;
  onClick: () => void;
  appId: string;
  setDecisions: ReturnType<typeof useMutation>;
}) {
  const decision = label === "A" ? "accepted" : label === "W" ? "waitlist" : "rejected";

  const handleClick = async () => {
    try {
      await setDecisions({
        applicationIds: [appId as Id<"application">],
        decision: decision as "accepted" | "rejected" | "waitlist",
      });
    } catch {
      toast.error(`Failed to ${title.toLowerCase()}`);
    }
  };

  return (
    <button
      type="button"
      title={title}
      onClick={handleClick}
      className={cn(
        "flex size-6 items-center justify-center rounded text-[10px] font-bold transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card hover:border-primary/50",
      )}
    >
      {label}
    </button>
  );
}
