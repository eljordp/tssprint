import { useState } from "react";
import { supabase } from "@/lib/supabase";
export default function QuoteFollowUp({
  id,
  assigned,
  notes,
  due,
}: {
  id: string;
  assigned: string;
  notes: string;
  due: string | null;
}) {
  const [form, setForm] = useState({
    assigned_to: assigned,
    staff_notes: notes,
    follow_up_at: due,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const save = async () => {
    setBusy(true);
    setMessage("");
    const { error } = await supabase
      .from("contact_submissions")
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id")
      .single();
    setMessage(error ? "Not saved. Retry your changes." : "Follow-up saved.");
    setBusy(false);
  };
  return (
    <fieldset
      disabled={busy}
      className="space-y-3 rounded-xl border border-border p-4"
    >
      <legend className="text-sm font-bold px-1">Quote follow-up</legend>
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
          Follow up on
          <input
            type="date"
            className="admin-input"
            value={form.follow_up_at || ""}
            onChange={(e) =>
              setForm({ ...form, follow_up_at: e.target.value || null })
            }
          />
        </label>
      </div>
      <label className="block text-sm">
        Internal notes
        <textarea
          className="admin-input"
          rows={2}
          value={form.staff_notes}
          onChange={(e) => setForm({ ...form, staff_notes: e.target.value })}
        />
      </label>
      <button className="btn-primary text-sm" onClick={() => void save()}>
        {busy ? "Saving…" : "Save follow-up"}
      </button>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </fieldset>
  );
}
