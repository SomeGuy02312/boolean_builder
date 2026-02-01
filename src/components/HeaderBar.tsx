type HeaderBarProps = {
  onOpenHelp: () => void;
};

const HeaderBar = ({ onOpenHelp }: HeaderBarProps) => {
  const logoSrc = `${import.meta.env.BASE_URL}purple_squirrel_boolean_logo.jpg`;

  return (
    <header className="pb-4 border-b border-slate-200/60">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-lg overflow-hidden">
          <img
            src={logoSrc}
            alt="Boolean Builder logo"
            className="h-16 w-16 object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            The Ultimate Free Boolean Builder
          </h1>
          <p className="text-sm text-slate-500">
            Find your purple squirrels with clean, visual Boolean.
          </p>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            onClick={onOpenHelp}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition"
          >
            Help
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
