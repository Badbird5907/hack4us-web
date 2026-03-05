import { redirect } from "next/navigation";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { requireAuthenticatedUser } from "@/lib/route-guards";
import { AdminSettingsClient } from "./settings-client";

export default async function AdminSettingsPage() {
  await requireAuthenticatedUser();

  const canManageSiteSettings = await fetchAuthQuery(api.auth.hasPermission, {
    permissions: {
      siteSettings: ["manage"],
    },
  });

  if (!canManageSiteSettings) {
    redirect("/admin");
  }

  return <AdminSettingsClient />;
}
