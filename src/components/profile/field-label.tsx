"use client";

import type { ReactNode } from "react";

const LABEL_CLASS =
  "mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className={LABEL_CLASS}>{children}</label>;
}
