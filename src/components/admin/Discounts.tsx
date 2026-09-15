import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_PROMOS,
  validatePromos,
  type ApprovedPromo,
} from "@/lib/approvedPromos";

export default function Discounts() {
  const [codes, setCodes] = useState<Record<string, ApprovedPromo>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [code, setCode] = useState("");
  const [revision, setRevision] = useState<string | null>(null);
  const load = async () => {
    setLoading(true);
    setError("");
    setReady(false);
    const { data, error } = await supabase
      .from("pricing_configs")
      .select("config,updated_at")
      .eq("id", "checkout_promos")
      .maybeSingle();
    if (error)
      setError("Could not load shared discounts. Retry before editing.");
    else {
      try {
        setCodes(validatePromos(data ? data.config : DEFAULT_PROMOS));
        setRevision(data?.updated_at ?? null);
        setReady(true);
      } catch {
        setError("Stored discount settings need review.");
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);
  const publish = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const config = validatePromos(codes);
      const updated_at = new Date().toISOString();
      const row = { id: "checkout_promos", config, updated_at };
      const result = revision
        ? await supabase
            .from("pricing_configs")
            .update(row)
            .eq("id", row.id)
            .eq("updated_at", revision)
            .select("updated_at")
            .single()
        : await supabase
            .from("pricing_configs")
            .insert(row)
            .select("updated_at")
            .single();
      if (result.error)
        throw new Error(
          "Discounts were not published. Another admin may have changed them; reload and retry.",
        );
      setRevision(result.data.updated_at);
      setNotice("Published. Checkout now validates these shared discounts.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not publish discounts.");
    } finally {
      setBusy(false);
    }
  };
  const change = (id: string, patch: Partial<ApprovedPromo>) =>
    setCodes((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  if (loading) return <p role="status">Loading shared discounts…</p>;
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Discounts</h2>
        <p className="text-sm text-muted-foreground">
          Publish changes to apply them across the shop. Deactivate a code to
          stop accepting it.
        </p>
      </div>
      {error && (
        <div role="alert" className="rounded-xl border border-destructive p-3">
          {error}{" "}
          <button className="underline" onClick={() => void load()}>
            Reload shared discounts
          </button>
        </div>
      )}
      {notice && (
        <p role="status" className="text-primary">
          {notice}
        </p>
      )}
      <fieldset
        disabled={busy || !ready}
        className="space-y-4 disabled:opacity-60"
      >
        {Object.entries(codes).map(([id, p]) => (
          <div
            className="rounded-xl border border-border bg-card p-4 space-y-3"
            key={id}
          >
            <div className="flex justify-between gap-3">
              <h3 className="font-bold">{id}</h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={p.active}
                  onChange={(e) => change(id, { active: e.target.checked })}
                />{" "}
                Active
              </label>
            </div>
            <div className="grid sm:grid-cols-4 gap-3">
              <label className="text-sm">
                Type
                <select
                  className="admin-input"
                  value={p.type}
                  onChange={(e) =>
                    change(id, {
                      type: e.target.value as ApprovedPromo["type"],
                    })
                  }
                >
                  <option value="percent">Percent off</option>
                  <option value="fixed">Dollars off</option>
                </select>
              </label>
              <label className="text-sm">
                Discount
                <input
                  className="admin-input"
                  type="number"
                  min="0.01"
                  max={p.type === "percent" ? 100 : undefined}
                  step="0.01"
                  value={p.value}
                  onChange={(e) =>
                    change(id, { value: Number(e.target.value) })
                  }
                />
              </label>
              <label className="text-sm">
                Minimum order ($)
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={p.minOrder}
                  onChange={(e) =>
                    change(id, { minOrder: Number(e.target.value) })
                  }
                />
              </label>
              <label className="text-sm">
                Expires (UTC)
                <input
                  className="admin-input"
                  type="date"
                  value={p.expiresAt || ""}
                  onChange={(e) => change(id, { expiresAt: e.target.value })}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={p.firstOrderOnly}
                onChange={(e) =>
                  change(id, { firstOrderOnly: e.target.checked })
                }
              />{" "}
              First orders only — checked against paid orders
            </label>
          </div>
        ))}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const id = code.trim().toUpperCase();
            if (
              !/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(id) ||
              Object.hasOwn(codes, id)
            ) {
              setNotice(
                "Enter a unique code with 2–40 letters, numbers, hyphens or underscores.",
              );
              return;
            }
            setCodes({
              ...codes,
              [id]: {
                type: "percent",
                value: 10,
                minOrder: 35,
                active: false,
                firstOrderOnly: false,
              },
            });
            setCode("");
            setNotice(
              "New code added to draft. Set its terms, activate and publish when ready.",
            );
          }}
        >
          <input
            aria-label="New discount code"
            className="admin-input"
            placeholder="New code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <button className="shrink-0 rounded-lg border border-border px-4">
            Add code
          </button>
        </form>
        <button className="btn-primary" onClick={() => void publish()}>
          {busy ? "Publishing…" : "Publish discounts"}
        </button>
      </fieldset>
      <p className="text-xs text-muted-foreground">
        Old browser-only promo drafts have not been published or deleted. Usage
        limits are not offered until a shared redemption ledger exists.
      </p>
    </section>
  );
}
