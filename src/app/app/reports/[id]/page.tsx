import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MaterialTable } from "@/components/MaterialTable";
import { ShareSheet } from "@/components/ShareSheet";
import { Card, SectionTitle } from "@/components/ui";
import { getCompany, requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/share/format";
import type {
  DailyReport,
  DailyReportPhoto,
  DailyReportWork,
  Site,
  SiteMaterial,
} from "@/lib/types";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile();
  const company = await getCompany(profile.company_id!);

  const { data: report } = await supabase
    .from("daily_reports")
    .select("*")
    .eq("id", id)
    .eq("company_id", profile.company_id!)
    .maybeSingle();

  if (!report) notFound();

  const reportRow = report as DailyReport;

  const [{ data: site }, { data: work }, { data: materials }, { data: photos }, { data: author }] =
    await Promise.all([
      supabase.from("sites").select("*").eq("id", reportRow.site_id).single(),
      supabase.from("daily_report_work").select("*").eq("report_id", id),
      supabase.from("site_materials").select("*").eq("site_id", reportRow.site_id),
      supabase.from("daily_report_photos").select("*").eq("report_id", id),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", reportRow.created_by)
        .maybeSingle(),
    ]);

  if (!site) notFound();

  const siteRow = site as Site;
  const workRows = (work as DailyReportWork[]) || [];
  const mats = (materials as SiteMaterial[]) || [];
  const photoRows = (photos as DailyReportPhoto[]) || [];

  const photoUrls = photoRows.map((p) => {
    const { data } = supabase.storage.from("report-photos").getPublicUrl(p.storage_path);
    return data.publicUrl;
  });

  return (
    <AppShell title="Daily Report" backHref={`/app/sites/${siteRow.id}`}>
      <Card className="mb-4">
        <p className="font-display text-lg font-semibold">{siteRow.site_name}</p>
        <p className="text-sm text-muted">{siteRow.customer_name}</p>
        <p className="mt-1 text-sm text-muted">{formatDate(reportRow.report_date)}</p>
        {author?.full_name && (
          <p className="mt-1 text-sm text-muted">By {author.full_name}</p>
        )}
      </Card>

      <SectionTitle>Work Completed</SectionTitle>
      <Card className="mb-4">
        <ul className="space-y-2 text-sm">
          {workRows.map((w) => (
            <li key={w.id} className="flex justify-between gap-2">
              <span>{w.name}</span>
              <span className="tabular-nums font-semibold">
                {w.quantity} {w.unit}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <SectionTitle>Materials</SectionTitle>
      <MaterialTable materials={mats} editable={false} />

      {(reportRow.pending_work || reportRow.notes) && (
        <Card className="mt-4">
          {reportRow.pending_work && (
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase text-muted">Pending</p>
              <p className="text-sm">{reportRow.pending_work}</p>
            </div>
          )}
          {reportRow.notes && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{reportRow.notes}</p>
            </div>
          )}
        </Card>
      )}

      {photoUrls.length > 0 && (
        <div className="mt-4">
          <SectionTitle>Photos</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {photoUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt="Site work"
                className="h-32 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <ShareSheet
          mode="report"
          site={siteRow}
          materials={mats}
          companyName={company?.display_name || company?.name || "PowerLog"}
          reportDate={reportRow.report_date}
          work={workRows}
          notes={reportRow.notes}
          pendingWork={reportRow.pending_work}
          electricianName={author?.full_name}
        />
      </div>
    </AppShell>
  );
}
