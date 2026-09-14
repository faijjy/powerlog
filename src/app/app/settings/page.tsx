import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SignOutButton } from "@/components/MaterialTable";
import { Card } from "@/components/ui";
import { getCompany, requireProfile } from "@/lib/auth";
import { SettingsForm } from "@/components/SettingsForm";

export default async function SettingsPage() {
  const { profile } = await requireProfile();
  const company = await getCompany(profile.company_id!);

  return (
    <AppShell title="Settings">
      <Card className="mb-4">
        <p className="text-xs font-semibold uppercase text-muted">Signed in as</p>
        <p className="font-semibold">{profile.full_name}</p>
        <p className="text-sm capitalize text-muted">{profile.role}</p>
        {company && (
          <p className="mt-2 text-sm text-muted">
            Company: {company.display_name || company.name}
          </p>
        )}
      </Card>

      <SettingsForm
        fullName={profile.full_name || ""}
        phone={profile.phone || ""}
        companyName={company?.name || ""}
        displayName={company?.display_name || ""}
        isAdmin={profile.role === "admin"}
        inviteCode={company?.invite_code || ""}
      />

      {profile.role === "admin" && (
        <Link
          href="/admin"
          className="mb-3 block rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-primary"
        >
          Open Admin Panel
        </Link>
      )}

      <SignOutButton />
    </AppShell>
  );
}
