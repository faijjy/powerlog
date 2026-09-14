"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SiteMaterial } from "@/lib/types";
import { Button } from "@/components/ui";

export function MaterialTable({
  materials,
  editable = true,
}: {
  materials: SiteMaterial[];
  editable?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function updateQty(id: string, field: "qty_required" | "qty_used", delta: number) {
    setBusy(id + field);
    const supabase = createClient();
    const row = materials.find((m) => m.id === id);
    if (!row) return;
    const next = Math.max(0, Number(row[field]) + delta);
    await supabase.from("site_materials").update({ [field]: next }).eq("id", id);
    router.refresh();
    setBusy(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    setBusy(id);
    const supabase = createClient();
    await supabase.from("site_materials").delete().eq("id", id);
    router.refresh();
    setBusy(null);
  }

  if (materials.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
        No materials yet. Add from library or create a custom item.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-primary/5 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-3 py-2 font-semibold">Item</th>
            <th className="px-2 py-2 text-right font-semibold">Req</th>
            <th className="px-2 py-2 text-right font-semibold">Used</th>
            <th className="px-2 py-2 text-right font-semibold">Left</th>
            {editable && <th className="px-2 py-2 font-semibold"> </th>}
          </tr>
        </thead>
        <tbody>
          {materials.map((m) => {
            const rem = Number(m.qty_required) - Number(m.qty_used);
            return (
              <tr key={m.id} className="border-t border-border align-top">
                <td className="px-3 py-3">
                  <div className="font-medium">
                    {m.brand ? `${m.brand} ` : ""}
                    {m.name}
                  </div>
                  <div className="text-xs text-muted">{m.unit}</div>
                  {editable && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <QtyBtn
                        label="Req −"
                        disabled={busy === m.id + "qty_required"}
                        onClick={() => updateQty(m.id, "qty_required", -1)}
                      />
                      <QtyBtn
                        label="Req +"
                        disabled={busy === m.id + "qty_required"}
                        onClick={() => updateQty(m.id, "qty_required", 1)}
                      />
                      <QtyBtn
                        label="Used −"
                        disabled={busy === m.id + "qty_used"}
                        onClick={() => updateQty(m.id, "qty_used", -1)}
                      />
                      <QtyBtn
                        label="Used +"
                        disabled={busy === m.id + "qty_used"}
                        onClick={() => updateQty(m.id, "qty_used", 1)}
                      />
                    </div>
                  )}
                </td>
                <td className="px-2 py-3 text-right tabular-nums">{m.qty_required}</td>
                <td className="px-2 py-3 text-right tabular-nums">{m.qty_used}</td>
                <td
                  className={`px-2 py-3 text-right tabular-nums font-semibold ${
                    rem > 0 ? "text-accent-fg" : "text-success"
                  }`}
                >
                  {rem}
                </td>
                {editable && (
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      className="text-xs font-semibold text-danger"
                      disabled={busy === m.id}
                      onClick={() => remove(m.id)}
                    >
                      Del
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QtyBtn({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold text-primary disabled:opacity-40"
    >
      {label}
    </button>
  );
}

export function SimpleMaterialTable({ materials }: { materials: SiteMaterial[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-primary/5 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-3 py-2">Item</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2">Unit</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m) => (
            <tr key={m.id} className="border-t border-border">
              <td className="px-3 py-2.5 font-medium">
                {m.brand ? `${m.brand} ` : ""}
                {m.name}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">{m.qty_required}</td>
              <td className="px-3 py-2.5 text-muted">{m.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
    >
      Sign out
    </Button>
  );
}
