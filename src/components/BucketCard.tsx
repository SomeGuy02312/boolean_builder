import { useDroppable, type DraggableAttributes } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Power, Trash2 } from "lucide-react";
import type { Bucket } from "../lib/types";
import { getBucketTheme } from "../lib/bucketThemes";
import TermPill from "./TermPill";

type BucketCardProps = {
  bucket: Bucket;
  index: number;
  onNameChange: (id: string, name: string) => void;
  onToggle: (id: string) => void;
  onAddTerm: (bucketId: string, term: string) => void;
  onRemoveTerm: (bucketId: string, termIndex: number) => void;
  onOperatorWithinChange: (id: string, operator: "AND" | "OR") => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  dragHandleProps?: {
    attributes: DraggableAttributes;
    listeners?: SyntheticListenerMap;
  };
  isDragging?: boolean;
};

const BucketCard = ({
  bucket,
  index,
  onNameChange,
  onToggle,
  onAddTerm,
  onRemoveTerm,
  onOperatorWithinChange,
  onDelete,
  canDelete,
  dragHandleProps,
  isDragging,
}: BucketCardProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(bucket.name);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const endDropId = `term-drop-end::${bucket.id}`;
  const { setNodeRef: setEndDropRef } = useDroppable({
    id: endDropId,
  });

  useEffect(() => {
    if (!isEditingTitle) {
      setDraftTitle(bucket.name);
    }
  }, [bucket.name, isEditingTitle]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const commitTitle = () => {
    const trimmed = draftTitle.trim();
    onNameChange(bucket.id, trimmed || bucket.name);
    setIsEditingTitle(false);
  };

  const cancelTitleEdit = () => {
    setDraftTitle(bucket.name);
    setIsEditingTitle(false);
  };

  const theme = getBucketTheme(bucket.themeKey);
  const cardStyle: CSSProperties = {
    "--bucket-border": theme.border,
    "--bucket-halo": theme.halo,
    "--bucket-handle": theme.handle,
    "--bucket-pill-bg": theme.pillBg,
    "--bucket-pill-text": theme.pillText,
  } as CSSProperties;

  return (
    <div
      style={cardStyle}
      className={`bucket-card rounded-bucket bg-card border p-4 space-y-3 hover:-translate-y-[1px] transition ${
        isDragging ? "opacity-85" : "opacity-100"
      }`}
      data-bucket-index={index}
    >
      {/* Bucket header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <button
            type="button"
            {...dragHandleProps?.attributes}
            {...dragHandleProps?.listeners}
            className="bucket-handle cursor-grab active:cursor-grabbing hover:opacity-80"
            aria-label="Reorder group"
          >
            ⋮⋮
          </button>
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitTitle();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelTitleEdit();
                }
              }}
              className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-[15px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Group name"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="flex-1 text-left text-[15px] font-semibold text-slate-900 hover:text-slate-950 hover:underline decoration-slate-200 underline-offset-4 hover:bg-slate-50/80 rounded-md px-1.5 -mx-1.5 cursor-text transition"
              aria-label="Edit group name"
            >
              {bucket.name}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => onOperatorWithinChange(bucket.id, "AND")}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase transition ${
                bucket.operatorWithin === "AND"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              aria-pressed={bucket.operatorWithin === "AND"}
              aria-label="Set group terms to AND"
            >
              AND
            </button>
            <button
              type="button"
              onClick={() => onOperatorWithinChange(bucket.id, "OR")}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase transition ${
                bucket.operatorWithin === "OR"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              aria-pressed={bucket.operatorWithin === "OR"}
              aria-label="Set group terms to OR"
            >
              OR
            </button>
          </div>
          <button
            type="button"
            onClick={() => onToggle(bucket.id)}
            className={`inline-flex items-center justify-center transition ${
              bucket.isEnabled
                ? "text-slate-500 hover:text-slate-700"
                : "text-slate-400 hover:text-slate-600"
            }`}
            aria-pressed={bucket.isEnabled}
            aria-label={bucket.isEnabled ? "Disable group" : "Enable group"}
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (canDelete) onDelete(bucket.id);
            }}
            disabled={!canDelete}
            className={`inline-flex items-center justify-center transition ${
              canDelete
                ? "text-slate-400 hover:text-red-500"
                : "text-slate-300 cursor-not-allowed"
            }`}
            aria-label="Delete group"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Terms */}
      <SortableContext
        items={bucket.terms.map((term) => term.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-wrap gap-2">
          {bucket.terms.map((term, i) => (
            <TermPill
              key={term.id}
              id={term.id}
              term={term.value}
              colorKey={term.colorKey}
              pillClassName="bucket-pill"
              onRemove={() => onRemoveTerm(bucket.id, i)}
            />
          ))}
          {bucket.terms.length === 0 && (
            <span className="text-xs text-slate-400">No terms yet</span>
          )}
          <div
            ref={setEndDropRef}
            className="inline-flex h-6 w-12 rounded-full border border-transparent"
          />
        </div>
      </SortableContext>

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
    </div>
  );
};

export default BucketCard;
