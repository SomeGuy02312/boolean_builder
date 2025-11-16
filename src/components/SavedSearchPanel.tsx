import { useMemo, useState } from "react";
import type { SavedSearch } from "../lib/savedSearches";

type SavedSearchPanelProps = {
  open: boolean;
  onClose: () => void;
  savedSearches: SavedSearch[];
  onLoad: (saved: SavedSearch) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  currentSavedId: string | null;
};

const formatDate = (iso: string) => {
  if (!iso) return "Unknown";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatRelative = (iso: string) => {
  if (!iso) return "Never";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Never";
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
};

const SavedSearchPanel = ({
  open,
  onClose,
  savedSearches,
  onLoad,
  onRename,
  onDelete,
  currentSavedId,
}: SavedSearchPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const sorted = useMemo(() => {
    return [...savedSearches].sort((a, b) => {
      const aTs = Date.parse(a.lastUsedAt ?? "");
      const bTs = Date.parse(b.lastUsedAt ?? "");
      if (Number.isNaN(aTs) && Number.isNaN(bTs)) return 0;
      if (Number.isNaN(aTs)) return 1;
      if (Number.isNaN(bTs)) return -1;
      return bTs - aTs;
    });
  }, [savedSearches]);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return sorted;
    return sorted.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [searchTerm, sorted]);

  if (!open) return null;

  const handleRenameSubmit = (id: string) => {
    const value = editingValue.trim();
    if (value) {
      onRename(id, value);
    }
    setEditingId(null);
    setEditingValue("");
  };

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(
      `Delete "${name}"? This can't be undone.`
    );
    if (confirmed) {
      onDelete(id);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="flex-1 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="w-full max-w-md bg-white shadow-softLg border-l border-slate-200 p-4 flex flex-col transform transition-transform duration-200 translate-x-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Saved searches</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 transition"
            aria-label="Close saved searches"
          >
            ×
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary mb-4"
        />

        <div className="flex-1 overflow-auto space-y-2 pr-1">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500">No saved searches yet.</p>
          )}
          {filtered.map((item) => {
            const isEditing = editingId === item.id;
            const isActive = currentSavedId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition p-3 ${
                  isActive ? "border-slate-300 bg-slate-50" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {isEditing ? (
                    <input
                      type="text"
                      className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onLoad(item);
                        onClose();
                      }}
                      className="flex-1 text-left"
                    >
                      <p className="font-medium text-sm text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {item.shortDescription ||
                          item.queryString ||
                          "No description"}
                      </p>
                    </button>
                  )}
                  {!isEditing && (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditingValue(item.name);
                        }}
                        className="text-slate-500 hover:text-slate-800"
                        aria-label={`Rename ${item.name}`}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.name)}
                        className="text-slate-500 hover:text-red-500"
                        aria-label={`Delete ${item.name}`}
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                  <span>Created {formatDate(item.createdAt)}</span>
                  <span>·</span>
                  <span>Last used {formatRelative(item.lastUsedAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
};

export default SavedSearchPanel;
