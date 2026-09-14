"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { CATEGORIES } from "@/lib/constants";
import { UNITS, type ItemLibrary } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function AddMaterialsPage() {
  const { id: siteId } = useParams<{ id: string }>();
  const router = useRouter();
  const [items, setItems] = useState<ItemLibrary[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState<"library" | "custom">("library");
  const [selected, setSelected] = useState<ItemLibrary | null>(null);
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("Pc");
  const [brand, setBrand] = useState("");
  const [remarks, setRemarks] = useState("");
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("Other");
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
        .from("item_library")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("category")
        .order("name");
      setItems((data as ItemLibrary[]) || []);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat = category === "All" || item.category === category;
      const q = search.trim().toLowerCase();
      const matchQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.brand || "").toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [items, category, search]);

  function pick(item: ItemLibrary) {
    setSelected(item);
    setUnit(item.default_unit);
    setBrand(item.brand || "");
    setMode("library");
  }

  async function addFromLibrary() {
    if (!selected || !companyId) return;
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.from("site_materials").insert({
      site_id: siteId,
      company_id: companyId,
      library_item_id: selected.id,
      name: selected.name,
      category: selected.category,
      brand: brand.trim() || selected.brand,
      unit,
      qty_required: Number(qty) || 0,
      qty_used: 0,
      remarks: remarks.trim() || null,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Item added");
    setQty("1");
    setRemarks("");
    router.refresh();
  }

  async function addCustom() {
    if (!companyId || !customName.trim()) return;
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let libraryItemId: string | null = null;
    if (saveToLibrary) {
      const { data: lib, error: libErr } = await supabase
        .from("item_library")
        .insert({
          company_id: companyId,
          category: customCategory,
          name: customName.trim(),
          default_unit: unit,
          brand: brand.trim() || null,
          created_by: user?.id,
        })
        .select("id")
        .single();
      if (libErr) {
        setLoading(false);
        setMessage(libErr.message);
        return;
      }
      libraryItemId = lib.id;
      setItems((prev) => [
        ...prev,
        {
          id: lib.id,
          company_id: companyId,
          category: customCategory,
          name: customName.trim(),
          default_unit: unit,
          brand: brand.trim() || null,
          created_by: user?.id || null,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    const { error } = await supabase.from("site_materials").insert({
      site_id: siteId,
      company_id: companyId,
      library_item_id: libraryItemId,
      name: customName.trim(),
      category: customCategory,
      brand: brand.trim() || null,
      unit,
      qty_required: Number(qty) || 0,
      qty_used: 0,
      remarks: remarks.trim() || null,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Custom item added");
    setCustomName("");
    setQty("1");
    setRemarks("");
    router.refresh();
  }

  return (
    <AppShell title="Add Materials" backHref={`/app/sites/${siteId}`}>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Button
          variant={mode === "library" ? "primary" : "secondary"}
          onClick={() => setMode("library")}
        >
          Library
        </Button>
        <Button
          variant={mode === "custom" ? "primary" : "secondary"}
          onClick={() => setMode("custom")}
        >
          + Add Custom Item
        </Button>
      </div>

      {mode === "library" && (
        <>
          <Field label="Search">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
            />
          </Field>
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <div className="mb-4 max-h-56 space-y-1 overflow-auto rounded-2xl border border-border bg-card p-2">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pick(item)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                  selected?.id === item.id ? "bg-primary text-primary-fg" : "hover:bg-background"
                }`}
              >
                <span>
                  {item.brand ? `${item.brand} ` : ""}
                  {item.name}
                </span>
                <span className="text-xs opacity-70">{item.default_unit}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="p-3 text-center text-sm text-muted">No items found</p>
            )}
          </div>

          {selected && (
            <Card>
              <p className="mb-3 font-semibold">
                {selected.brand ? `${selected.brand} ` : ""}
                {selected.name}
              </p>
              <Field label="Quantity">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </Field>
              <Field label="Unit">
                <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Brand (optional)">
                <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
              </Field>
              <Field label="Remarks (optional)">
                <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              </Field>
              <Button className="w-full" disabled={loading} onClick={addFromLibrary}>
                {loading ? "Adding…" : "Add Item"}
              </Button>
            </Card>
          )}
        </>
      )}

      {mode === "custom" && (
        <Card>
          <Field label="Item Name">
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="20mm PVC Flexible Conduit"
            />
          </Field>
          <Field label="Quantity">
            <Input
              type="number"
              min="0"
              step="any"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </Field>
          <Field label="Unit">
            <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Brand (optional)">
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
          </Field>
          <Field label="Notes (optional)">
            <Textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Field>
          <label className="mb-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={saveToLibrary}
              onChange={(e) => setSaveToLibrary(e.target.checked)}
            />
            Save this item to my item library
          </label>
          <Button
            className="w-full"
            disabled={loading || !customName.trim()}
            onClick={addCustom}
          >
            {loading ? "Adding…" : "Add Item"}
          </Button>
        </Card>
      )}

      {message && <p className="mt-3 text-center text-sm text-success">{message}</p>}

      <Button
        className="mt-4 w-full"
        variant="secondary"
        onClick={() => router.push(`/app/sites/${siteId}`)}
      >
        Done — Back to Site
      </Button>
    </AppShell>
  );
}
