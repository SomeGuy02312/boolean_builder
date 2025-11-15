type TermPillProps = {
  term: string;
  colorClass: string;
  onRemove: () => void;
};

const TermPill = ({ term, colorClass, onRemove }: TermPillProps) => {
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
