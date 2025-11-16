// src/App.tsx

import { useEffect, useState, useMemo, useCallback } from "react";
import type {
  Bucket,
  OutputMode,
  AppState as SerializedBuilderState,
  Operator,
  Term,
  TermColorKey,
} from "./lib/types";
import { buildBoolean } from "./lib/booleanBuilder";
import confetti from "canvas-confetti";
import HeaderBar from "./components/HeaderBar";
import BucketsPanel from "./components/BucketsPanel";
import BooleanPreview from "./components/BooleanPreview";
import SearchControlsBar from "./components/SearchControlsBar";
import SavedSearchPanel from "./components/SavedSearchPanel";
import HelpPanel from "./components/HelpPanel";
import { useSavedSearches } from "./hooks/useSavedSearches";
import type { SavedSearch } from "./lib/savedSearches";


const STORAGE_KEY = "boolean-builder-state-v1";
const INTRO_PANEL_STORAGE_KEY = "boolean-builder-hide-intro";

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

const formatLastUsed = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `Last used ${date.toLocaleDateString()}`;
};

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
    name: "Group 1",
    terms: [],
    isEnabled: true,
    operatorAfter: "AND",
  },
];

const cloneBucket = (bucket: Bucket): Bucket => ({
  ...bucket,
  terms: bucket.terms.map((term) => ({ ...term })),
});

const createDefaultBuckets = (): Bucket[] =>
  DEFAULT_BUCKETS.map((bucket) => cloneBucket(bucket));

function createDefaultBuilderState(): SerializedBuilderState {
  return {
    buckets: createDefaultBuckets(),
    outputMode: "pretty",
  };
}

function loadInitialState(): SerializedBuilderState {
  if (typeof window === "undefined") {
    return createDefaultBuilderState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultBuilderState();
    }
    const parsed = JSON.parse(raw) as SerializedBuilderState;
    if (!parsed || !Array.isArray(parsed.buckets)) {
      return createDefaultBuilderState();
    }
    const mode: OutputMode =
      parsed.outputMode === "minified" ? "minified" : "pretty";

    const persistedBuckets = parsed.buckets as PersistedBucket[];

    const normalizedBuckets = persistedBuckets.length
      ? normalizeBuckets(persistedBuckets)
      : createDefaultBuckets();

    return {
      buckets: normalizedBuckets,
      outputMode: mode,
    };
  } catch {
    return createDefaultBuilderState();
  }
}

