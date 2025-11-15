import type { TermColorKey } from "../lib/types";

const TERM_COLOR_CLASSES: Record<TermColorKey, string> = {
  lavender: "bg-pill-lavender text-slate-800",
  blue: "bg-pill-blue text-slate-800",
  mint: "bg-pill-mint text-slate-800",
  cyan: "bg-cyan-100 text-cyan-900",
  teal: "bg-teal-100 text-teal-900",
  yellow: "bg-yellow-100 text-yellow-900",
  orange: "bg-orange-100 text-orange-900",
  red: "bg-red-100 text-red-900",
  pink: "bg-pink-100 text-pink-900",
  violet: "bg-violet-100 text-violet-900",
};

type TermPillProps = {
  term: string;
  colorKey: TermColorKey;
  onRemove: () => void;
};

const TermPill = ({ term, colorKey, onRemove }: TermPillProps) => {
  const colorClass = TERM_COLOR_CLASSES[colorKey];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs shadow-pill ${colorClass}`}
    >
      {term}
      <button
        type="button"
        onClick={onRemove}
        className="text-slate-500 hover:text-slate-700"
      >
        ×
      </button>
    </span>
  );
};

export default TermPill;
