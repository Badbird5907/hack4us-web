import type { ReactNode } from "react";
import { NavUser } from "@/components/nav-user";
import { NavbarSlotOutlet, NavbarSlotProvider } from "@/components/navbar-slot";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

type AppShellProps = {
  sidebar: ReactNode;
  children: ReactNode;
  topOfContent?: ReactNode;
};

export function AppShell({ sidebar, children, topOfContent }: AppShellProps) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        <NavbarSlotProvider>
          <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4!" />
            <NavbarSlotOutlet />
            <div className="ml-auto">
              <NavUser />
            </div>
          </header>
          <div className="flex-1 p-6">
            {topOfContent}
            {children}
          </div>
        </NavbarSlotProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
