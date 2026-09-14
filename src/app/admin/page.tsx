import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle } from "@/components/ui";
import { getCompany, requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/share/format";
import type { DailyReport, Profile, Site } from "@/lib/types";

export default async function AdminOverviewPage() {
  const { supabase, profile } = await requireAdmin();
  const company = await getCompany(profile.company_id!);
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: team }, { data: sites }, { data: reports }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("company_id", profile.company_id!)
      .eq("role", "electrician"),
    supabase
      .from("sites")
      .select("*")
      .eq("company_id", profile.company_id!)
      .eq("status", "in_progress"),
    supabase
      .from("daily_reports")
      .select("*, sites(site_name), profiles:created_by(full_name)")
      .eq("company_id", profile.company_id!)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const electricians = (team as Profile[]) || [];
  const activeSites = (sites as Site[]) || [];
  const todaySites = activeSites.filter((s) => s.site_date === today);

  return (
    <AppShell nav="admin">
      <div className="mb-6">
        <p className="text-sm text-muted">Admin</p>
        <h1 className="font-display text-2xl font-bold">
          {company?.display_name || company?.name || "Company"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Invite code:{" "}
          <span className="font-semibold tracking-widest text-primary">
            {company?.invite_code}
          </span>
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs uppercase text-muted">Electricians</p>
          <p className="font-display text-3xl font-bold">{electricians.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Active sites</p>
          <p className="font-display text-3xl font-bold">{activeSites.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Sites today</p>
          <p className="font-display text-3xl font-bold">{todaySites.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Recent reports</p>
          <p className="font-display text-3xl font-bold">{reports?.length || 0}</p>
        </Card>
      </div>

      <div className="mb-4 flex gap-2">
        <Link
          href="/app"
          className="flex-1 rounded-xl border border-border bg-card py-3 text-center text-sm font-semibold text-primary"
        >
          Electrician App
        </Link>
        <Link
          href="/admin/library"
          className="flex-1 rounded-xl border border-border bg-card py-3 text-center text-sm font-semibold text-primary"
        >
          Library
        </Link>
      </div>

      <SectionTitle>Working today</SectionTitle>
      {todaySites.length === 0 ? (
        <p className="mb-6 text-sm text-muted">No sites dated today.</p>
      ) : (
        <div className="mb-6 space-y-2">
          {todaySites.map((s) => (
            <Card key={s.id} className="py-3">
              <p className="font-medium">{s.site_name}</p>
              <p className="text-sm text-muted">{s.customer_name}</p>
            </Card>
          ))}
        </div>
      )}

      <SectionTitle>Latest reports</SectionTitle>
      <div className="space-y-2">
        {(
          reports as
            | (DailyReport & {
                sites: { site_name: string } | null;
                profiles: { full_name: string } | null;
              })[]
            | null
        )?.map((r) => (
          <Link key={r.id} href={`/app/reports/${r.id}`}>
            <Card className="mb-2 py-3">
              <p className="font-medium">
                {formatDate(r.report_date)} — {r.sites?.site_name}
              </p>
              <p className="text-sm text-muted">
                {r.profiles?.full_name || "Electrician"}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
