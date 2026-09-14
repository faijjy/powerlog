"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export function SettingsForm({
  fullName,
  phone,
  companyName,
  displayName,
  isAdmin,
  inviteCode,
}: {
  fullName: string;
  phone: string;
  companyName: string;
  displayName: string;
  isAdmin: boolean;
  inviteCode: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [phoneVal, setPhoneVal] = useState(phone);
  const [coName, setCoName] = useState(companyName);
  const [coDisplay, setCoDisplay] = useState(displayName);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ full_name: name.trim(), phone: phoneVal.trim() || null })
      .eq("id", user.id);

    if (isAdmin) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      if (profile?.company_id) {
        await supabase
          .from("companies")
          .update({
            name: coName.trim(),
            display_name: coDisplay.trim() || coName.trim(),
          })
          .eq("id", profile.company_id);
      }
    }

    setMessage("Saved");
    setLoading(false);
    router.refresh();
  }

  return (
    <Card className="mb-4">
      <Field label="Full name">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Phone">
        <Input value={phoneVal} onChange={(e) => setPhoneVal(e.target.value)} />
      </Field>
      {isAdmin && (
        <>
          <Field label="Company name">
            <Input value={coName} onChange={(e) => setCoName(e.target.value)} />
          </Field>
          <Field label="PDF display name">
            <Input value={coDisplay} onChange={(e) => setCoDisplay(e.target.value)} />
          </Field>
          <Field label="Invite code (share with electricians)">
            <Input value={inviteCode} readOnly className="tracking-widest" />
          </Field>
        </>
      )}
      {message && <p className="mb-2 text-sm text-success">{message}</p>}
      <Button className="w-full" disabled={loading} onClick={save}>
        {loading ? "Saving…" : "Save"}
      </Button>
    </Card>
  );
}
