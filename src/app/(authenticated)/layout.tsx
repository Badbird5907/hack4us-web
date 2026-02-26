import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAuthenticated } from "@/lib/auth-server";
import { AppSidebar } from "@/components/app-sidebar";
import { NavUser } from "@/components/nav-user";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { EnforceOnboarding } from "@/components/enforce-onboarding";
import { NavbarSlotProvider, NavbarSlotOutlet } from "@/components/navbar-slot";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();

  if (!authed) {
    const headersList = await headers();
    const currentPath = headersList.get("x-current-path") || "/";
    redirect(`/sign-in?next=${encodeURIComponent(currentPath)}`);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
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
            <EnforceOnboarding />
            {children}
          </div>
        </NavbarSlotProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
