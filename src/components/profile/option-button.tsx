"use client";

import { memo } from "react";
import type { OptionButtonProps } from "./types";

function OptionButtonBase({
  selected,
  onClick,
  children,
  disabled,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-all
        ${
          selected
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
        }
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );
}

export const OptionButton = memo(OptionButtonBase);
