import { redirect } from "next/navigation";
import { api } from "@convex/_generated/api";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AppShell } from "@/components/layout/app-shell";
import { fetchAuthQuery } from "@/lib/auth-server";
import { requireAuthenticatedUser } from "@/lib/route-guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthenticatedUser();

  const canViewAdminDashboard = await fetchAuthQuery(api.auth.hasPermission, {
    permissions: {
      adminDashboard: ["view"],
    },
  });

  if (!canViewAdminDashboard) {
    redirect("/dashboard");
  }

  return <AppShell sidebar={<AdminSidebar />}>{children}</AppShell>;
}
