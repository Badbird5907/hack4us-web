"use client"

import { authClient } from "@/lib/auth-client"

export default function WhoamiPage() {
  const session = authClient.useSession();
  return (
    <div>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}