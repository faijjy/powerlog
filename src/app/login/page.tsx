"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card } from "@/components/ui";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
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
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 font-display text-2xl font-bold text-primary">
        PowerLog
      </Link>
      <Card>
        <h1 className="font-display text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Use Google to continue as admin or electrician.
        </p>
        <Button
          className="mt-6 w-full"
          disabled={loading}
          onClick={signInWithGoogle}
        >
          {loading ? "Redirecting…" : "Continue with Google"}
        </Button>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <p className="mt-4 text-xs text-muted">
          Enable Google provider in your Supabase project Auth settings and add
          the callback URL.
        </p>
      </Card>
    </div>
  );
}
