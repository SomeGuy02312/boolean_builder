const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.58 2 12.26c0 4.51 2.87 8.33 6.84 9.69.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.17-1.11-1.48-1.11-1.48-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.09 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.24 9.24 0 0 1 12 6.44c.85 0 1.7.11 2.5.32 1.9-1.32 2.74-1.05 2.74-1.05.56 1.42.21 2.47.1 2.73.64.72 1.03 1.64 1.03 2.76 0 3.96-2.34 4.83-4.57 5.09.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .26.18.59.69.48A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
    />
  </svg>
);

type HelpPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

const HelpPanel = ({ isOpen, onClose }: HelpPanelProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="flex-1 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="w-full max-w-lg bg-white shadow-softLg border-l border-slate-200 flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-medium text-slate-700">Help &amp; tips</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition text-sm"
            aria-label="Close help panel"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-sm text-slate-700">
          <section>
            <h3 className="text-sm font-semibold text-slate-900">What this tool is</h3>
            <p className="mt-2 text-slate-600">
              A visual Boolean builder for recruiters and sourcers. Build clean search strings
              for LinkedIn, SeekOut, your ATS, or job boards without memorizing every operator or
              parenthesis rule.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">Core concepts</h3>
            <div className="mt-2 space-y-3 text-slate-600">
              <div>
                <h4 className="text-xs uppercase tracking-wide text-slate-500">Search</h4>
                <p>Create and iterate on Boolean strings for specific roles or evergreen pipelines.</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wide text-slate-500">Groups</h4>
                <p>
                  Formerly “buckets.” Each group is a set of related keywords—titles, skills,
                  companies, or exclusions.
                </p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wide text-slate-500">Pills / terms</h4>
                <p>Each keyword becomes a pill inside a group so you can drag, delete, or edit quickly.</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wide text-slate-500">Operators</h4>
            <ul className="list-disc list-inside text-slate-600">
              <li>
                <strong>AND</strong> – combines groups so both conditions must be true.
              </li>
              <li>
                <strong>OR</strong> – joins alternatives inside a group.
              </li>
              <li>
                <strong>NOT</strong> – excludes terms; some tools use a leading minus.
              </li>
            </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">How to build a search</h3>
            <ol className="mt-2 list-decimal list-inside space-y-1 text-slate-600">
              <li>Start a new search (Clear) if you want a blank canvas.</li>
              <li>Add a group and give it a clear name.</li>
              <li>Add keywords as pills—titles, skills, companies, or exclusions.</li>
              <li>Add more groups for skills, companies, or an exclusions group.</li>
              <li>Review the Boolean string on the right and copy when ready.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">Saving searches &amp; import/export</h3>
            <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600">
              <li>Use Save / Save changes / Save as new from the header controls.</li>
              <li>Open the Saved searches panel to load, rename, or delete saved searches.</li>
              <li>Export all downloads a JSON file; Import &amp; replace swaps your current list.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">Boolean basics for recruiters</h3>
            <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>AND</strong> narrows – everyone must match both sides.
              </li>
              <li>
                <strong>OR</strong> broadens – use for similar titles or skills.
              </li>
              <li>
                <strong>NOT</strong> excludes – drop unrelated skills or titles.
              </li>
              <li>Use quotes for phrases (“product manager”).</li>
              <li>
                Parentheses group logic, e.g.{" "}
                <span className="font-mono">
                  ("product manager" OR "product owner") AND (SaaS OR "B2B software")
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">Tips for sourcing</h3>
            <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600">
              <li>Create groups for titles, skills, companies, and exclusions.</li>
              <li>Save evergreen searches for recurring roles.</li>
              <li>Keep an exclusions group handy for internal titles or noisy terms.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">
              How this app works &amp; tech used
            </h3>
            <p className="mt-2 text-slate-600">
              This app is a small, focused tool built for recruiters and sourcers who live in
              Boolean every day. It runs entirely in your browser—no login, no server, and your
              searches never leave your machine.
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>React + TypeScript.</strong> Single-page UI with strong types for safer
                refactors.
              </li>
              <li>
                <strong>Local storage, not a database.</strong> Saved searches stay in your browser
                unless you export or import them.
              </li>
              <li>
                <strong>Vite-powered dev environment.</strong> Fast refresh and builds keep
                iteration quick.
              </li>
              <li>
                <strong>Composable hooks &amp; components.</strong> Features like saved searches
                and import/export reuse small, focused pieces.
              </li>
            </ul>
            <p className="mt-4 text-slate-600">
              If you’d like to see more projects like this, follow along on GitHub:
            </p>
            <a
              href="https://github.com/SomeGuy02312"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <GithubIcon className="w-4 h-4" />
              <span>See more on GitHub</span>
            </a>
          </section>
        </div>
      </aside>
    </div>
  );
};

export default HelpPanel;
