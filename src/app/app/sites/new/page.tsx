"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function NewSitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    site_name: "",
    site_address: "",
    site_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in");
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) {
      setError("No company");
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from("sites")
      .insert({
        company_id: profile.company_id,
        created_by: user.id,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim() || null,
        site_name: form.site_name.trim(),
        site_address: form.site_address.trim() || null,
        site_date: form.site_date,
        notes: form.notes.trim() || null,
      })
      .select("id")
      .single();

    if (err || !data) {
      setError(err?.message || "Failed to create site");
      setLoading(false);
      return;
    }

    router.push(`/app/sites/${data.id}`);
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <AppShell title="New Site" backHref="/app">
      <Card>
        <form onSubmit={onSubmit}>
          <Field label="Customer Name">
            <Input
              required
              value={form.customer_name}
              onChange={(e) => set("customer_name", e.target.value)}
              placeholder="Sharma Residence"
            />
          </Field>
          <Field label="Customer Phone">
            <Input
              type="tel"
              value={form.customer_phone}
              onChange={(e) => set("customer_phone", e.target.value)}
              placeholder="9876543210"
            />
          </Field>
          <Field label="Site Name">
            <Input
              required
              value={form.site_name}
              onChange={(e) => set("site_name", e.target.value)}
              placeholder="Sharma Residence — Flat 402"
            />
          </Field>
          <Field label="Site Address">
            <Input
              value={form.site_address}
              onChange={(e) => set("site_address", e.target.value)}
              placeholder="12 MG Road, Pune"
            />
          </Field>
          <Field label="Date">
            <Input
              type="date"
              required
              value={form.site_date}
              onChange={(e) => set("site_date", e.target.value)}
            />
          </Field>
          <Field label="Notes (optional)">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Main DB location, access notes…"
            />
          </Field>
          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create Site"}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
