type SearchControlsBarProps = {
  currentName: string;
  onNameChange: (value: string) => void;
  currentSavedId: string | null;
  isDirty: boolean;
  hasContent: boolean;
  onSave: () => boolean;
  onSaveAsNew: () => boolean;
  onOpenSavedSearches: () => void;
};

const SearchControlsBar = ({
  currentName,
  onNameChange,
  currentSavedId,
  isDirty,
  hasContent,
  onSave,
  onSaveAsNew,
  onOpenSavedSearches,
}: SearchControlsBarProps) => {
  const trimmedName = currentName.trim();
  const hasExisting = Boolean(currentSavedId);
  const saveLabel = !hasExisting
    ? "Save"
    : isDirty
    ? "Save changes"
    : "Saved";
  const isSaveDisabled =
    !hasContent || trimmedName.length === 0 || (hasExisting && !isDirty);

  const handleSaveClick = () => {
    if (isSaveDisabled) return;
    onSave();
  };

  const handleSaveAsNewClick = () => {
    if (!hasContent || !hasExisting) return;
    onSaveAsNew();
  };

  return (
    <div className="rounded-2xl bg-white/80 border border-slate-100 shadow-soft p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-2 flex-1">
          <input
            type="text"
            placeholder="Name this search..."
            value={currentName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full lg:w-auto lg:min-w-[220px] lg:max-w-[280px] rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaveDisabled}
              className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium shadow-soft transition bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-softLg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saveLabel}
            </button>
            {hasExisting && (
              <button
                type="button"
                onClick={handleSaveAsNewClick}
                disabled={!hasContent}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save as new
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSavedSearches}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-light text-white px-4 py-1.5 text-sm font-medium shadow-soft hover:shadow-softLg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Saved searches
        </button>
      </div>
    </div>
  );
};

export default SearchControlsBar;
