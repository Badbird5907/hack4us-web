"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import GoogleIcon from "@/components/icons/google";
import GitHubIcon from "@/components/icons/github";

interface SocialButtonsProps {
  callbackURL?: string;
  beforeRedirect?: (provider: "google" | "github") => boolean | Promise<boolean>;
}

export function SocialAuthButtons({ callbackURL = "/", beforeRedirect }: SocialButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

  const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
      setLoadingProvider(provider);

      if (beforeRedirect) {
        const canContinue = await beforeRedirect(provider);
        if (!canContinue) {
          setLoadingProvider(null);
          return;
        }
      }

      await authClient.signIn.social({
        provider,
        callbackURL,
        errorCallbackURL: provider === "google" ? "/sign-in?error=google" : "/sign-in?error=github",
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handleSocialSignIn("google")}
        disabled={loadingProvider !== null}
        className="flex w-full items-center justify-center gap-3 border border-border bg-transparent px-4 py-3 text-sm font-semibold tracking-wide text-foreground transition-colors hover:border-foreground/50 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        {loadingProvider === "google" ? "Redirecting…" : "Continue with Google"}
      </button>

      <button
        type="button"
        onClick={() => handleSocialSignIn("github")}
        disabled={loadingProvider !== null}
        className="flex w-full items-center justify-center gap-3 border border-border bg-transparent px-4 py-3 text-sm font-semibold tracking-wide text-foreground transition-colors hover:border-foreground/50 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GitHubIcon className="h-4 w-4 shrink-0" />
        {loadingProvider === "github" ? "Redirecting…" : "Continue with GitHub"}
      </button>
    </div>
  );
}
