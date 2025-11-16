// src/App.tsx

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type {
  Bucket,
  OutputMode,
  AppState,
  Operator,
  Term,
  TermColorKey,
} from "./lib/types";
import { buildBoolean } from "./lib/booleanBuilder";
import confetti from "canvas-confetti";
import HeaderBar from "./components/HeaderBar";
import BucketsPanel from "./components/BucketsPanel";
import BooleanPreview from "./components/BooleanPreview";
import SavedSearchPanel from "./components/SavedSearchPanel";
import { useSavedSearches } from "./hooks/useSavedSearches";
import type { SavedSearch } from "./lib/savedSearches";


const STORAGE_KEY = "boolean-builder-state-v1";

const TERM_COLORS: TermColorKey[] = [
  "lavender",
  "blue",
  "mint",
  "cyan",
  "teal",
  "yellow",
  "orange",
  "red",
  "pink",
  "violet",
];

let termIdCounter = 0;
const generateTermId = () => `term-${Date.now()}-${termIdCounter++}`;

const pickTermColor = (termCount: number): TermColorKey =>
  TERM_COLORS[termCount % TERM_COLORS.length];

type PersistedBucket = Omit<Bucket, "terms"> & {
  terms: Array<Term | string | null | undefined>;
};

const normalizeTerm = (
  term: Term | string | null | undefined,
  index: number
): Term => {
  if (
    term &&
    typeof term === "object" &&
    "id" in term &&
    "value" in term &&
    "colorKey" in term &&
    typeof term.id === "string" &&
    typeof term.value === "string" &&
    typeof term.colorKey === "string"
  ) {
    return term as Term;
  }

  const value = typeof term === "string" ? term : "";

  return {
    id: generateTermId(),
    value,
    colorKey: pickTermColor(index),
  };
};

