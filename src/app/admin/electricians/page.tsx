import { AppShell } from "@/components/AppShell";
import { Card, EmptyState, SectionTitle } from "@/components/ui";
import { getCompany, requireAdmin } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export default async function AdminElectriciansPage() {
  const { supabase, profile } = await requireAdmin();
  const company = await getCompany(profile.company_id!);

  const { data: team } = await supabase
    .from("profiles")
    .select("*")
    .eq("company_id", profile.company_id!)
    .order("full_name");

  const members = (team as Profile[]) || [];
  const electricians = members.filter((m) => m.role === "electrician");
  const admins = members.filter((m) => m.role === "admin");

  return (
    <AppShell title="Team" nav="admin">
      <Card className="mb-4">
        <p className="text-xs font-semibold uppercase text-muted">Invite code</p>
        <p className="font-display text-2xl font-bold tracking-widest text-primary">
          {company?.invite_code}
        </p>
        <p className="mt-2 text-sm text-muted">
          Share this code with electricians so they can join after Google sign-in.
        </p>
      </Card>

      <SectionTitle>Admins ({admins.length})</SectionTitle>
      <div className="mb-6 space-y-2">
        {admins.map((m) => (
          <Card key={m.id} className="py-3">
            <p className="font-medium">{m.full_name || "Admin"}</p>
            {m.phone && <p className="text-sm text-muted">{m.phone}</p>}
          </Card>
        ))}
      </div>

      <SectionTitle>Electricians ({electricians.length})</SectionTitle>
      {electricians.length === 0 ? (
        <EmptyState
          title="No electricians yet"
          hint="Share the invite code so your team can join."
        />
      ) : (
        <div className="space-y-2">
          {electricians.map((m) => (
            <Card key={m.id} className="py-3">
              <p className="font-medium">{m.full_name || "Electrician"}</p>
              {m.phone && <p className="text-sm text-muted">{m.phone}</p>}
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
