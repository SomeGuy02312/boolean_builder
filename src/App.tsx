// src/App.tsx

import { useEffect, useState } from "react";
import type { Bucket, OutputMode, AppState, Operator } from "./lib/types";
import { buildBoolean } from "./lib/booleanBuilder";

const STORAGE_KEY = "boolean-builder-state-v1";

const DEFAULT_BUCKETS: Bucket[] = [
  {
    id: "bucket-1",
    name: "Bucket 1",
    terms: [],
    isEnabled: true,
    operatorAfter: "AND",
  },
];

function loadInitialState(): { buckets: Bucket[]; outputMode: OutputMode } {
  if (typeof window === "undefined") {
    return { buckets: DEFAULT_BUCKETS, outputMode: "pretty" };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { buckets: DEFAULT_BUCKETS, outputMode: "pretty" };
    }
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !Array.isArray(parsed.buckets)) {
      return { buckets: DEFAULT_BUCKETS, outputMode: "pretty" };
    }
    const mode: OutputMode =
      parsed.outputMode === "minified" ? "minified" : "pretty";

    return {
      buckets: parsed.buckets.length ? parsed.buckets : DEFAULT_BUCKETS,
      outputMode: mode,
    };
  } catch {
    return { buckets: DEFAULT_BUCKETS, outputMode: "pretty" };
  }
}

function App() {
  const [{ buckets, outputMode }, setState] = useState(() =>
    loadInitialState()
  );

  // Persist to localStorage whenever buckets or outputMode change
  useEffect(() => {
    const state: AppState = { buckets, outputMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [buckets, outputMode]);

  const updateBuckets = (updater: (prev: Bucket[]) => Bucket[]) => {
    setState((prev) => ({
      ...prev,
      buckets: updater(prev.buckets),
    }));
  };

  const setOutputMode = (mode: OutputMode) => {
    setState((prev) => ({ ...prev, outputMode: mode }));
  };

  const handleBucketNameChange = (id: string, name: string) => {
    updateBuckets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name } : b))
    );
  };

  const handleToggleBucket = (id: string) => {
    updateBuckets((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, isEnabled: !b.isEnabled } : b
      )
    );
  };

  const handleAddTerm = (id: string, term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    updateBuckets((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              // de-dupe within bucket
              terms: b.terms.includes(trimmed)
                ? b.terms
                : [...b.terms, trimmed],
            }
          : b
      )
    );
  };

  const handleRemoveTerm = (bucketId: string, termIndex: number) => {
    updateBuckets((prev) =>
      prev.map((b) =>
        b.id === bucketId
          ? {
              ...b,
              terms: b.terms.filter((_, i) => i !== termIndex),
            }
          : b
      )
    );
  };

  const handleOperatorChange = (bucketId: string, operator: Operator) => {
    updateBuckets((prev) =>
      prev.map((b) =>
        b.id === bucketId ? { ...b, operatorAfter: operator } : b
      )
    );
  };

  const handleAddBucket = () => {
    updateBuckets((prev) => {
      if (prev.length >= 8) return prev; // max buckets
      const newIndex = prev.length + 1;
      return [
        ...prev,
        {
          id: `bucket-${newIndex}`,
          name: `Bucket ${newIndex}`,
          terms: [],
          isEnabled: true,
          operatorAfter: "AND",
        },
      ];
    });
  };

  const booleanString = buildBoolean(buckets, outputMode);

  const handleCopy = async () => {
    if (!booleanString) return;
    try {
      await navigator.clipboard.writeText(booleanString);
      // TODO: add confetti + tooltip here
      console.log("Copied Boolean to clipboard");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Boolean Builder (V1)
            </h1>
            <p className="text-sm text-slate-500">
              Visual multi-bucket Boolean builder
            </p>
          </div>
          <div className="text-sm text-slate-500">
            Templates (coming soon)
          </div>
        </header>

        {/* Main layout: left buckets, right preview */}
        <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-6 items-start">
          {/* Left: Buckets */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Buckets</h2>
              <button
                type="button"
                onClick={handleAddBucket}
                disabled={buckets.length >= 8}
                className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Add bucket
              </button>
            </div>

            <div className="space-y-4">
              {buckets.map((bucket, index) => (
                <div
                  key={bucket.id}
                  className="rounded-xl bg-white shadow-sm border border-slate-200 p-4 space-y-3"
                >
                  {/* Bucket header */}
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={bucket.name}
                      onChange={(e) =>
                        handleBucketNameChange(
                          bucket.id,
                          e.target.value
                        )
                      }
                      className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        checked={bucket.isEnabled}
                        onChange={() =>
                          handleToggleBucket(bucket.id)
                        }
                      />
                      <span>Enabled</span>
                    </label>
                  </div>

                  {/* Terms */}
                  <div className="flex flex-wrap gap-2">
                    {bucket.terms.map((term, i) => (
                      <span
                        key={`${bucket.id}-term-${i}`}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700"
                      >
                        {term}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveTerm(bucket.id, i)
                          }
                          className="text-indigo-500 hover:text-indigo-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {bucket.terms.length === 0 && (
                      <span className="text-xs text-slate-400">
                        No terms yet
                      </span>
                    )}
                  </div>

                  {/* Add term input */}
                  <input
                    type="text"
                    placeholder="Type a term and press Enter (or paste multiple, then Enter)"
                    className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = e.currentTarget.value;
                        if (!value) return;

                        // multi-add: split on newline or comma
                        if (
                          value.includes("\n") ||
                          value.includes(",")
                        ) {
                          const pieces = value
                            .split(/[\n,]/)
                            .map((p) => p.trim())
                            .filter(Boolean);
                          pieces.forEach((p) =>
                            handleAddTerm(bucket.id, p)
                          );
                        } else {
                          handleAddTerm(bucket.id, value);
                        }

                        e.currentTarget.value = "";
                      }
                    }}
                  />

                  {/* Operator after this bucket (if not last) */}
                  {index < buckets.length - 1 && (
                    <div className="pt-2 border-t border-dashed border-slate-200">
                      <label className="text-xs text-slate-500">
                        Operator to next bucket:
                      </label>
                      <select
                        value={bucket.operatorAfter}
                        onChange={(e) =>
                          handleOperatorChange(
                            bucket.id,
                            e.target.value as Operator
                          )
                        }
                        className="ml-2 rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                        <option value="AND NOT">AND NOT</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Right: Boolean preview */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Boolean preview</h2>

              <div className="inline-flex rounded-full bg-slate-200 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setOutputMode("pretty")}
                  className={`px-3 py-1 rounded-full ${
                    outputMode === "pretty"
                      ? "bg-white shadow text-slate-900"
                      : "text-slate-600"
                  }`}
                >
                  Pretty
                </button>
                <button
                  type="button"
                  onClick={() => setOutputMode("minified")}
                  className={`px-3 py-1 rounded-full ${
                    outputMode === "minified"
                      ? "bg-white shadow text-slate-900"
                      : "text-slate-600"
                  }`}
                >
                  Minified
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4 h-[320px] flex flex-col">
              <pre className="flex-1 overflow-auto text-xs font-mono whitespace-pre-wrap">
                {booleanString ||
                  "/* Start adding terms to see your Boolean here */"}
              </pre>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!booleanString}
                  className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Copy
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
