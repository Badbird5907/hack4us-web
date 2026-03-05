"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { SocialAuthButtons } from "@/components/auth/social-buttons";
import { Hack4UsLogo } from "@/components/hack4us-logo";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isReady = email.trim().length > 0 && password.length >= 8;
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: next,
    });

    if (error) {
      if (error.status === 403) {
        setError("Please verify your email from the link sent to your inbox before signing in.");
      } else {
        setError(error.message ?? "Failed to sign in.");
      }
      setLoading(false);
    } else {
      router.push(next);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Hack4UsLogo href="/" />
        </div>

        <div className="border border-border bg-card p-8">
          <h2 className="mb-1.5 text-lg font-black tracking-[0.15em] text-foreground uppercase">
            Sign In
          </h2>
          <p className="mb-8 text-xs text-muted-foreground tracking-wide">
            Welcome back. Enter your credentials to continue.
          </p>

          <SocialAuthButtons callbackURL={next} />

          <div className="flex items-center gap-3 py-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-primary tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !isReady}
              className={`w-full px-8 py-4 text-sm font-bold tracking-widest uppercase transition-all disabled:cursor-not-allowed ${
                loading || !isReady
                  ? "bg-primary/50 text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {loading ? "Signing In…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground tracking-wide">
              Don&apos;t have an account?{" "}
              <Link
                href={next ? `/sign-up?next=${next}` : "/sign-up"}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
