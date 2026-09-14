import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LandingPage } from "@/components/LandingPage";

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

  return <LandingPage />;
}
