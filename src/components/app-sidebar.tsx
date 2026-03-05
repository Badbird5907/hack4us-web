"use client";

import { FileText, Home, User } from "lucide-react";
import { ShellSidebar, type ShellNavItem } from "@/components/shell-sidebar";

const navItems: ShellNavItem[] = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "My Application",
    href: "/apply",
    icon: FileText,
  },
];

export function AppSidebar() {
  return <ShellSidebar logoHref="/dashboard" navItems={navItems} />;
}
