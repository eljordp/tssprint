import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
type Fields = {
  staff_notes: string;
  assigned_to: string;
  due_date: string | null;
  tracking_url: string;
  proof_reference: string;
  proof_approved_at: string | null;
};
export default function JobDetails({
  id,
  initial,
}: {
  id: string;
  initial: Fields;
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<
    {
      id: string;
      created_at: string;
      changes: Record<string, { from: unknown; to: unknown }>;
    }[]
  >([]);
  const [historyError, setHistoryError] = useState(false);
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("order_activity")
      .select("id,created_at,changes")
      .eq("order_id", id)
      .order("created_at", { ascending: false })
      .limit(20);
    setHistoryError(!!error);
    if (!error) setHistory(data || []);
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  const save = async () => {
    setBusy(true);
    setMessage("");
    try {
      if (form.tracking_url && !/^https:\/\//i.test(form.tracking_url))
        throw new Error("Use an https tracking link.");
      if (form.proof_approved_at && !form.proof_reference.trim())
        throw new Error("Record the approved proof reference first.");
      const { error } = await supabase
        .from("order_production_details")
        .upsert({ order_id: id, ...form }, { onConflict: "order_id" })
        .select("order_id")
        .single();
      if (error) throw error;
      setMessage("Saved to the shared order.");
      await load();
    } catch {
      setMessage(
        "Not saved. Check the proof reference and tracking link, then retry.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="space-y-3 rounded-xl border border-border p-4">
      <h4 className="font-bold">Production details</h4>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">
          Assigned to
          <input
            className="admin-input"
            value={form.assigned_to}
            onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Due date
          <input
            className="admin-input"
            type="date"
            value={form.due_date || ""}
            onChange={(e) =>
              setForm({ ...form, due_date: e.target.value || null })
            }
          />
        </label>
        <label className="text-sm">
          Proof version / approval reference
          <input
            className="admin-input"
            placeholder="e.g. proof-v2.pdf, customer email dated…"
            value={form.proof_reference}
            onChange={(e) =>
              setForm({ ...form, proof_reference: e.target.value, proof_approved_at: null })
            }
          />
        </label>
        <label className="text-sm">
          Tracking link
          <input
            type="url"
            className="admin-input"
            value={form.tracking_url}
            onChange={(e) => setForm({ ...form, tracking_url: e.target.value })}
          />
        </label>
      </div>
      <label className="block text-sm">
        Internal notes
        <textarea
          className="admin-input"
          rows={3}
          value={form.staff_notes}
          onChange={(e) => setForm({ ...form, staff_notes: e.target.value })}
        />
      </label>
      <label className="flex gap-2 items-center text-sm">
        <input
          type="checkbox"
          checked={!!form.proof_approved_at}
          onChange={(e) =>
            setForm({
              ...form,
              proof_approved_at: e.target.checked
                ? new Date().toISOString()
                : null,
            })
          }
        />{" "}
        Customer approval received for the referenced proof
      </label>
      {form.proof_approved_at && (
        <p className="text-xs text-muted-foreground">
          Approval recorded {new Date(form.proof_approved_at).toLocaleString()}.
          Save to confirm.
        </p>
      )}
      <button
        className="btn-primary text-sm"
        disabled={busy}
        onClick={() => void save()}
      >
        {busy ? "Saving…" : "Save production details"}
      </button>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      <details>
        <summary className="cursor-pointer text-sm font-semibold">
          Order activity
        </summary>
        {historyError ? (
          <p role="alert">Could not load activity.</p>
        ) : history.length ? (
          history.map((entry) => (
            <div key={entry.id} className="text-xs border-t border-border py-2">
              <p>{new Date(entry.created_at).toLocaleString()}</p>
              {Object.entries(entry.changes).map(([field, change]) => (
                <p key={field}>
                  {field.replaceAll("_", " ")}: {String(change.to ?? "Cleared")}
                </p>
              ))}
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground py-2">
            No recorded changes yet. History starts with this update.
          </p>
        )}
      </details>
    </section>
  );
}
