import { AppSidebar } from "@/components/app-sidebar";
import { AppShell } from "@/components/layout/app-shell";
import { EnforceOnboarding } from "@/components/enforce-onboarding";
import { requireAuthenticatedUser } from "@/lib/route-guards";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthenticatedUser();

  return (
    <AppShell sidebar={<AppSidebar />} topOfContent={<EnforceOnboarding />}>
      {children}
    </AppShell>
  );
}
