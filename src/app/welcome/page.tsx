import { getSessionUser } from "@/lib/auth";
import { LandingPage } from "@/components/LandingPage";

export default async function WelcomePage() {
  const { supabase, user } = await getSessionUser();

  let signedIn = false;
  let appHref = "/onboarding";

  if (user) {
    signedIn = true;
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.company_id) {
      appHref = profile.role === "admin" ? "/admin" : "/app";
    }
  }

  return <LandingPage signedIn={signedIn} appHref={appHref} />;
}
