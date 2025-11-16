import { useMemo, useState, useRef, type ChangeEvent } from "react";
import { Pencil, Trash } from "lucide-react";
import type { SavedSearch } from "../lib/savedSearches";
import { SAVED_SEARCHES_EXPORT_TYPE } from "../lib/savedSearches";

type SavedSearchPanelProps = {
  open: boolean;
  onClose: () => void;
  items: SavedSearch[];
  onOpenSearch: (saved: SavedSearch) => void;
  onRename: (id: string, name: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
  onDelete: (id: string) => void;
  onExportAll: () => string;
  onReplaceAll: (items: SavedSearch[]) => void;
  currentSavedId: string | null;
};

const formatLastUsed = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `Last used ${date.toLocaleDateString()}`;
};

const SavedSearchPanel = ({
  open,
  onClose,
  items,
  onOpenSearch,
  onRename,
  onUpdateDescription,
  onDelete,
  onExportAll,
  onReplaceAll,
  currentSavedId,
}: SavedSearchPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingDescriptionId, setEditingDescriptionId] = useState<string | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const aTime = Date.parse(a.lastUsedAt ?? "");
      const bTime = Date.parse(b.lastUsedAt ?? "");
      if (Number.isNaN(bTime) && Number.isNaN(aTime)) return 0;
      if (Number.isNaN(bTime)) return 1;
      if (Number.isNaN(aTime)) return -1;
      return bTime - aTime;
    });
  }, [items]);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return sorted;
    return sorted.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [searchTerm, sorted]);

  const startEditingDescription = (item: SavedSearch) => {
    setEditingDescriptionId(item.id);
    setDescriptionDraft(item.shortDescription ?? "");
  };

  const startRenaming = (item: SavedSearch) => {
    setEditingId(item.id);
    setEditingValue(item.name);
  };

  const cancelEditingDescription = () => {
    setEditingDescriptionId(null);
    setDescriptionDraft("");
  };

  const saveDescription = (item: SavedSearch) => {
    onUpdateDescription(item.id, descriptionDraft);
    setEditingDescriptionId(null);
    setDescriptionDraft("");
  };

  if (!open) return null;

  const handleRenameSubmit = (id: string) => {
    const next = editingValue.trim();
    if (next) {
      onRename(id, next);
    }
    setEditingId(null);
    setEditingValue("");
  };

  const handleExportAll = () => {
    const json = onExportAll();
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `boolean-builder-searches-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleImportFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let text = "";
    try {
      text = await file.text();
    } catch {
      alert("Failed to read file.");
      return;
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      alert("Could not parse JSON file.");
      return;
    }

    const isValid =
      data &&
      (data as { type?: string }).type === SAVED_SEARCHES_EXPORT_TYPE &&
      typeof (data as { version?: number }).version === "number" &&
      Array.isArray((data as { items?: SavedSearch[] }).items);

    if (!isValid) {
      alert("This file does not look like a valid saved-search export.");
      return;
    }

    const confirmed = window.confirm(
      "Importing this file will replace all your current saved searches. Continue?"
    );
    if (!confirmed) return;

    const parsed = data as { items: SavedSearch[] };
    onReplaceAll(parsed.items);
    alert(`Imported ${parsed.items.length} searches and replaced your previous list.`);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="flex-1 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="w-full max-w-lg bg-white shadow-softLg border-l border-slate-200 flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Saved searches</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition"
            aria-label="Close saved searches"
          >
            Close
          </button>
        </header>

        <div className="flex flex-col h-full">
          <div className="px-4 py-3 border-b border-slate-200">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2">
            {filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 px-4 text-center">
                <p>
                  No saved searches yet. Build a search, name it in the header, then click{" "}
                  <span className="font-semibold">Save</span>.
                </p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {filtered.map((item) => {
                  const isRenaming = editingId === item.id;
                  const isActive = currentSavedId === item.id;
                  const isEditingDescriptionForThisItem =
                    editingDescriptionId === item.id;

                  if (isRenaming) {
                    return (
                      <li key={item.id}>
                        <input
                          type="text"
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          value={editingValue}
                          autoFocus
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => handleRenameSubmit(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRenameSubmit(item.id);
                            } else if (e.key === "Escape") {
                              setEditingId(null);
                              setEditingValue("");
                            }
                          }}
                        />
                      </li>
                    );
                  }

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditingDescriptionForThisItem) return;
                          onOpenSearch(item);
                          onClose();
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left border transition-colors ${
                          isActive
                            ? "border-slate-300 bg-slate-50"
                            : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium truncate text-slate-900">
                              {item.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startRenaming(item);
                              }}
                              className="p-1 text-muted-foreground hover:text-foreground transition"
                              aria-label="Edit name"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            {(item.isExample ||
                              item.name.trim().endsWith("(Example)")) && (
                              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600">
                                Example
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive transition"
                            aria-label="Delete search"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {isEditingDescriptionForThisItem ? (
                          <div className="mt-1 space-y-1">
                            <textarea
                              value={descriptionDraft}
                              onChange={(e) => setDescriptionDraft(e.target.value)}
                              rows={2}
                              placeholder="Add a short description for this search (role, level, location, notes)..."
                              className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                  e.preventDefault();
                                  saveDescription(item);
                                }
                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  cancelEditingDescription();
                                }
                              }}
                              onBlur={() => {
                                if (editingDescriptionId === item.id) {
                                  saveDescription(item);
                                }
                              }}
                            />
                            <p className="text-[11px] text-muted-foreground">
                              Press <span className="font-medium">Ctrl+Enter</span> to save,{" "}
                              <span className="font-medium">Esc</span> to cancel.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-0.5">
                            <div className="inline-flex items-start gap-1.5 max-w-full">
                              {item.shortDescription ? (
                                <p className="text-xs text-muted-foreground line-clamp-2 max-w-full">
                                  {item.shortDescription}
                                </p>
                              ) : (
                                <p className="text-xs italic text-muted-foreground max-w-full">
                                  Add description
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingDescription(item);
                                }}
                                className="p-1 text-muted-foreground hover:text-foreground transition"
                                aria-label="Edit description"
                            >
                              <Pencil className="w-2.5 h-2.5 -translate-y-px" />
                              </button>
                            </div>
                          </div>
                        )}
                        <p className="mt-0.5 text-[11px] text-slate-500/80">
                          {formatLastUsed(item.lastUsedAt)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-slate-200 px-4 py-3 text-xs">
            <p className="text-slate-500 mb-2">Backup or move your saved searches:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportAll}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:border-slate-400 transition"
              >
                Export all
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Import &amp; replace…
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFileChange}
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SavedSearchPanel;
