"use client";

import { MyApplicationWidget } from "./widgets/my-application";
import { MyProfileWidget } from "./widgets/my-profile";
import { NavbarSlot } from "@/components/navbar-slot";

export default function DashboardPage() {
  return (
    <>
      <NavbarSlot>
        <span className="text-sm font-black tracking-widest uppercase leading-none">
          Home
        </span>
      </NavbarSlot>
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 mb-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <MyProfileWidget />
          <MyApplicationWidget />
        </div>
      </div>
    </>
  );
}
