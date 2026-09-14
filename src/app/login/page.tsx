"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Field, Input } from "@/components/ui";
import Link from "next/link";

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [existingHref, setExistingHref] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id, role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.company_id) {
        setExistingHref("/dashboard");
      } else {
        setExistingHref("/onboarding");
      }
    }
    check();
  }, []);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
      },
    });
    setSending(false);
    if (err) {
      setError(err.message);
      return;
    }
    setStep("otp");
    setInfo("Enter the 6-digit code from your email.");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: "email",
    });
    if (err) {
      setError(err.message);
      setVerifying(false);
      return;
    }
    window.location.assign("/dashboard");
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    setError(null);
    const supabase = createClient();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setExistingHref(null);
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold text-primary">
          PowerLog
        </Link>
        <Link href="/" className="text-sm font-semibold text-muted hover:text-primary">
          Home
        </Link>
      </div>
      <Card>
        <h1 className="font-display text-xl font-semibold">Log in</h1>
        <p className="mt-1 text-sm text-muted">
          Existing users and new users — same OTP, no password.
        </p>

        {existingHref && (
          <div className="mt-4 rounded-xl border border-border bg-background p-3">
            <p className="text-sm text-muted">You are already logged in.</p>
            <Button
              className="mt-3 w-full"
              onClick={() => (window.location.href = existingHref)}
            >
              Continue to app
            </Button>
            <Button className="mt-2 w-full" variant="secondary" onClick={signOut}>
              Log out to use another account
            </Button>
          </div>
        )}

        {step === "email" ? (
          <form className="mt-6" onSubmit={sendOtp}>
            <Field label="Email">
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Button
              className="w-full"
              type="submit"
              disabled={sending || !email.trim()}
            >
              {sending ? "Sending code…" : "Log in with OTP"}
            </Button>
          </form>
        ) : (
          <form className="mt-6" onSubmit={verifyOtp}>
            <p className="mb-3 text-sm text-muted">
              Code sent to <span className="font-medium text-foreground">{email}</span>
            </p>
            <Field label="6-digit OTP">
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                required
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="tracking-[0.35em] text-center text-lg"
              />
            </Field>
            <Button
              className="w-full"
              type="submit"
              disabled={verifying || otp.trim().length < 6}
            >
              {verifying ? "Verifying…" : "Verify & log in"}
            </Button>
            <Button
              className="mt-2 w-full"
              type="button"
              variant="ghost"
              disabled={sending}
              onClick={() => {
                setStep("email");
                setOtp("");
                setInfo(null);
                setError(null);
              }}
            >
              Change email
            </Button>
            <Button
              className="mt-1 w-full"
              type="button"
              variant="secondary"
              disabled={sending}
              onClick={async () => {
                setSending(true);
                setError(null);
                const supabase = createClient();
                const { error: err } = await supabase.auth.signInWithOtp({
                  email: email.trim(),
                  options: { shouldCreateUser: true },
                });
                setSending(false);
                if (err) setError(err.message);
                else setInfo("New code sent.");
              }}
            >
              {sending ? "Sending…" : "Resend code"}
            </Button>
          </form>
        )}

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          className="w-full"
          variant="secondary"
          disabled={googleLoading}
          onClick={signInWithGoogle}
        >
          {googleLoading ? "Redirecting…" : "Log in with Google"}
        </Button>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        {info && <p className="mt-3 text-sm text-success">{info}</p>}
      </Card>
    </div>
  );
}