const normalizeBuckets = (rawBuckets: PersistedBucket[]): Bucket[] =>
  rawBuckets.map((bucket) => ({
    ...bucket,
    terms: bucket.terms
      .map((term, index) => normalizeTerm(term, index))
      .filter((term) => Boolean(term.value)),
  }));

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

    const persistedBuckets = parsed.buckets as PersistedBucket[];

    const normalizedBuckets = persistedBuckets.length
      ? normalizeBuckets(persistedBuckets)
      : DEFAULT_BUCKETS;

    return {
      buckets: normalizedBuckets,
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
  const {
    items: savedSearches,
    create: createSavedSearch,
    update: updateSavedSearch,
    deleteSearch,
    markUsed,
    replaceAll: _replaceAll,
    exportAll: _exportAll,
    getRecents: _getRecents,
  } = useSavedSearches();
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);

  const booleanString = useMemo(
    () => buildBoolean(buckets, outputMode),
    [buckets, outputMode]
  );
  const [renderedQueryString, setRenderedQueryString] = useState(
    () => booleanString
  );
  const builderHasContent = useMemo(() => {
    const bucketHasContent = buckets.some(
      (bucket) =>
        bucket.terms.length > 0 || bucket.name.trim().length > 0
    );
    const queryHasContent = renderedQueryString.trim().length > 0;
    return bucketHasContent || queryHasContent;
  }, [buckets, renderedQueryString]);
  const skipQuerySyncRef = useRef(false);

  // Persist to localStorage whenever buckets or outputMode change
  useEffect(() => {
    const state: AppState = { buckets, outputMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [buckets, outputMode]);

  useEffect(() => {
    if (skipQuerySyncRef.current) {
      skipQuerySyncRef.current = false;
      return;
    }
    setRenderedQueryString(booleanString);
  }, [booleanString]);

  useEffect(() => {
    const snapshot = JSON.stringify({
      buckets,
      outputMode,
      queryString: renderedQueryString,
    });
    const lastSnapshot = lastSavedSnapshotRef.current;
    if (lastSnapshot === null) {
      setIsDirty(builderHasContent);
      return;
    }
    setIsDirty(snapshot !== lastSnapshot);
  }, [buckets, outputMode, renderedQueryString, builderHasContent]);

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
      prev.map((b) => {
        if (b.id !== id) return b;

        const alreadyExists = b.terms.some((t) => t.value === trimmed);
        if (alreadyExists) return b;

        const newTerm: Term = {
          id: generateTermId(),
          value: trimmed,
          colorKey: pickTermColor(b.terms.length),
        };

        return {
          ...b,
          terms: [...b.terms, newTerm],
        };
      })
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

  const loadSavedSearch = useCallback(
    (saved: SavedSearch) => {
      skipQuerySyncRef.current = true;
      setState({
        buckets: saved.state.buckets,
        outputMode: saved.state.outputMode,
      });
      setRenderedQueryString(saved.queryString);
      setCurrentSavedId(saved.id);
      setCurrentName(saved.name);
      setIsDirty(false);
      lastSavedSnapshotRef.current = JSON.stringify({
        buckets: saved.state.buckets,
        outputMode: saved.state.outputMode,
        queryString: saved.queryString,
      });
      markUsed(saved.id);
    },
    [markUsed]
  );
  const handleNameChange = useCallback((value: string) => {
    setCurrentName(value);
    setIsDirty(true);
  }, []);
  const handleSave = useCallback(() => {
    if (!builderHasContent) return false;
    if (!currentName.trim()) return false;
    const nameToUse = currentName.trim() || "Untitled search";
    const payloadState: AppState = {
      buckets,
      outputMode,
    };
    if (!currentSavedId) {
      const saved = createSavedSearch({
        name: nameToUse,
        state: payloadState,
        queryString: renderedQueryString,
      });
      setCurrentSavedId(saved.id);
      setCurrentName(saved.name);
      markUsed(saved.id);
    } else {
      updateSavedSearch(currentSavedId, {
        name: nameToUse,
        state: payloadState,
        queryString: renderedQueryString,
      });
      markUsed(currentSavedId);
    }
    lastSavedSnapshotRef.current = JSON.stringify({
      buckets,
      outputMode,
      queryString: renderedQueryString,
    });
    setIsDirty(false);
    return true;
  }, [
    builderHasContent,
    currentName,
    buckets,
    outputMode,
    currentSavedId,
    createSavedSearch,
    updateSavedSearch,
    renderedQueryString,
    markUsed,
  ]);
  const handleLoadSavedFromPanel = useCallback(
    (saved: SavedSearch) => {
      loadSavedSearch(saved);
      setIsSavedPanelOpen(false);
    },
    [loadSavedSearch]
  );
  const handleRenameSaved = useCallback(
    (id: string, name: string) => {
      updateSavedSearch(id, { name });
      if (currentSavedId === id) {
        setCurrentName(name);
      }
    },
    [updateSavedSearch, currentSavedId]
  );
  const handleDeleteSaved = useCallback(
    (id: string) => {
      deleteSearch(id);
      if (currentSavedId === id) {
        setCurrentSavedId(null);
        setCurrentName("");
        lastSavedSnapshotRef.current = null;
        setIsDirty(builderHasContent);
      }
    },
    [deleteSearch, currentSavedId, builderHasContent]
  );

  const handleMoveTerm = (
    sourceBucketId: string,
    sourceIndex: number,
    targetBucketId: string,
    targetIndex: number
  ) => {
    updateBuckets((prev) => {
      const sourceBucketIndex = prev.findIndex(
        (b) => b.id === sourceBucketId
      );
      const targetBucketIndex = prev.findIndex(
        (b) => b.id === targetBucketId
      );

      if (sourceBucketIndex === -1 || targetBucketIndex === -1) {
        return prev;
      }

      const sourceBucket = prev[sourceBucketIndex];
      if (
        sourceIndex < 0 ||
        sourceIndex >= sourceBucket.terms.length
      ) {
        return prev;
      }

      const termToMove = sourceBucket.terms[sourceIndex];

      if (sourceBucketId === targetBucketId) {
        const updatedTerms = [...sourceBucket.terms];
        updatedTerms.splice(sourceIndex, 1);
        const clampedIndex = Math.max(
          0,
          Math.min(targetIndex, updatedTerms.length)
        );
        updatedTerms.splice(clampedIndex, 0, termToMove);

        const updatedBucket = { ...sourceBucket, terms: updatedTerms };
        return prev.map((bucket, idx) =>
          idx === sourceBucketIndex ? updatedBucket : bucket
        );
      }

      const updatedSourceTerms = [...sourceBucket.terms];
      updatedSourceTerms.splice(sourceIndex, 1);
      const updatedSourceBucket = {
        ...sourceBucket,
        terms: updatedSourceTerms,
      };

      const targetBucket = prev[targetBucketIndex];
      const clampedTargetIndex = Math.max(
        0,
        Math.min(targetIndex, targetBucket.terms.length)
      );
      const updatedTargetTerms = [...targetBucket.terms];
      updatedTargetTerms.splice(clampedTargetIndex, 0, termToMove);
      const updatedTargetBucket = {
        ...targetBucket,
        terms: updatedTargetTerms,
      };

      return prev.map((bucket, idx) => {
        if (idx === sourceBucketIndex) return updatedSourceBucket;
        if (idx === targetBucketIndex) return updatedTargetBucket;
        return bucket;
      });
    });
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

    const handleCopy = async () => {
    if (!renderedQueryString) return;

    try {
      await navigator.clipboard.writeText(renderedQueryString);

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


  return (
    <div className="min-h-screen bg-app text-slate-900">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <HeaderBar onOpenSavedSearches={() => setIsSavedPanelOpen(true)} />

        {/* Main layout container: subtle panel around both columns */}
        <div className="mt-6 rounded-2xl bg-white/80 border border-slate-100 shadow-soft p-4">
          <div className="grid grid-cols-[1.4fr_1fr] gap-6 items-start">
            {/* Left: Buckets */}
            <BucketsPanel
              buckets={buckets}
              handleAddBucket={handleAddBucket}
              handleBucketNameChange={handleBucketNameChange}
              handleToggleBucket={handleToggleBucket}
              handleRemoveTerm={handleRemoveTerm}
              handleAddTerm={handleAddTerm}
              handleOperatorChange={handleOperatorChange}
              handleReorderBuckets={handleReorderBuckets}
              handleDeleteBucket={handleDeleteBucket}
              onMoveTerm={handleMoveTerm}
            />

            {/* Right: Boolean preview */}
            <BooleanPreview
              booleanString={renderedQueryString}
              outputMode={outputMode}
              setOutputMode={setOutputMode}
              onCopy={handleCopy}
              currentName={currentName}
              onNameChange={handleNameChange}
              isDirty={isDirty}
              currentSavedId={currentSavedId}
              onSave={handleSave}
              hasContent={builderHasContent}
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
      <SavedSearchPanel
        open={isSavedPanelOpen}
        onClose={() => setIsSavedPanelOpen(false)}
        savedSearches={savedSearches}
        onLoad={handleLoadSavedFromPanel}
        onRename={handleRenameSaved}
        onDelete={handleDeleteSaved}
        currentSavedId={currentSavedId}
      />
    </div>
  );
}

export default App;

