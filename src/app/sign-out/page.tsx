"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Hack4UsLogo } from "@/components/hack4us-logo";

export default function SignOutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"signing-out" | "done" | "error">("signing-out");

  useEffect(() => {
    authClient.signOut().then(({ error }) => {
      if (error) {
        setStatus("error");
      } else {
        setStatus("done");
        router.push("/");
      }
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Hack4UsLogo href="/" />
        </div>

        <div className="border border-border bg-card p-8 text-center">
          {status === "signing-out" && (
            <>
              <h2 className="mb-1.5 text-lg font-black tracking-[0.15em] text-foreground uppercase">
                Signing Out
              </h2>
              <p className="text-xs text-muted-foreground tracking-wide">
                Please wait…
              </p>
            </>
          )}

          {status === "done" && (
            <>
              <h2 className="mb-1.5 text-lg font-black tracking-[0.15em] text-foreground uppercase">
                Signed Out
              </h2>
              <p className="text-xs text-muted-foreground tracking-wide">
                You have been signed out. Redirecting…
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <h2 className="mb-1.5 text-lg font-black tracking-[0.15em] text-foreground uppercase">
                Something Went Wrong
              </h2>
              <p className="mb-6 text-xs text-muted-foreground tracking-wide">
                We couldn&apos;t sign you out. Please try again.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setStatus("signing-out");
                    authClient.signOut().then(({ error }) => {
                      if (error) {
                        setStatus("error");
                      } else {
                        setStatus("done");
                        router.push("/");
                      }
                    });
                  }}
                  className="w-full bg-primary px-8 py-4 text-sm font-bold tracking-widest text-primary-foreground uppercase transition-all hover:bg-primary/90"
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                >
                  Go Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
