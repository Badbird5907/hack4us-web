import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";

export async function requireAuthenticatedUser() {
  const authed = await isAuthenticated();

  if (!authed) {
    const headersList = await headers();
    const currentPath = headersList.get("x-current-path") || "/";
    redirect(`/sign-in?next=${encodeURIComponent(currentPath)}`);
  }
}
