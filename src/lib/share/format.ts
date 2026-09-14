import type { DailyReportWork, Site, SiteMaterial } from "@/lib/types";

function pad(str: string, len: number) {
  return str.length >= len ? str.slice(0, len) : str + " ".repeat(len - str.length);
}

function padLeft(str: string, len: number) {
  return str.length >= len ? str.slice(0, len) : " ".repeat(len - str.length) + str;
}

export function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + (dateStr.length === 10 ? "T00:00:00" : "")).toLocaleDateString(
      "en-IN",
      { day: "numeric", month: "short", year: "numeric" }
    );
  } catch {
    return dateStr;
  }
}

export function materialsWhatsAppTable(site: Site, materials: SiteMaterial[]) {
  const lines = [
    "SITE MATERIAL REQUIREMENT",
    "",
    `Site: ${site.site_name}`,
    `Customer: ${site.customer_name}`,
    `Date: ${formatDate(site.site_date)}`,
    "",
    `${pad("Item", 22)}${padLeft("Qty", 8)}  Unit`,
    "-----------------------------------",
  ];

  for (const m of materials) {
    const name = m.brand ? `${m.brand} ${m.name}` : m.name;
    lines.push(
      `${pad(name, 22)}${padLeft(String(m.qty_required), 8)}  ${m.unit}`
    );
  }

  if (site.notes) {
    lines.push("", `Notes: ${site.notes}`);
  }

  return lines.join("\n");
}

export function materialsWhatsAppText(site: Site, materials: SiteMaterial[]) {
  const lines = [
    "SITE MATERIAL REQUIREMENT",
    "",
    `Site: ${site.site_name}`,
    `Customer: ${site.customer_name}`,
    `Date: ${formatDate(site.site_date)}`,
    "",
    "Required Materials:",
    "",
  ];

  for (const m of materials) {
    const name = m.brand ? `${m.brand} ${m.name}` : m.name;
    lines.push(`- ${name}: ${m.qty_required} ${m.unit}`);
  }

  lines.push("", `Total Items: ${materials.length}`);
  if (site.notes) lines.push("", `Notes: ${site.notes}`);
  return lines.join("\n");
}

export function dailyReportWhatsAppTable(
  site: Site,
  reportDate: string,
  work: DailyReportWork[],
  materials: SiteMaterial[],
  notes?: string | null,
  pending?: string | null
) {
  const lines = [
    "DAILY WORK REPORT",
    "",
    `Site: ${site.site_name}`,
    `Customer: ${site.customer_name}`,
    `Date: ${formatDate(reportDate)}`,
    "",
    "Work Completed",
    "-----------------------------------",
  ];

  for (const w of work) {
    lines.push(`${pad(w.name, 22)}${padLeft(String(w.quantity), 8)}  ${w.unit}`);
  }

  lines.push("", "Materials", "-----------------------------------");
  lines.push(
    `${pad("Item", 18)}${padLeft("Req", 6)}${padLeft("Used", 6)}${padLeft("Left", 6)}`
  );

  for (const m of materials) {
    const rem = Number(m.qty_required) - Number(m.qty_used);
    const name = m.brand ? `${m.brand} ${m.name}` : m.name;
    lines.push(
      `${pad(name, 18)}${padLeft(String(m.qty_required), 6)}${padLeft(String(m.qty_used), 6)}${padLeft(String(rem), 6)}`
    );
  }

  if (pending) lines.push("", `Pending: ${pending}`);
  if (notes) lines.push("", `Notes: ${notes}`);
  return lines.join("\n");
}

export function dailyReportWhatsAppText(
  site: Site,
  reportDate: string,
  work: DailyReportWork[],
  materials: SiteMaterial[],
  notes?: string | null,
  pending?: string | null
) {
  const lines = [
    "DAILY WORK REPORT",
    "",
    `Site: ${site.site_name}`,
    `Customer: ${site.customer_name}`,
    `Date: ${formatDate(reportDate)}`,
    "",
    "Work Completed:",
    "",
  ];

  for (const w of work) {
    lines.push(`- ${w.name}: ${w.quantity} ${w.unit}`);
  }

  lines.push("", "Materials Used:");
  for (const m of materials) {
    const rem = Number(m.qty_required) - Number(m.qty_used);
    const name = m.brand ? `${m.brand} ${m.name}` : m.name;
    lines.push(
      `- ${name}: Required ${m.qty_required}, Used ${m.qty_used}, Remaining ${rem} ${m.unit}`
    );
  }

  if (pending) lines.push("", `Pending Work: ${pending}`);
  if (notes) lines.push("", `Notes: ${notes}`);
  return lines.join("\n");
}

export function whatsappShareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function shareOrCopy(text: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch {
      // fall through
    }
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}
