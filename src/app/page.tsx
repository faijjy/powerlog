import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Button, Card } from "@/components/ui";

export default async function HomePage() {
  const { supabase, user } = await getSessionUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.company_id) redirect("/onboarding");
    if (profile.role === "admin") redirect("/admin");
    redirect("/app");
  }

  return (
    <div className="relative mx-auto flex min-h-full max-w-lg flex-col justify-end px-4 pb-10 pt-16">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -right-10 top-40 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div
          className="absolute inset-x-0 top-0 h-[55vh] opacity-90"
          style={{
            backgroundImage:
              "linear-gradient(160deg, #1e3a5f 0%, #0f172a 55%, transparent 100%)",
          }}
        />
      </div>

      <div className="mb-auto pt-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          PowerLog
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold leading-tight">
          Site work.
          <br />
          Materials.
          <br />
          Daily reports.
        </h1>
        <p className="mt-4 max-w-sm text-sm text-white/75">
          Built for electricians — add materials in a few taps, track used vs
          required, and share reports on WhatsApp.
        </p>
      </div>

      <Card className="mt-10 space-y-3">
        <Link href="/login" className="block">
          <Button className="w-full">Sign in with OTP</Button>
        </Link>
        <p className="text-center text-xs text-muted">
          No password. Company admins track the team. Electricians run the site.
        </p>
      </Card>
    </div>
  );
}