function App() {
  const [builderState, setBuilderState] = useState<SerializedBuilderState>(() =>
    loadInitialState()
  );
  const { buckets, outputMode } = builderState;
  const {
    items: savedSearches,
    create,
    update,
    deleteSearch,
    markUsed,
    replaceAll,
    exportAll,
    getRecents,
  } = useSavedSearches();
  const recents = getRecents(4);
  const [displayRecents, setDisplayRecents] = useState<SavedSearch[]>(recents);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayRecents((prev) => {
      if (recents.length === 0) {
        return [];
      }

      if (prev.length === 0) {
        return recents;
      }

      const newIds = recents.map((item) => item.id);
      const oldIds = prev.map((item) => item.id);
      const sameLength = newIds.length === oldIds.length;
      const membershipSame =
        sameLength && newIds.every((id) => oldIds.includes(id));

      if (membershipSame) {
        return prev;
      }

      return recents;
    });
  }, [recents]);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState("");
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isIntroHidden, setIsIntroHidden] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(INTRO_PANEL_STORAGE_KEY) === "true";
  });

  const booleanString = useMemo(
    () => buildBoolean(buckets, outputMode),
    [buckets, outputMode]
  );
  const hasContent = useMemo(() => {
    return (
      builderState.buckets?.some((bucket) => bucket.terms.length > 0) ?? false
    );
  }, [builderState.buckets]);

  // Persist to localStorage whenever buckets or outputMode change
  useEffect(() => {
    const state: SerializedBuilderState = { buckets, outputMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [buckets, outputMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(INTRO_PANEL_STORAGE_KEY, isIntroHidden ? "true" : "false");
  }, [isIntroHidden]);

  const isDirty = useMemo(() => {
    if (lastSavedSnapshot === null) {
      return hasContent;
    }
    const snapshot = JSON.stringify({
      buckets,
      outputMode,
      queryString: booleanString,
      name: currentName.trim(),
    });
    return snapshot !== lastSavedSnapshot;
  }, [buckets, outputMode, booleanString, currentName, lastSavedSnapshot, hasContent]);

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
    setBuilderState((prev) => ({
      ...prev,
      buckets: updater(prev.buckets),
    }));
  };

  const setOutputMode = (mode: OutputMode) => {
    setBuilderState((prev) => ({ ...prev, outputMode: mode }));
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
      setBuilderState({
        buckets: saved.state.buckets,
        outputMode: saved.state.outputMode,
      });
      setCurrentSavedId(saved.id);
      setCurrentName(saved.name);
      setLastSavedSnapshot(
        JSON.stringify({
          buckets: saved.state.buckets,
          outputMode: saved.state.outputMode,
          queryString: saved.queryString,
          name: saved.name.trim(),
        })
      );
      markUsed(saved.id);
    },
    [markUsed]
  );
  const handleSave = useCallback(() => {
    if (!hasContent) return false;
    const trimmedName = currentName.trim();
    const nameToUse = trimmedName || "Untitled search";

    if (!currentSavedId) {
      const saved = create({
        name: nameToUse,
        shortDescription: undefined,
        state: builderState,
        queryString: booleanString,
      });
      setCurrentSavedId(saved.id);
      setCurrentName(saved.name);
      markUsed(saved.id);
    } else {
      if (!isDirty) return false;
      update(currentSavedId, {
        name: nameToUse,
        state: builderState,
        queryString: booleanString,
      });
      setCurrentName(nameToUse);
      markUsed(currentSavedId);
    }
    setLastSavedSnapshot(
      JSON.stringify({
        buckets: builderState.buckets,
        outputMode: builderState.outputMode,
        queryString: booleanString,
        name: nameToUse.trim(),
      })
    );
    return true;
  }, [
    hasContent,
    currentName,
    currentSavedId,
    booleanString,
    markUsed,
    builderState,
    create,
    update,
    isDirty,
  ]);
  const handleSaveAsNew = useCallback(() => {
    if (!hasContent) return false;
    const trimmedName = currentName.trim();
    const nameToUse = trimmedName || "Untitled search";

    const saved = create({
      name: nameToUse,
      shortDescription: undefined,
      state: builderState,
      queryString: booleanString,
    });
    setCurrentSavedId(saved.id);
    setCurrentName(saved.name);
    markUsed(saved.id);
    setLastSavedSnapshot(
      JSON.stringify({
        buckets: builderState.buckets,
        outputMode: builderState.outputMode,
        queryString: booleanString,
        name: saved.name.trim(),
      })
    );
    return true;
  }, [hasContent, currentName, builderState, booleanString, create, markUsed]);
  const handleClearSearch = useCallback(() => {
    const initialState = createDefaultBuilderState();
    setBuilderState(initialState);
    setCurrentSavedId(null);
    setCurrentName("");
    setLastSavedSnapshot(null);
  }, []);
  const handleNameChange = useCallback((value: string) => {
    setCurrentName(value);
  }, []);
  const handleRenameSaved = useCallback(
    (id: string, name: string) => {
      update(id, { name });
      if (currentSavedId === id) {
        setCurrentName(name);
      }
    },
    [update, currentSavedId]
  );
  const handleDeleteSaved = useCallback(
    (id: string) => {
      deleteSearch(id);
      if (currentSavedId === id) {
        setCurrentSavedId(null);
        setCurrentName("");
        setLastSavedSnapshot(null);
      }
    },
    [deleteSearch, currentSavedId]
  );
  const handleReplaceAllSaved = useCallback(
    (items: SavedSearch[]) => {
      replaceAll(items);
      handleClearSearch();
      if (items.length > 0) {
        loadSavedSearch(items[0]);
      }
    },
    [replaceAll, handleClearSearch, loadSavedSearch]
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
            name: "Group 1",
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
          name: `Group ${newIndex}`,
          terms: [],
          isEnabled: true,
          operatorAfter: "AND",
        },
      ];
    });
  };

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


  return (
    <div className="min-h-screen bg-app text-slate-900">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <HeaderBar onOpenHelp={() => setIsHelpOpen(true)} />

        {/* Search controls */}
        <div className="mt-4">
        <SearchControlsBar
          currentName={currentName}
          onNameChange={handleNameChange}
          currentSavedId={currentSavedId}
          isDirty={isDirty}
          hasContent={hasContent}
          onSave={handleSave}
          onSaveAsNew={handleSaveAsNew}
          onOpenSavedSearches={() => setIsSavedPanelOpen(true)}
        />
        {displayRecents.length > 0 && (
          <section className="mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Recent searches
            </h2>
            <div className="flex flex-wrap gap-3">
              {displayRecents.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => loadSavedSearch(item)}
                  className="group text-left flex-1 min-w-[220px] max-w-[280px] rounded-lg border border-slate-200 bg-white/70 px-3 py-2 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium line-clamp-1 text-slate-900">
                      {item.name}
                    </span>
                    {item.name.trim().endsWith("(Example)") && (
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] bg-slate-100 text-slate-500">
                        Example
                      </span>
                    )}
                  </div>
                  {item.shortDescription ? (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.shortDescription}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.queryString}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatLastUsed(item.lastUsedAt)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}
        </div>

        {/* Empty state intro */}
        {!isIntroHidden && !hasContent && currentSavedId === null && (
          <div className="mt-6 rounded-2xl bg-white/80 border border-slate-100 shadow-soft p-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Build Boolean searches visually
              </h2>
              <button
                type="button"
                onClick={() => setIsIntroHidden(true)}
                className="inline-flex items-center rounded-full border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition"
              >
                Hide
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Use groups of related keywords to build clean Boolean strings for
              LinkedIn, SeekOut, or your ATS. No need to remember every operator
              or parenthesis rule.
            </p>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                How to get started
              </p>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                <li>Add a group – for titles, skills, companies, or exclusions.</li>
                <li>Add keywords – each keyword becomes a pill in that group.</li>
                <li>
                  Tune the logic – adjust the operators to match how you’d write the
                  search.
                </li>
                <li>Copy &amp; use – paste the final Boolean string into your sourcing tool.</li>
              </ul>
            </div>
          </div>
        )}

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
              onClear={handleClearSearch}
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
      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <SavedSearchPanel
        open={isSavedPanelOpen}
        onClose={() => setIsSavedPanelOpen(false)}
        items={savedSearches}
        onOpenSearch={(saved) => {
          loadSavedSearch(saved);
          setIsSavedPanelOpen(false);
        }}
        onRename={handleRenameSaved}
        onDelete={handleDeleteSaved}
        onExportAll={exportAll}
        onReplaceAll={handleReplaceAllSaved}
        currentSavedId={currentSavedId}
      />
    </div>
  );
}

export default App;

