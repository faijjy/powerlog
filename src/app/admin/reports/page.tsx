import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/share/format";
import type { DailyReport } from "@/lib/types";

export default async function AdminReportsPage() {
  const { supabase, profile } = await requireAdmin();

  const { data: reports } = await supabase
    .from("daily_reports")
    .select("*, sites(site_name), profiles:created_by(full_name)")
    .eq("company_id", profile.company_id!)
    .order("report_date", { ascending: false })
    .limit(50);

  const rows =
    (reports as (DailyReport & {
      sites: { site_name: string } | null;
      profiles: { full_name: string } | null;
    })[]) || [];

  return (
    <AppShell title="Reports" nav="admin">
      {rows.length === 0 ? (
        <EmptyState title="No reports yet" />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
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
      )}
    </AppShell>
  );
}
