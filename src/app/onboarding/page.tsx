"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Field, Input } from "@/components/ui";

export default function OnboardingPage() {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [companyName, setCompanyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadySetUp, setAlreadySetUp] = useState(false);
  const [appHref, setAppHref] = useState("/app");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkExisting() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setChecking(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id, role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.full_name) setFullName(profile.full_name);

      if (profile?.company_id) {
        setAlreadySetUp(true);
        setAppHref(profile.role === "admin" ? "/admin" : "/app");
      }
      setChecking(false);
    }
    checkExisting();
  }, []);

  async function saveName() {
    if (!fullName.trim()) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", user.id);
  }

  async function createCompany() {
    setLoading(true);
    setError(null);
    try {
      await saveName();
      const supabase = createClient();
      const { error: err } = await supabase.rpc("create_company", {
        p_name: companyName.trim(),
        p_display_name: displayName.trim() || companyName.trim(),
      });
      if (err) throw err;
      window.location.assign("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create company");
      setLoading(false);
    }
  }

  async function joinCompany() {
    setLoading(true);
    setError(null);
    try {
      await saveName();
      const supabase = createClient();
      const { error: err } = await supabase.rpc("join_company", {
        p_invite_code: inviteCode.trim(),
      });
      if (err) throw err;
      window.location.assign("/app");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join company");
      setLoading(false);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  if (checking) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center px-4 py-10">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/" className="font-display text-lg font-bold text-primary">
          PowerLog
        </Link>
        <div className="flex gap-3 text-sm font-semibold">
          <Link href="/" className="text-muted hover:text-primary">
            Home
          </Link>
          <Link href="/login" className="text-primary">
            Log in
          </Link>
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold text-primary">Welcome</h1>
      <p className="mt-1 text-sm text-muted">
        Create a company (admin) or join with an invite code (electrician).
      </p>

      {alreadySetUp && (
        <Card className="mt-6">
          <p className="font-medium">You already have a company set up.</p>
          <Button className="mt-4 w-full" onClick={() => (window.location.href = appHref)}>
            Open app
          </Button>
          <Button className="mt-2 w-full" variant="secondary" onClick={signOut}>
            Log out & log in as someone else
          </Button>
          <Link href="/" className="mt-3 block text-center text-sm font-semibold text-primary">
            Back to home
          </Link>
        </Card>
      )}

      {!alreadySetUp && mode === "choose" && (
        <div className="mt-8 space-y-3">
          <Button className="w-full" onClick={() => setMode("create")}>
            Create Company (Admin)
          </Button>
          <Button className="w-full" variant="secondary" onClick={() => setMode("join")}>
            Join with Invite Code
          </Button>
          <p className="pt-2 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Log in
            </Link>
          </p>
          <Button className="w-full" variant="ghost" onClick={signOut}>
            Not you? Log out
          </Button>
        </div>
      )}

      {!alreadySetUp && mode === "create" && (
        <Card className="mt-6">
          <Field label="Your name">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ramesh Kumar"
            />
          </Field>
          <Field label="Company name">
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Sharma Electricals"
            />
          </Field>
          <Field label="Display name on PDFs (optional)">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Sharma Electricals Pvt Ltd"
            />
          </Field>
          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button
            className="w-full"
            disabled={loading || !companyName.trim()}
            onClick={createCompany}
          >
            {loading ? "Creating…" : "Create Company"}
          </Button>
          <Button className="mt-2 w-full" variant="ghost" onClick={() => setMode("choose")}>
            Back
          </Button>
        </Card>
      )}

      {!alreadySetUp && mode === "join" && (
        <Card className="mt-6">
          <Field label="Your name">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ramesh Kumar"
            />
          </Field>
          <Field label="Invite code">
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABCD1234"
              className="uppercase tracking-widest"
            />
          </Field>
          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button
            className="w-full"
            disabled={loading || !inviteCode.trim()}
            onClick={joinCompany}
          >
            {loading ? "Joining…" : "Join Company"}
          </Button>
          <Button className="mt-2 w-full" variant="ghost" onClick={() => setMode("choose")}>
            Back
          </Button>
        </Card>
      )}
    </div>
  );
}
