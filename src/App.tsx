// src/App.tsx

import { useEffect, useState } from "react";
import type { Bucket, OutputMode, AppState, Operator } from "./lib/types";
import { buildBoolean } from "./lib/booleanBuilder";
import confetti from "canvas-confetti";
import HeaderBar from "./components/HeaderBar";
import BucketsPanel from "./components/BucketsPanel";
import BooleanPreview from "./components/BooleanPreview";


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

    const [copyToastVisible, setCopyToastVisible] = useState(false);

  // Auto-hide toast after a short delay when it becomes visible
  useEffect(() => {
    if (!copyToastVisible) return;

    const timeoutId = window.setTimeout(() => {
      setCopyToastVisible(false);
    }, 1800); // 1.8s

    return () => window.clearTimeout(timeoutId);
  }, [copyToastVisible]);

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

  const handleReorderBuckets = (orderedIds: string[]) => {
    updateBuckets((prev) => {
      const idToBucket = new Map(prev.map((b) => [b.id, b]));
      const reordered: Bucket[] = [];

      for (const id of orderedIds) {
        const bucket = idToBucket.get(id);
        if (bucket) reordered.push(bucket);
      }

      // In case something went weird, fall back
      if (!reordered.length) return prev;

      return reordered;
    });
  };

  const handleDeleteBucket = (id: string) => {
    updateBuckets((prev) => {
      const filtered = prev.filter((b) => b.id !== id);

      // If deleting would leave us with no buckets, create a fresh empty one
      if (filtered.length === 0) {
        return [
          {
            id: "bucket-1",
            name: "Bucket 1",
            terms: [],
            isEnabled: true,
            operatorAfter: "AND",
          },
        ];
      }

      return filtered;
    });
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

      // Fire a small confetti burst from the bottom-center area
      confetti({
        particleCount: 60,
        spread: 70,
        startVelocity: 35,
        origin: { x: 0.5, y: 0.9 }, // middle bottom-ish
        ticks: 200,
      });

      setCopyToastVisible(true);
    } catch (err) {
      console.error("Failed to copy", err);
      // Optional: could show an error toast later
    }
  };


  // Color cycling for pills
  const pillColorClasses = [
    "bg-pill-lavender text-slate-800",
    "bg-pill-blue text-slate-800",
    "bg-pill-mint text-slate-800",
  ];

  return (
    <div className="min-h-screen bg-app text-slate-900">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <HeaderBar />

        {/* Main layout container: subtle panel around both columns */}
        <div className="mt-6 rounded-2xl bg-white/80 border border-slate-100 shadow-soft p-4">
          <div className="grid grid-cols-[1.4fr_1fr] gap-6 items-start">
            {/* Left: Buckets */}
            <BucketsPanel
              buckets={buckets}
              pillColorClasses={pillColorClasses}
              handleAddBucket={handleAddBucket}
              handleBucketNameChange={handleBucketNameChange}
              handleToggleBucket={handleToggleBucket}
              handleRemoveTerm={handleRemoveTerm}
              handleAddTerm={handleAddTerm}
              handleOperatorChange={handleOperatorChange}
              handleReorderBuckets={handleReorderBuckets}
              handleDeleteBucket={handleDeleteBucket}
            />

            {/* Right: Boolean preview */}
            <BooleanPreview
              booleanString={booleanString}
              outputMode={outputMode}
              setOutputMode={setOutputMode}
              onCopy={handleCopy}
            />
          </div>
        </div>
      </div>
       {/* Copy toast */}
      {copyToastVisible && (
        <div className="fixed inset-x-0 bottom-6 flex justify-center pointer-events-none">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-slate-900/90 text-slate-50 px-4 py-2 text-sm shadow-softLg border border-slate-700/60">
            <span className="text-xs">✅</span>
            <span>Copied Boolean to clipboard</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
