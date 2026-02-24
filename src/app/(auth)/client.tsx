"use client";

import { InteractiveGrid } from "@/components/bg-grid";
import { useRef } from "react";

export const AuthLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const sectionRef = useRef<HTMLElement>(null)
  return (
    <section ref={sectionRef} className="relative min-h-screen">
      <InteractiveGrid sectionRef={sectionRef} />
      <div className="relative z-10">{children}</div>
    </section>
  )
}
