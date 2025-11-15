import type { Bucket, Operator } from "../lib/types";
import TermPill from "./TermPill";

type BucketCardProps = {
  bucket: Bucket;
  index: number;
  isLast: boolean;
  pillColorClasses: string[];
  onNameChange: (id: string, name: string) => void;
  onToggle: (id: string) => void;
  onAddTerm: (bucketId: string, term: string) => void;
  onRemoveTerm: (bucketId: string, termIndex: number) => void;
  onOperatorChange: (bucketId: string, operator: Operator) => void;
};

const BucketCard = ({
  bucket,
  index,
  isLast,
  pillColorClasses,
  onNameChange,
  onToggle,
  onAddTerm,
  onRemoveTerm,
  onOperatorChange,
}: BucketCardProps) => {
  return (
    <div
      className="rounded-bucket bg-card shadow-soft border border-slate-100 p-4 space-y-3 hover:shadow-softLg hover:-translate-y-[1px] transition"
      data-bucket-index={index}
    >
      {/* Bucket header */}
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          value={bucket.name}
          onChange={(e) => onNameChange(bucket.id, e.target.value)}
          className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <label className="flex items-center gap-1 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={bucket.isEnabled}
            onChange={() => onToggle(bucket.id)}
          />
          <span>Enabled</span>
        </label>
      </div>

      {/* Terms */}
      <div className="flex flex-wrap gap-2">
        {bucket.terms.map((term, i) => (
          <TermPill
            key={`${bucket.id}-term-${i}`}
            term={term}
            colorClass={pillColorClasses[i % pillColorClasses.length]}
            onRemove={() => onRemoveTerm(bucket.id, i)}
          />
        ))}
        {bucket.terms.length === 0 && (
          <span className="text-xs text-slate-400">No terms yet</span>
        )}
      </div>

      {/* Add term input */}
      <input
        type="text"
        placeholder="Type a term and press Enter (or paste multiple, then Enter)"
        className="w-full rounded-md border border-slate-200/80 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const value = e.currentTarget.value;
            if (!value) return;

            if (value.includes("\n") || value.includes(",")) {
              const pieces = value
                .split(/[\n,]/)
                .map((p) => p.trim())
                .filter(Boolean);
              pieces.forEach((p) => onAddTerm(bucket.id, p));
            } else {
              onAddTerm(bucket.id, value);
            }

            e.currentTarget.value = "";
          }
        }}
      />

      {/* Operator after this bucket (if not last) */}
      {!isLast && (
        <div className="pt-2 border-t border-dashed border-slate-200">
          <label className="text-xs text-slate-500">Operator to next bucket:</label>
          <select
            value={bucket.operatorAfter}
            onChange={(e) =>
              onOperatorChange(bucket.id, e.target.value as Operator)
            }
            className="ml-2 rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
            <option value="AND NOT">AND NOT</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default BucketCard;
