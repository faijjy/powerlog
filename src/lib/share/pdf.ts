import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DailyReportWork, Site, SiteMaterial } from "@/lib/types";
import { formatDate } from "./format";

type MaterialPdfOpts = {
  companyName: string;
  site: Site;
  materials: SiteMaterial[];
};

type ReportPdfOpts = {
  companyName: string;
  site: Site;
  reportDate: string;
  work: DailyReportWork[];
  materials: SiteMaterial[];
  notes?: string | null;
  pendingWork?: string | null;
  electricianName?: string | null;
};

export function generateMaterialsPdf({ companyName, site, materials }: MaterialPdfOpts) {
  const doc = new jsPDF();
  let y = 16;

  doc.setFontSize(16);
  doc.text(companyName || "PowerLog", 14, y);
  y += 8;
  doc.setFontSize(12);
  doc.text("Site Material Requirement", 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`Site: ${site.site_name}`, 14, y);
  y += 5;
  doc.text(`Customer: ${site.customer_name}`, 14, y);
  y += 5;
  if (site.customer_phone) {
    doc.text(`Phone: ${site.customer_phone}`, 14, y);
    y += 5;
  }
  if (site.site_address) {
    doc.text(`Address: ${site.site_address}`, 14, y);
    y += 5;
  }
  doc.text(`Date: ${formatDate(site.site_date)}`, 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Item", "Qty", "Unit", "Brand", "Remarks"]],
    body: materials.map((m) => [
      m.name,
      String(m.qty_required),
      m.unit,
      m.brand || "-",
      m.remarks || "-",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
  });

  const finalY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? y + 40;
  if (site.notes) {
    doc.setFontSize(10);
    doc.text(`Notes: ${site.notes}`, 14, finalY + 10);
  }

  return doc;
}

export function generateDailyReportPdf({
  companyName,
  site,
  reportDate,
  work,
  materials,
  notes,
  pendingWork,
  electricianName,
}: ReportPdfOpts) {
  const doc = new jsPDF();
  let y = 16;

  doc.setFontSize(16);
  doc.text(companyName || "PowerLog", 14, y);
  y += 8;
  doc.setFontSize(12);
  doc.text("Daily Work Report", 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`Site: ${site.site_name}`, 14, y);
  y += 5;
  doc.text(`Customer: ${site.customer_name}`, 14, y);
  y += 5;
  doc.text(`Date: ${formatDate(reportDate)}`, 14, y);
  y += 5;
  if (electricianName) {
    doc.text(`Electrician: ${electricianName}`, 14, y);
    y += 5;
  }
  y += 4;

  doc.setFontSize(11);
  doc.text("Work Completed", 14, y);
  y += 2;

  autoTable(doc, {
    startY: y + 2,
    head: [["Work", "Qty", "Unit"]],
    body: work.map((w) => [w.name, String(w.quantity), w.unit]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
  });

  y =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? y + 30;
  y += 8;
  doc.setFontSize(11);
  doc.text("Materials (Required / Used / Remaining)", 14, y);

  autoTable(doc, {
    startY: y + 4,
    head: [["Item", "Required", "Used", "Remaining", "Unit"]],
    body: materials.map((m) => {
      const rem = Number(m.qty_required) - Number(m.qty_used);
      return [
        m.brand ? `${m.brand} ${m.name}` : m.name,
        String(m.qty_required),
        String(m.qty_used),
        String(rem),
        m.unit,
      ];
    }),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
  });

  y =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? y + 40;
  y += 10;
  doc.setFontSize(10);
  if (pendingWork) {
    doc.text(`Pending Work: ${pendingWork}`, 14, y, { maxWidth: 180 });
    y += 10;
  }
  if (notes) {
    doc.text(`Notes: ${notes}`, 14, y, { maxWidth: 180 });
  }

  return doc;
}

export function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename);
}

export async function sharePdfBlob(doc: jsPDF, filename: string) {
  const blob = doc.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: filename });
    return "shared";
  }
  downloadPdf(doc, filename);
  return "downloaded";
}
