import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ContactDelivery from './ContactDelivery';
const milestones = [
  "view_item",
  "artwork_upload_started",
  "artwork_upload_succeeded",
  "artwork_upload_failed",
  "artwork_option_selected",
  "add_to_cart",
  "begin_checkout",
  "add_shipping_info",
  "add_payment_info",
  "payment_failed",
  "quote_submit",
  "phone_click",
];
export default function Tracking() {
  const [events, setEvents] = useState<
    { event_type: string; created_at: string; path: string }[]
  >([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [updated, setUpdated] = useState("");
  const refresh = async () => {
    setBusy(true);
    setError("");
    const { data, error } = await supabase
      .from("click_events")
      .select("event_type,created_at,path")
      .in("event_type", milestones)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) setError("Could not load tracking signals. Retry.");
    else {
      setEvents(data || []);
      setUpdated(new Date().toLocaleString());
    }
    setBusy(false);
  };
  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <section className="space-y-5">
      <ContactDelivery />
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="font-bold text-xl">Tracking checks</h2>
          <p className="text-sm text-muted-foreground">
            Customer milestones recorded by the website. Staff and verification
            sessions are excluded.
          </p>
        </div>
        <button
          className="border border-border rounded-lg px-4"
          disabled={busy}
          onClick={() => void refresh()}
        >
          {busy ? "Loading…" : "Refresh"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <div className="rounded-xl border border-border bg-card p-4 text-sm space-y-2">
        <p>
          <strong>GA4 configuration:</strong>{" "}
          {import.meta.env.VITE_GA4_MEASUREMENT_ID || "Measurement ID missing"}
        </p>
        <p>
          A configured tag does not prove Google received an event. Use GA4
          Realtime / DebugView for delivery checks.
        </p>
        <a
          className="text-primary underline"
          href="https://analytics.google.com/analytics/web/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Google Analytics ↗
        </a>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="text-left bg-card">
            <tr>
              <th className="p-3">Milestone</th>
              <th className="p-3">Most recent signal</th>
              <th className="p-3">Page</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((name) => {
              const event = events.find((e) => e.event_type === name);
              return (
                <tr key={name} className="border-t border-border">
                  <td className="p-3">{name.replaceAll("_", " ")}</td>
                  <td className="p-3">
                    {busy
                      ? "Loading…"
                      : error
                        ? "Unavailable"
                        : event
                          ? new Date(event.created_at).toLocaleString()
                          : "Not observed in recent records"}
                  </td>
                  <td className="p-3">{event?.path || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Checks the latest 500 matching events, not lifetime totals.{" "}
        {updated && `Updated ${updated}.`} No recent signal can mean no customer
        used that step; it does not by itself mean tracking is broken.
      </p>
      <div className="rounded-xl border border-border p-4 text-sm space-y-2">
        <h3 className="font-bold">Outcome checks</h3>
        <p>
          <strong>Purchases:</strong> verify captured payment records in Orders.
          A confirmation-page visit is not a payment receipt.
        </p>
        <p>
          <strong>Quotes:</strong> Quotes records prove a lead saved. Email
          acceptance and delivery must be checked separately.
        </p>
        <p>
          <strong>Cart email:</strong> Orders → Abandoned carts shows the send
          status. “Accepted” means the email provider accepted the request, not
          that it reached the inbox.
        </p>
        <a
          className="text-primary underline"
          href="https://resend.com/emails"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open email delivery logs ↗
        </a>
      </div>
    </section>
  );
}
