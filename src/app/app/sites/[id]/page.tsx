import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MaterialTable } from "@/components/MaterialTable";
import { ShareSheet } from "@/components/ShareSheet";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { getCompany, requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/share/format";
import type { DailyReport, Site, SiteMaterial } from "@/lib/types";
import { SiteStatusActions } from "@/components/SiteActions";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile();
  const company = await getCompany(profile.company_id!);

  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("id", id)
    .eq("company_id", profile.company_id!)
    .maybeSingle();

  if (!site) notFound();

  const { data: materials } = await supabase
    .from("site_materials")
    .select("*")
    .eq("site_id", id)
    .order("created_at", { ascending: true });

  const { data: reports } = await supabase
    .from("daily_reports")
    .select("*")
    .eq("site_id", id)
    .order("report_date", { ascending: false });

  const siteRow = site as Site;
  const mats = (materials as SiteMaterial[]) || [];

  return (
    <AppShell title={siteRow.site_name} backHref="/app">
      <Card className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{siteRow.customer_name}</p>
            {siteRow.customer_phone && (
              <p className="text-sm text-muted">{siteRow.customer_phone}</p>
            )}
            {siteRow.site_address && (
              <p className="mt-1 text-sm text-muted">{siteRow.site_address}</p>
            )}
            <p className="mt-1 text-sm text-muted">{formatDate(siteRow.site_date)}</p>
          </div>
          <Badge tone={siteRow.status === "completed" ? "success" : "warn"}>
            {siteRow.status === "completed" ? "Completed" : "In Progress"}
          </Badge>
        </div>
        {siteRow.notes && (
          <p className="mt-3 text-sm text-muted">{siteRow.notes}</p>
        )}
        <div className="mt-3">
          <SiteStatusActions siteId={siteRow.id} status={siteRow.status} />
        </div>
      </Card>

      <SectionTitle>Materials — Required vs Used</SectionTitle>
      <MaterialTable materials={mats} />

      <div className="mt-4 grid gap-2">
        <Link href={`/app/sites/${id}/materials`}>
          <Button className="w-full">+ Add Materials</Button>
        </Link>
        <ShareSheet
          mode="materials"
          site={siteRow}
          materials={mats}
          companyName={company?.display_name || company?.name || "PowerLog"}
        />
        <Link href={`/app/sites/${id}/reports/new`}>
          <Button className="w-full" variant="accent">
            Create Daily Report
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        <SectionTitle>Daily Reports</SectionTitle>
        {!reports?.length ? (
          <p className="text-sm text-muted">No daily reports yet.</p>
        ) : (
          <div className="space-y-2">
            {(reports as DailyReport[]).map((r) => (
              <Link key={r.id} href={`/app/reports/${r.id}`}>
                <Card className="mb-2 py-3">
                  <p className="font-medium">{formatDate(r.report_date)}</p>
                  {r.notes && (
                    <p className="truncate text-sm text-muted">{r.notes}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
