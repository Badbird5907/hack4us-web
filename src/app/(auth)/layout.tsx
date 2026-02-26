import { AuthLayoutClient } from "./client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAuthenticated } from "@/lib/auth-server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedIn = await isAuthenticated();

  if (loggedIn) {
    const headersList = await headers();
    const currentPath = headersList.get("x-current-path") || "/";
    const url = new URL(currentPath, "http://n");
    const next = url.searchParams.get("next") || "/";
    redirect(next);
  }

  return (
    <AuthLayoutClient>
      {children}
    </AuthLayoutClient>
  );
}
