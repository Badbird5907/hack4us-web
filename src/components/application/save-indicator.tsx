"use client";

import { Check, Loader2, AlertCircle } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function SaveIndicator({
  status,
  lastSavedAt,
}: {
  status: SaveStatus;
  lastSavedAt: Date | null;
}) {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-muted-foreground">
      {status === "saving" && (
        <>
          <Loader2 className="size-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="size-3 text-emerald-500" />
          <span>
            Saved{lastSavedAt ? ` at ${formatTime(lastSavedAt)}` : ""}
          </span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="size-3 text-destructive" />
          <span className="text-destructive">Failed to save</span>
        </>
      )}
      {status === "idle" && lastSavedAt && (
        <>
          <Check className="size-3 text-muted-foreground/50" />
          <span>Saved at {formatTime(lastSavedAt)}</span>
        </>
      )}
    </div>
  );
}
