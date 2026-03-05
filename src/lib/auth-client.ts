import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac,admin,reviewer,user } from "@/lib/permissions";

export const authClient = createAuthClient({
  plugins: [convexClient(), adminClient({
    ac: ac,
    roles: {
      admin,
      reviewer,
      user,
    }
  })],
});