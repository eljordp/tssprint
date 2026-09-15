import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
const queues = [
  {
    label: "New orders",
    table: "orders",
    column: "status",
    value: "processing",
    tab: "orders",
  },
  {
    label: "Artwork needed",
    table: "orders",
    column: "status",
    value: "artwork_needed",
    tab: "orders",
  },
  {
    label: "Awaiting proof approval",
    table: "orders",
    column: "status",
    value: "awaiting_approval",
    tab: "orders",
  },
  {
    label: "In production",
    table: "orders",
    column: "status",
    value: "in_production",
    tab: "orders",
  },
  {
    label: "Ready for pickup",
    table: "orders",
    column: "status",
    value: "ready_pickup",
    tab: "orders",
  },
  {
    label: "Unanswered quotes",
    table: "contact_submissions",
    column: "lead_status",
    value: "new",
    tab: "inquiries",
  },
];
export default function Overview({
  navigate,
}: {
  navigate: (tab: string, record?: string, filter?: string) => void;
}) {
  const [counts, setCounts] = useState<(number | null)[]>([]);
  const [busy, setBusy] = useState(true);
  const [updated, setUpdated] = useState("");
  const refresh = async () => {
    setBusy(true);
    const rows = await Promise.allSettled(
      queues.map((q) =>
        supabase
          .from(q.table)
          .select("id", { count: "exact", head: true })
          .eq(q.column, q.value),
      ),
    );
    setCounts(
      rows.map((r) =>
        r.status === "fulfilled" && !r.value.error ? r.value.count : null,
      ),
    );
    setUpdated(new Date().toLocaleTimeString());
    setBusy(false);
  };
  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">What needs attention?</h2>
          <p className="text-muted-foreground text-sm">
            Open a queue to review the next job.
          </p>
        </div>
        <button
          className="rounded-lg border border-border px-4 py-2 text-sm"
          disabled={busy}
          onClick={() => void refresh()}
        >
          {busy ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {queues.map((q, i) => (
          <button
            key={q.label}
            onClick={() => navigate(q.tab, undefined, q.value)}
            className="text-left rounded-2xl bg-card border border-border p-5 hover:border-primary"
          >
            <p className="text-sm text-muted-foreground">{q.label}</p>
            <p className="text-3xl font-bold mt-3">
              {busy ? "…" : (counts[i] ?? "Unavailable")}
            </p>
          </button>
        ))}
      </div>
      {!busy && counts.some((c) => c === null) && (
        <p role="alert" className="text-destructive">
          Some queues could not be loaded. Refresh to retry.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          className="btn-primary"
          onClick={() => navigate("orders", undefined, "payment_review")}
        >
          Review unpaid / unverified orders
        </button>
        <button
          className="rounded-xl border border-border px-4 py-2"
          onClick={() => navigate("orders", undefined, "overdue")}
        >
          Overdue jobs
        </button>
        <button
          className="rounded-xl border border-border px-4 py-2"
          onClick={() => navigate("inquiries", undefined, "follow_up")}
        >
          Quote follow-ups due
        </button>
      </div>
      {updated && (
        <p className="text-xs text-muted-foreground">
          Updated {updated}. Payment and job progress are tracked separately.
        </p>
      )}
    </section>
  );
}
