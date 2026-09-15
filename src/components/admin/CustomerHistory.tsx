import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
export default function CustomerHistory({ email }: { email: string }) {
  const [orders, setOrders] = useState<
    { id: string; status: string; total: number; created_at: string }[]
  >([]);
  const [quotes, setQuotes] = useState<
    { id: string; service: string; lead_status: string; created_at: string }[]
  >([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    void Promise.all([
      supabase
        .from("orders")
        .select("id,status,total,created_at")
        .eq("customer_email", email)
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("contact_submissions")
        .select("id,service,lead_status,created_at")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(25),
    ]).then(([o, q]) => {
      if (!active) return;
      if (o.error || q.error)
        setError("Could not load customer history. Reload to retry.");
      else {
        setOrders(o.data || []);
        setQuotes(q.data || []);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [email]);
  return (
    <section className="rounded-xl border border-border p-4 space-y-3">
      <h2 className="font-bold">Customer history · {email}</h2>
      {loading ? (
        <p>Loading history…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-bold mb-2">Recent orders</h3>
            {orders.length ? (
              orders.map((o) => (
                <a
                  className="block text-sm rounded-lg bg-card p-3 mb-2"
                  key={o.id}
                  href={`/admin?tab=orders&record=${encodeURIComponent(o.id)}`}
                >
                  {o.id} · ${Number(o.total).toFixed(2)}
                  <p className="text-muted-foreground">
                    {o.status.replaceAll("_", " ")} ·{" "}
                    {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </a>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No orders found.</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold mb-2">Recent quotes</h3>
            {quotes.length ? (
              quotes.map((q) => (
                <a
                  className="block text-sm rounded-lg bg-card p-3 mb-2"
                  key={q.id}
                  href={`/admin?tab=inquiries&record=${encodeURIComponent(q.id)}`}
                >
                  {q.service || "Quote"} · {q.lead_status}
                  <p className="text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString()}
                  </p>
                </a>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No quotes found.</p>
            )}
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Latest 25 records per list, matched by the customer's email address.
      </p>
    </section>
  );
}
