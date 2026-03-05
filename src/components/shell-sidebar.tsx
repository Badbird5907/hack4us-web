"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hack4UsLogo } from "@/components/hack4us-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type ShellNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  match?: "exact" | "prefix";
};

type ShellSidebarProps = {
  logoHref: string;
  navItems: ShellNavItem[];
  bottomNavItems?: ShellNavItem[];
};

function isItemActive(pathname: string, item: ShellNavItem) {
  if (item.match === "prefix") {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return pathname === item.href;
}

export function ShellSidebar({ logoHref, navItems, bottomNavItems }: ShellSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex-row items-center border-b border-border px-4">
        <Hack4UsLogo
          href={logoHref}
          className="text-xl font-black tracking-tight"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isItemActive(pathname, item)}
                    tooltip={item.title}
                    className="data-[active=true]:bg-sidebar-accent/60 data-[active=true]:border-l-2 data-[active=true]:border-l-primary data-[active=true]:pl-[6px]"
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {bottomNavItems?.length ? (
        <SidebarFooter className="border-t border-border">
          <SidebarMenu>
            {bottomNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isItemActive(pathname, item)}
                  tooltip={item.title}
                  className="data-[active=true]:bg-sidebar-accent/60 data-[active=true]:border-l-2 data-[active=true]:border-l-primary data-[active=true]:pl-[6px]"
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      ) : null}
    </Sidebar>
  );
}
