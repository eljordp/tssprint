import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loadPricing } from "@/lib/pricing";

interface Result {
  id: string;
  kind: string;
  title: string;
  detail: string;
  tab: string;
}
import { searchText } from "@/lib/adminSearch";
export default function AdminSearch({
  navigate,
}: {
  navigate: (tab: string, record?: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
      if (e.key === "Escape") setQuery("");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    const q = searchText(query);
    if (q.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setBusy(true);
      setError("");
      setResults([]);
      const like = `ilike.*${q}*`;
      const uuid = /^[a-f0-9]{8}-[a-f0-9-]{27}$/i.test(q);
      const checks = await Promise.allSettled([
        supabase
          .from("orders")
          .select(
            "id,customer_first_name,customer_last_name,customer_email,status",
          )
          .or(
            [
              "id",
              "customer_first_name",
              "customer_last_name",
              "customer_email",
              "customer_phone",
              "paypal_capture_id",
            ]
              .map((c) => `${c}.${like}`)
              .join(","),
          )
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("contact_submissions")
          .select("id,name,email,service")
          .or(
            ["name", "email", "phone", "service"]
              .map((c) => `${c}.${like}`)
              .concat(uuid ? [`id.eq.${q}`] : [])
              .join(","),
          )
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("customers")
          .select("id,first_name,last_name,email")
          .or(
            ["first_name", "last_name", "email", "phone"]
              .map((c) => `${c}.${like}`)
              .concat(uuid ? [`id.eq.${q}`] : [])
              .join(","),
          )
          .order("created_at", { ascending: false })
          .limit(8),
        loadPricing(true),
      ]);
      if (cancelled) return;
      const found: Result[] = [];
      const failed: string[] = [];
      for (let i = 0; i < 3; i++) {
        const result = checks[i];
        if (
          result.status !== "fulfilled" ||
          !("data" in result.value) ||
          result.value.error
        ) {
          failed.push(["orders", "quotes", "customers"][i]);
          continue;
        }
        for (const r of result.value.data || []) {
          const row = r as unknown as Record<string, string>;
          found.push({
            id: row.id,
            kind: ["Order", "Quote", "Customer"][i],
            tab: ["orders", "inquiries", "crm"][i],
            title:
              i === 0
                ? `${row.customer_first_name} ${row.customer_last_name}`
                : i === 1
                  ? row.name
                  : `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
                    row.email,
            detail:
              i === 0
                ? `${row.id} · ${row.status.replaceAll("_", " ")}`
                : row.email,
          });
        }
      }
      const pricing = checks[3];
      if (pricing.status === "fulfilled" && "products" in pricing.value)
        for (const p of pricing.value.products
          .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 8))
          found.push({
            id: p.name,
            kind: "Product",
            tab: "pricing",
            title: p.name,
            detail: "View product pricing",
          });
      if (pricing.status === "rejected") failed.push("products");
      setResults(found);
      setError(
        failed.length
          ? `Could not search ${failed.join(", ")}. Please retry.`
          : "",
      );
      setBusy(false);
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);
  return (
    <div className="relative w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3">
        <Search size={18} className="shrink-0 text-muted-foreground" />
        <input
          ref={input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setResults([]);
            setError("");
            setBusy(true);
          }}
          placeholder="Search orders, quotes, customers…"
          aria-label="Search admin records"
          className="w-full bg-transparent py-3 text-sm outline-none"
        />
        {query ? (
          <button aria-label="Clear admin search" onClick={() => setQuery("")}>
            <X size={18} />
          </button>
        ) : (
          <kbd className="hidden sm:block shrink-0 text-xs text-muted-foreground">
            ⌘ K
          </kbd>
        )}
      </div>
      {searchText(query).length >= 2 && (
        <div
          className="absolute z-40 top-full mt-2 w-full max-h-[65vh] overflow-auto rounded-xl border border-border bg-card shadow-xl p-2"
          aria-label="Admin search results"
        >
          {busy && (
            <p className="p-3 text-sm" role="status">
              Searching…
            </p>
          )}
          {error && (
            <p className="p-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {!busy && !error && !results.length && (
            <p className="p-3 text-sm" role="status">
              No matching records.
            </p>
          )}
          {results.map((r) => (
            <button
              key={`${r.kind}-${r.id}`}
              className="block text-left w-full rounded-lg p-3 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => {
                navigate(r.tab, r.id);
                setQuery("");
              }}
            >
              <span className="text-xs text-primary">{r.kind}</span>
              <p className="font-semibold">{r.title}</p>
              <p className="text-xs text-muted-foreground break-all">
                {r.detail}
              </p>
            </button>
          ))}
          {!busy && results.length > 0 && (
            <p className="p-2 text-xs text-muted-foreground">
              Up to 8 matches per group. Refine your search for more specific
              results.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
