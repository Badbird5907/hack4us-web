"use client";

import { useQuery } from "@/hooks/convex";
import { api } from "@convex/_generated/api";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight uppercase">Home</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome to your dashboard.
      </p>
    </div>
  );
}
