"use client";

import { BarChart3, ClipboardCheck, LayoutDashboard, Settings, Users } from "lucide-react";
import { api } from "@convex/_generated/api";
import { ShellSidebar, type ShellNavItem } from "@/components/shell-sidebar";
import { useQuery } from "@/hooks/convex";

export function AdminSidebar() {
  const canManageUsers = useQuery(api.auth.hasPermission, {
    permissions: {
      user: ["list"],
    },
  });
  const canReviewApplications = useQuery(api.auth.hasPermission, {
    permissions: {
      review: ["submit"],
    },
  });
  const canManageSiteSettings = useQuery(api.auth.hasPermission, {
    permissions: {
      siteSettings: ["manage"],
    },
  });

  const navItems: ShellNavItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    ...(canManageUsers
      ? [
          {
            title: "Users",
            href: "/admin/users",
            icon: Users,
            match: "prefix" as const,
          },
        ]
      : []),
    ...(canReviewApplications
      ? [
          {
            title: "Review",
            href: "/admin/review",
            icon: ClipboardCheck,
            match: "prefix" as const,
          },
        ]
      : []),
    {
      title: "Ranking",
      href: "/admin/ranking",
      icon: BarChart3,
      match: "prefix",
    },
  ];

  const bottomNavItems: ShellNavItem[] = canManageSiteSettings
    ? [
        {
          title: "Settings",
          href: "/admin/settings",
          icon: Settings,
          match: "prefix",
        },
      ]
    : [];

  return <ShellSidebar logoHref="/admin" navItems={navItems} bottomNavItems={bottomNavItems} />;
}
