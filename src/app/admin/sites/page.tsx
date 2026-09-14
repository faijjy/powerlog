import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, EmptyState } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/share/format";
import type { Site } from "@/lib/types";

export default async function AdminSitesPage() {
  const { supabase, profile } = await requireAdmin();

  const { data: sites } = await supabase
    .from("sites")
    .select("*, profiles:created_by(full_name)")
    .eq("company_id", profile.company_id!)
    .order("updated_at", { ascending: false });

  const rows =
    (sites as (Site & { profiles: { full_name: string } | null })[]) || [];

  return (
    <AppShell title="All Sites" nav="admin">
      {rows.length === 0 ? (
        <EmptyState title="No sites yet" />
      ) : (
        <div className="space-y-2">
          {rows.map((s) => (
            <Link key={s.id} href={`/app/sites/${s.id}`}>
              <Card className="mb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{s.site_name}</p>
                    <p className="text-sm text-muted">{s.customer_name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(s.site_date)} · {s.profiles?.full_name || "—"}
                    </p>
                  </div>
                  <Badge tone={s.status === "completed" ? "success" : "warn"}>
                    {s.status === "completed" ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
