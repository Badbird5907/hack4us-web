"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@convex/_generated/api";
import { useAction } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { Hack4UsLogo } from "@/components/hack4us-logo";

export default function SocialCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") || "/", [searchParams]);
  const session = authClient.useSession();

  const syncEmailToMailrelay = useAction(api.fn.email.syncEmailToMailrelay);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session.data === undefined) {
      return;
    }

    if (!session.data?.user) {
      router.replace(`/sign-in?next=${encodeURIComponent(next)}`);
      return;
    }

    const sessionData = session.data;

    const run = async () => {
      const user = sessionData.user;
      const email = user.email?.trim().toLowerCase();

      if (!email) {
        setError("Could not determine your account email.");
        return;
      }

      try {
        await syncEmailToMailrelay({
          email,
          name: user.name || undefined,
          marketingOptIn: false,
        });
        router.replace(next);
      } catch {
        setError("We could not finish setting up your email preferences. Please try again.");
      }
    };

    void run();
  }, [next, router, session.data, syncEmailToMailrelay]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border border-border bg-card p-8">
        <div className="mb-8 text-center">
          <Hack4UsLogo href="/" />
        </div>

        <h2 className="mb-1.5 text-lg font-black tracking-[0.15em] text-foreground uppercase">
          Finishing Sign Up
        </h2>
        <p className="text-xs text-muted-foreground tracking-wide">
          We are setting up your account preferences.
        </p>

        {error && (
          <div className="mt-6 space-y-3">
            <p className="text-xs text-primary tracking-wide">{error}</p>
            <Link
              href={next ? `/sign-up?next=${next}` : "/sign-up"}
              className="inline-block text-xs font-semibold tracking-wide text-foreground hover:text-primary transition-colors"
            >
              Return to Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
