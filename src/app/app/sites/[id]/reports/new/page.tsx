"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { WorkLibrary } from "@/lib/types";
import { UNITS } from "@/lib/types";

type WorkDraft = {
  key: string;
  work_library_id: string | null;
  name: string;
  quantity: string;
  unit: string;
};

export default function NewDailyReportPage() {
  const { id: siteId } = useParams<{ id: string }>();
  const router = useRouter();
  const [workLib, setWorkLib] = useState<WorkLibrary[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState("");
  const [workItems, setWorkItems] = useState<WorkDraft[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customQty, setCustomQty] = useState("1");
  const [customUnit, setCustomUnit] = useState("Job");
  const [saveCustomWork, setSaveCustomWork] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      if (!profile?.company_id) return;
      setCompanyId(profile.company_id);
      const { data } = await supabase
        .from("work_library")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("name");
      const libs = (data as WorkLibrary[]) || [];
      setWorkLib(libs);
      setWorkItems(
        libs.slice(0, 6).map((w) => ({
          key: w.id,
          work_library_id: w.id,
          name: w.name,
          quantity: "0",
          unit: w.default_unit,
        }))
      );
    }
    load();
  }, []);

  function updateWork(key: string, patch: Partial<WorkDraft>) {
    setWorkItems((items) =>
      items.map((w) => (w.key === key ? { ...w, ...patch } : w))
    );
  }

  function addCustomWork() {
    if (!customName.trim()) return;
    setWorkItems((items) => [
      ...items,
      {
        key: `custom-${Date.now()}`,
        work_library_id: null,
        name: customName.trim(),
        quantity: customQty,
        unit: customUnit,
      },
    ]);
    setCustomName("");
    setCustomQty("1");
    setCustomOpen(false);
  }

  async function submit() {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in");
      setLoading(false);
      return;
    }

    const activeWork = workItems.filter((w) => Number(w.quantity) > 0);
    if (activeWork.length === 0) {
      setError("Add at least one completed work item with quantity > 0");
      setLoading(false);
      return;
    }

    // Save new custom work types to library
    for (const w of activeWork) {
      if (!w.work_library_id && saveCustomWork) {
        const exists = workLib.some(
          (l) => l.name.toLowerCase() === w.name.toLowerCase()
        );
        if (!exists) {
          await supabase.from("work_library").insert({
            company_id: companyId,
            name: w.name,
            default_unit: w.unit,
            created_by: user.id,
          });
        }
      }
    }

    const { data: report, error: reportErr } = await supabase
      .from("daily_reports")
      .insert({
        site_id: siteId,
        company_id: companyId,
        created_by: user.id,
        report_date: reportDate,
        notes: notes.trim() || null,
        pending_work: pending.trim() || null,
      })
      .select("id")
      .single();

    if (reportErr || !report) {
      setError(reportErr?.message || "Failed to create report");
      setLoading(false);
      return;
    }

    const { error: workErr } = await supabase.from("daily_report_work").insert(
      activeWork.map((w) => ({
        report_id: report.id,
        work_library_id: w.work_library_id,
        name: w.name,
        quantity: Number(w.quantity),
        unit: w.unit,
      }))
    );

    if (workErr) {
      setError(workErr.message);
      setLoading(false);
      return;
    }

    for (const file of photos) {
      const path = `${companyId}/${report.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("report-photos")
        .upload(path, file);
      if (!upErr) {
        await supabase.from("daily_report_photos").insert({
          report_id: report.id,
          storage_path: path,
        });
      }
    }

    router.push(`/app/reports/${report.id}`);
  }

  return (
    <AppShell title="Daily Report" backHref={`/app/sites/${siteId}`}>
      <Card className="mb-4">
        <Field label="Date">
          <Input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
          />
        </Field>
      </Card>

      <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
        Work Completed
      </h2>
      <div className="space-y-2">
        {workItems.map((w) => (
          <Card key={w.key} className="py-3">
            <p className="mb-2 font-medium">{w.name}</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Qty">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={w.quantity}
                  onChange={(e) => updateWork(w.key, { quantity: e.target.value })}
                />
              </Field>
              <Field label="Unit">
                <Select
                  value={w.unit}
                  onChange={(e) => updateWork(w.key, { unit: e.target.value })}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>
        ))}
      </div>

      <Button
        className="mt-3 w-full"
        variant="secondary"
        onClick={() => setCustomOpen((v) => !v)}
      >
        + Add Custom Work
      </Button>

      {customOpen && (
        <Card className="mt-3">
          <Field label="Work name">
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="DB box wiring completed"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Quantity">
              <Input
                type="number"
                value={customQty}
                onChange={(e) => setCustomQty(e.target.value)}
              />
            </Field>
            <Field label="Unit">
              <Select value={customUnit} onChange={(e) => setCustomUnit(e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <label className="mb-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={saveCustomWork}
              onChange={(e) => setSaveCustomWork(e.target.checked)}
            />
            Save custom work to library
          </label>
          <Button className="w-full" onClick={addCustomWork}>
            Add Work
          </Button>
        </Card>
      )}

      <Card className="mt-4">
        <Field label="Notes">
          <Textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bedroom and living room wiring completed…"
          />
        </Field>
        <Field label="Pending Work">
          <Textarea
            rows={2}
            value={pending}
            onChange={(e) => setPending(e.target.value)}
            placeholder="Kitchen wiring pending…"
          />
        </Field>
        <Field label="Site Photos (optional)">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotos(Array.from(e.target.files || []))}
          />
        </Field>
      </Card>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <Button className="mt-4 w-full" variant="accent" disabled={loading} onClick={submit}>
        {loading ? "Saving…" : "Save Daily Report"}
      </Button>
    </AppShell>
  );
}
