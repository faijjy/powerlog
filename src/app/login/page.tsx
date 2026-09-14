"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Field, Input } from "@/components/ui";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    setInfo(null);
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
      setLoading(false);
    }
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    setEmailLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setInfo("Check your email for the magic link to sign in.");
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 font-display text-2xl font-bold text-primary">
        PowerLog
      </Link>
      <Card>
        <h1 className="font-display text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Continue as admin or electrician.
        </p>
        <Button
          className="mt-6 w-full"
          disabled={loading}
          onClick={signInWithGoogle}
        >
          {loading ? "Redirecting…" : "Continue with Google"}
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-border" />
          or email magic link
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={signInWithEmail}>
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Button
            className="w-full"
            variant="secondary"
            type="submit"
            disabled={emailLoading || !email.trim()}
          >
            {emailLoading ? "Sending…" : "Send magic link"}
          </Button>
        </form>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        {info && <p className="mt-3 text-sm text-success">{info}</p>}
      </Card>
    </div>
  );
}
