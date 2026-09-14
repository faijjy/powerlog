"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Card, EmptyState, Field, Input, Select } from "@/components/ui";
import { CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { UNITS, type ItemLibrary } from "@/lib/types";

export default function LibraryPage() {
  const [items, setItems] = useState<ItemLibrary[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ItemLibrary | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Other",
    default_unit: "Pc",
    brand: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
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

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.brand || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setForm({ name: "", category: "Other", default_unit: "Pc", brand: "" });
  }

  function startEdit(item: ItemLibrary) {
    setEditing(item);
    setCreating(false);
    setForm({
      name: item.name,
      category: item.category,
      default_unit: item.default_unit,
      brand: item.brand || "",
    });
  }

  async function save() {
    if (!companyId || !form.name.trim()) return;
    const supabase = createClient();
    setMessage(null);
    if (editing) {
      const { error } = await supabase
        .from("item_library")
        .update({
          name: form.name.trim(),
          category: form.category,
          default_unit: form.default_unit,
          brand: form.brand.trim() || null,
        })
        .eq("id", editing.id);
      if (error) {
        setMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("item_library").insert({
        company_id: companyId,
        name: form.name.trim(),
        category: form.category,
        default_unit: form.default_unit,
        brand: form.brand.trim() || null,
        created_by: userId,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
    }
    setCreating(false);
    setEditing(null);
    setMessage("Saved");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this library item?")) return;
    const supabase = createClient();
    await supabase.from("item_library").delete().eq("id", id);
    await load();
  }

  return (
    <AppShell title="Item Library">
      <Field label="Search">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items…"
        />
      </Field>

      <Button className="mb-4 w-full" variant="accent" onClick={startCreate}>
        + Add New Item
      </Button>

      {(creating || editing) && (
        <Card className="mb-4">
          <h3 className="mb-3 font-semibold">
            {editing ? "Edit Item" : "New Item"}
          </h3>
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Default Unit">
            <Select
              value={form.default_unit}
              onChange={(e) =>
                setForm((f) => ({ ...f, default_unit: e.target.value }))
              }
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Brand">
            <Input
              value={form.brand}
              onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
            />
          </Field>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}>
              Save
            </Button>
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {message && <p className="mb-3 text-center text-sm text-success">{message}</p>}

      {filtered.length === 0 ? (
        <EmptyState title="No items" hint="Add your first library item." />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <Card key={item.id} className="py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {item.brand ? `${item.brand} ` : ""}
                    {item.name}
                  </p>
                  <p className="text-xs text-muted">
                    {item.category} · {item.default_unit}
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    className="text-primary"
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-danger"
                    onClick={() => remove(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
