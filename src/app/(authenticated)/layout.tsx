import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();

  if (!authed) {
    redirect("/sign-in");
  }

  return children;
}