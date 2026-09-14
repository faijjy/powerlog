import { redirect } from "next/navigation";
import { getSessionUser, resolveAppHome } from "@/lib/auth";

/** Sends logged-in users to the right dashboard */
export default async function DashboardRedirectPage() {
  const { supabase, user } = await getSessionUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .maybeSingle();

  redirect(resolveAppHome(profile));
}
