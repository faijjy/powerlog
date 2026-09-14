"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import {
  dailyReportWhatsAppTable,
  dailyReportWhatsAppText,
  materialsWhatsAppTable,
  materialsWhatsAppText,
  shareOrCopy,
  whatsappShareUrl,
} from "@/lib/share/format";
import {
  downloadPdf,
  generateDailyReportPdf,
  generateMaterialsPdf,
  sharePdfBlob,
} from "@/lib/share/pdf";
import type { DailyReportWork, Site, SiteMaterial } from "@/lib/types";

type MaterialsShareProps = {
  mode: "materials";
  site: Site;
  materials: SiteMaterial[];
  companyName: string;
};

type ReportShareProps = {
  mode: "report";
  site: Site;
  materials: SiteMaterial[];
  companyName: string;
  reportDate: string;
  work: DailyReportWork[];
  notes?: string | null;
  pendingWork?: string | null;
  electricianName?: string | null;
};

type Props = MaterialsShareProps | ReportShareProps;

export function ShareSheet(props: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  function getText(kind: "table" | "text") {
    if (props.mode === "materials") {
      return kind === "table"
        ? materialsWhatsAppTable(props.site, props.materials)
        : materialsWhatsAppText(props.site, props.materials);
    }
    return kind === "table"
      ? dailyReportWhatsAppTable(
          props.site,
          props.reportDate,
          props.work,
          props.materials,
          props.notes,
          props.pendingWork
        )
      : dailyReportWhatsAppText(
          props.site,
          props.reportDate,
          props.work,
          props.materials,
          props.notes,
          props.pendingWork
        );
  }

  async function handleWhatsApp(kind: "table" | "text") {
    const text = getText(kind);
    window.open(whatsappShareUrl(text), "_blank");
    setStatus("Opening WhatsApp…");
  }

  async function handleCopy(kind: "table" | "text") {
    const result = await shareOrCopy(getText(kind));
    setStatus(result === "copied" ? "Copied to clipboard" : "Shared");
  }

  async function handlePdf(share = false) {
    const filename =
      props.mode === "materials"
        ? `materials-${props.site.site_name}.pdf`
        : `report-${props.site.site_name}.pdf`;

    const doc =
      props.mode === "materials"
        ? generateMaterialsPdf({
            companyName: props.companyName,
            site: props.site,
            materials: props.materials,
          })
        : generateDailyReportPdf({
            companyName: props.companyName,
            site: props.site,
            reportDate: props.reportDate,
            work: props.work,
            materials: props.materials,
            notes: props.notes,
            pendingWork: props.pendingWork,
            electricianName: props.electricianName,
          });

    if (share) {
      const result = await sharePdfBlob(doc, filename);
      setStatus(result === "shared" ? "PDF shared" : "PDF downloaded");
    } else {
      downloadPdf(doc, filename);
      setStatus("PDF downloaded");
    }
  }

  return (
    <>
      <Button type="button" variant="accent" className="w-full" onClick={() => setOpen(true)}>
        Share
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <Card className="w-full max-w-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Share As</h3>
              <button
                type="button"
                className="text-sm text-muted"
                onClick={() => {
                  setOpen(false);
                  setStatus(null);
                  setShowTable(false);
                }}
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              <Button className="w-full" onClick={() => handleWhatsApp("table")}>
                1. WhatsApp Table
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => handleWhatsApp("text")}>
                2. WhatsApp Text
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => handlePdf(true)}>
                3. PDF (Share / Download)
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => setShowTable((v) => !v)}
              >
                4. Table
              </Button>
              <Button className="w-full" variant="ghost" onClick={() => handleCopy("text")}>
                Copy text
              </Button>
            </div>

            {showTable && (
              <pre className="mt-3 max-h-56 overflow-auto rounded-xl bg-background p-3 text-xs whitespace-pre-wrap">
                {getText("table")}
              </pre>
            )}

            {status && <p className="mt-3 text-center text-sm text-success">{status}</p>}
          </Card>
        </div>
      )}
    </>
  );
}
