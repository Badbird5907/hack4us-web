"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FLAG_REASONS } from "@/lib/review/rubric";
import { cn } from "@/lib/utils";

interface FlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string, details?: string) => void;
}

export function FlagDialog({ open, onOpenChange, onSubmit }: FlagDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason, details.trim() || undefined);
    setSelectedReason("");
    setDetails("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm font-bold tracking-wider uppercase">
            Flag Application
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {FLAG_REASONS.map((reason) => (
            <button
              key={reason.id}
              type="button"
              onClick={() => setSelectedReason(reason.id)}
              className={cn(
                "w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
                selectedReason === reason.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-primary/50",
              )}
            >
              {reason.label}
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Additional details (optional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          className="text-sm"
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs tracking-wider uppercase"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="text-xs tracking-wider uppercase"
          >
            Submit Flag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
