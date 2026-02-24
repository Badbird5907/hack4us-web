import { AuthLayoutClient } from "./client";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedIn = await isAuthenticated();

  if (loggedIn) {
    redirect("/");
  }

  return (
    <AuthLayoutClient>
      {children}
    </AuthLayoutClient>
  );
}
