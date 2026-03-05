"use client";

import { NavbarSlot } from "@/components/navbar-slot";

export default function AdminPage() {
  return (
    <>
      <NavbarSlot>
        <span className="text-sm font-black tracking-widest uppercase leading-none">
          Admin
        </span>
      </NavbarSlot>
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h1 className="text-2xl font-black tracking-tight uppercase">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Admin tools live here. Start from Users to manage participants.
          </p>
        </div>
      </div>
    </>
  );
}
