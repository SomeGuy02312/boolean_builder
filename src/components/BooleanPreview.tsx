import type { OutputMode } from "../lib/types";

type BooleanPreviewProps = {
  booleanString: string;
  outputMode: OutputMode;
  setOutputMode: (mode: OutputMode) => void;
  onCopy: () => void;
};

const tokenizeBoolean = (input: string): Array<string> => {
  const tokens: string[] = [];
  const pattern =
    /"(?:[^"\\]|\\.)*"|\bAND NOT\b|\bAND\b|\bOR\b|\bNOT\b|\(|\)|\s+|[^()\s]+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input)) !== null) {
    tokens.push(match[0]);
  }
  return tokens;
};

const renderHighlighted = (input: string) => {
  const tokens = tokenizeBoolean(input);
  return tokens.map((token, index) => {
    if (/^\s+$/.test(token)) return token;
    if (token === "(" || token === ")") {
      return (
        <span key={index} className="text-slate-400">
          {token}
        </span>
      );
    }
    if (token === "AND" || token === "OR" || token === "NOT" || token === "AND NOT") {
      let operatorClass = "text-indigo-600";
      if (token === "AND") operatorClass = "text-emerald-600";
      if (token === "OR") operatorClass = "text-blue-600";
      if (token === "AND NOT" || token === "NOT") operatorClass = "text-rose-600";
      return (
        <span key={index} className={`${operatorClass} font-semibold`}>
          {token}
        </span>
      );
    }
    return (
      <span key={index} className="text-slate-900">
        {token}
      </span>
    );
  });
};

const BooleanPreview = ({
  booleanString,
  outputMode,
  setOutputMode,
  onCopy,
}: BooleanPreviewProps) => {

  return (
    <section className="pl-6 border-l border-slate-200/70">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Boolean preview</h2>

        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs shadow-soft">
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

      <div className="rounded-bucket bg-card shadow-soft border border-slate-100 p-4 h-[320px] flex flex-col">
        <pre className="flex-1 overflow-auto text-xs font-mono whitespace-pre-wrap">
          {booleanString
            ? renderHighlighted(booleanString)
            : "/* Start adding terms to see your Boolean here */"}
        </pre>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onCopy}
            disabled={!booleanString}
            className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary-light px-4 py-1.5 text-sm font-medium text-white shadow-soft hover:shadow-softLg disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Copy
          </button>
        </div>
      </div>
    </section>
  );
};

export default BooleanPreview;
