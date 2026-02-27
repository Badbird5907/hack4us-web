"use client";

import { MyApplicationWidget } from "./widgets/my-application";
import { MyProfileWidget } from "./widgets/my-profile";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 mb-24">
      <div className="grid gap-6 lg:grid-cols-2">
        <MyProfileWidget />
        <MyApplicationWidget />
      </div>
    </div>
  );
}
