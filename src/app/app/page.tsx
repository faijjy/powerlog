import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, Card, EmptyState, SectionTitle } from "@/components/ui";
import { getCompany, greeting, requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/share/format";
import type { DailyReport, Site } from "@/lib/types";

export default async function AppDashboardPage() {
  const { supabase, profile } = await requireProfile();
  const company = await getCompany(profile.company_id!);
  const today = new Date().toISOString().slice(0, 10);

  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("company_id", profile.company_id!)
    .order("updated_at", { ascending: false });

  const todaySites = ((sites as Site[]) || []).filter(
    (s) => s.site_date === today || s.status === "in_progress"
  );

  const { data: reports } = await supabase
    .from("daily_reports")
    .select("*, sites(site_name)")
    .eq("company_id", profile.company_id!)
    .order("report_date", { ascending: false })
    .limit(8);

  return (
    <AppShell
      right={
        profile.role === "admin" ? (
          <Link href="/admin" className="text-xs font-semibold text-primary">
            Admin
          </Link>
        ) : null
      }
    >
      <div className="mb-6">
        <p className="text-sm text-muted">{greeting()}</p>
        <h1 className="font-display text-2xl font-bold">
          {profile.full_name?.split(" ")[0] || "Electrician"}
        </h1>
        {company && (
          <p className="text-sm text-muted">{company.display_name || company.name}</p>
        )}
      </div>

      <SectionTitle>Today&apos;s Sites</SectionTitle>
      {todaySites.length === 0 ? (
        <EmptyState title="No active sites" hint="Create a site to start logging materials." />
      ) : (
        <div className="space-y-3">
          {todaySites.map((site) => (
            <Link key={site.id} href={`/app/sites/${site.id}`}>
              <Card className="mb-3 transition hover:border-primary/30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{site.site_name}</p>
                    <p className="text-sm text-muted">{site.customer_name}</p>
                  </div>
                  <Badge tone={site.status === "completed" ? "success" : "warn"}>
                    {site.status === "completed" ? "Completed" : "Work In Progress"}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Link href="/app/sites/new" className="mt-4 block">
        <Button className="w-full" variant="accent">
          + New Site
        </Button>
      </Link>

      <div className="mt-8">
        <SectionTitle>Recent Reports</SectionTitle>
        {!reports?.length ? (
          <EmptyState title="No reports yet" />
        ) : (
          <div className="space-y-2">
            {(reports as (DailyReport & { sites: { site_name: string } | null })[]).map(
              (r) => (
                <Link key={r.id} href={`/app/reports/${r.id}`}>
                  <Card className="mb-2 py-3">
                    <p className="font-medium">
                      {formatDate(r.report_date)} — {r.sites?.site_name || "Site"}
                    </p>
                  </Card>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
