"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { SocialAuthButtons } from "@/components/auth/social-buttons"
import { Hack4UsLogo } from "@/components/hack4us-logo"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"
  const socialCallbackURL = `/social-complete?next=${encodeURIComponent(next)}`
  const isFormReady =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormReady) return
    setError(null)
    setSuccess(null)
    setLoading(true)

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: next,
    })

    if (error) {
      setError(error.message ?? "Failed to create account.")
      setLoading(false)
    } else {
      setSuccess(
        "Account created. Check your inbox for a verification link before signing in."
      )
      setLoading(false)
      setPassword("")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Hack4UsLogo href="/" />
        </div>

        <div className="border border-border bg-card p-8">
          <h2 className="mb-1.5 text-lg font-black tracking-[0.15em] text-foreground uppercase">
            Create Account
          </h2>
          <p className="mb-8 text-xs text-muted-foreground tracking-wide">
            Register to participate in the hackathon.
          </p>
          <SocialAuthButtons callbackURL={socialCallbackURL} />

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
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Jane Doe"
                className="w-full border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>

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
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              />
              <p className="mt-1.5 text-[10px] text-muted-foreground tracking-wide">
                Minimum 8 characters
              </p>
            </div>

            {error && (
              <p className="text-xs text-primary tracking-wide">{error}</p>
            )}

            {success && (
              <p className="text-xs text-emerald-600 tracking-wide">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading || !isFormReady}
              className={`w-full px-8 py-4 text-sm font-bold tracking-widest uppercase transition-all disabled:cursor-not-allowed ${
                loading || !isFormReady
                  ? "bg-primary/50 text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground tracking-wide">
              Already have an account?{" "}
              <Link
                href={next ? `/sign-in?next=${next}` : "/sign-in"}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
