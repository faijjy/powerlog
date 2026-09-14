"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Field, Input } from "@/components/ui";

export default function OnboardingPage() {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [companyName, setCompanyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Hard navigate so we don't get stuck on the loading button
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

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-primary">Welcome</h1>
      <p className="mt-1 text-sm text-muted">
        Create a company (admin) or join with an invite code (electrician).
      </p>

      {mode === "choose" && (
        <div className="mt-8 space-y-3">
          <Button className="w-full" onClick={() => setMode("create")}>
            Create Company (Admin)
          </Button>
          <Button className="w-full" variant="secondary" onClick={() => setMode("join")}>
            Join with Invite Code
          </Button>
        </div>
      )}

      {mode === "create" && (
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

      {mode === "join" && (
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
