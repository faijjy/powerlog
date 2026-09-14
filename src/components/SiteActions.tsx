"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { SiteStatus } from "@/lib/types";
import { Button } from "@/components/ui";

export function SiteStatusActions({
  siteId,
  status,
}: {
  siteId: string;
  status: SiteStatus;
}) {
  const router = useRouter();

  async function setStatus(next: SiteStatus) {
    const supabase = createClient();
    await supabase.from("sites").update({ status: next }).eq("id", siteId);
    router.refresh();
  }

  if (status === "completed") {
    return (
      <Button
        type="button"
        variant="secondary"
        className="w-full py-2 text-xs"
        onClick={() => setStatus("in_progress")}
      >
        Reopen Site
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full py-2 text-xs"
      onClick={() => setStatus("completed")}
    >
      Mark Completed
    </Button>
  );
}
