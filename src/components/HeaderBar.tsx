type HeaderBarProps = {
  onOpenSavedSearches: () => void;
};

const HeaderBar = ({ onOpenSavedSearches }: HeaderBarProps) => {
  return (
    <header className="flex items-center justify-between pb-4 border-b border-slate-200/60">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white shadow-soft flex items-center justify-center overflow-hidden">
          <img
            src="/squirrel-logo.png"
            alt="Boolean Builder logo"
            className="h-9 w-9 object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            Boolean Builder
          </h1>
          <p className="text-sm text-slate-500">
            Find your purple squirrels with clean, visual Boolean.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenSavedSearches}
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition"
      >
        Saved searches
      </button>
    </header>
  );
};

export default HeaderBar;
