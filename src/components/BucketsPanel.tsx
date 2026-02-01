import { useState, type Dispatch, type SetStateAction } from "react";
import type { Bucket, Operator } from "../lib/types";
import { getBucketTheme } from "../lib/bucketThemes";
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  DragOverlay,
  useDndMonitor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import BucketCard from "./BucketCard";


const END_DROP_PREFIX = "term-drop-end::";

type ActiveTerm = {
  id: string;
  value: string;
  pillBg: string;
  pillText: string;
};

type BucketsPanelProps = {
  buckets: Bucket[];
  handleAddBucket: () => void;
  handleBucketNameChange: (id: string, name: string) => void;
  handleToggleBucket: (id: string) => void;
  handleRemoveTerm: (bucketId: string, termIndex: number) => void;
  handleAddTerm: (bucketId: string, term: string) => void;
  handleOperatorWithinChange: (bucketId: string, operator: "AND" | "OR") => void;
  handleOperatorChange: (bucketId: string, operator: Operator) => void;
  handleReorderBuckets: (orderedIds: string[]) => void;
  handleDeleteBucket: (id: string) => void;
  onMoveTerm: (
    sourceBucketId: string,
    sourceIndex: number,
    targetBucketId: string,
    targetIndex: number
  ) => void;
  onClear: () => void;
};

type SortableBucketItemProps = {
  bucket: Bucket;
  index: number;
  isLast: boolean;
  canDelete: boolean;
  onNameChange: (id: string, name: string) => void;
  onToggle: (id: string) => void;
  onAddTerm: (bucketId: string, term: string) => void;
  onRemoveTerm: (bucketId: string, termIndex: number) => void;
  onOperatorWithinChange: (bucketId: string, operator: "AND" | "OR") => void;
  onOperatorChange: (bucketId: string, operator: Operator) => void;
  onDelete: (id: string) => void;
};

const SortableBucketItem = ({
  bucket,
  index,
  isLast,
  canDelete,
  onNameChange,
  onToggle,
  onAddTerm,
  onRemoveTerm,
  onOperatorWithinChange,
  onOperatorChange,
  onDelete,
}: SortableBucketItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bucket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-3">
      <BucketCard
        bucket={bucket}
        index={index}
        onNameChange={onNameChange}
        onToggle={onToggle}
        onAddTerm={onAddTerm}
        onRemoveTerm={onRemoveTerm}
        onOperatorWithinChange={onOperatorWithinChange}
        onDelete={onDelete}
        canDelete={canDelete}
        dragHandleProps={{ attributes, listeners }}
        isDragging={isDragging}
      />
      {!isLast && (
        <div className="flex items-center gap-3 px-1">
          <select
            value={bucket.operatorAfter}
            onChange={(e) =>
              onOperatorChange(bucket.id, e.target.value as Operator)
            }
            className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase text-primary shadow-soft hover:shadow-softLg hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Operator to next group"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
            <option value="AND NOT">AND NOT</option>
          </select>
          <div className="h-px flex-1 bg-slate-200/80" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

const BucketsPanel = (props: BucketsPanelProps) => {
  const {
    buckets,
    handleAddBucket,
    handleBucketNameChange,
    handleToggleBucket,
    handleRemoveTerm,
    handleAddTerm,
    handleOperatorWithinChange,
    handleOperatorChange,
    handleReorderBuckets,
    handleDeleteBucket,
    onMoveTerm,
    onClear,
  } = props;

  const findTermLocation = (termId: string) => {
    for (const bucket of buckets) {
      const termIndex = bucket.terms.findIndex((term) => term.id === termId);
      if (termIndex !== -1) {
        return { bucketId: bucket.id, index: termIndex };
      }
    }
    return null;
  };

  const [activeTerm, setActiveTerm] = useState<ActiveTerm | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = String(active.id);

    const bucketIndex = buckets.findIndex((b) => b.id === activeId);
    if (bucketIndex !== -1) {
      if (!over || active.id === over.id) return;
      const overIndex = buckets.findIndex((b) => b.id === over.id);
      if (overIndex === -1) return;

      const newOrder = arrayMove(buckets, bucketIndex, overIndex).map(
        (b) => b.id
      );
      handleReorderBuckets(newOrder);
      return;
    }

    const sourceLocation = findTermLocation(activeId);
    if (!sourceLocation || !over) return;

    const overId = String(over.id);
    const targetTermLocation = findTermLocation(overId);

    if (targetTermLocation) {
      onMoveTerm(
        sourceLocation.bucketId,
        sourceLocation.index,
        targetTermLocation.bucketId,
        targetTermLocation.index
      );
      return;
    }

    if (overId.startsWith(END_DROP_PREFIX)) {
      const targetBucketId = overId.slice(END_DROP_PREFIX.length);
      const targetBucket = buckets.find((bucket) => bucket.id === targetBucketId);
      if (!targetBucket) return;

      onMoveTerm(
        sourceLocation.bucketId,
        sourceLocation.index,
        targetBucket.id,
        targetBucket.terms.length
      );
      return;
    }

    const targetBucket = buckets.find((bucket) => bucket.id === overId);
    if (!targetBucket) return;

    if (targetBucket.terms.length === 0) {
      onMoveTerm(
        sourceLocation.bucketId,
        sourceLocation.index,
        targetBucket.id,
        0
      );
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3 gap-3">
        <h2 className="text-lg font-medium">Groups</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleAddBucket}
            disabled={buckets.length >= 8}
            className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary-light px-3.5 py-1.5 text-sm font-medium text-white shadow-soft hover:shadow-softLg disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            + Add group
          </button>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <TermDragMonitor
          buckets={buckets}
          findTermLocation={findTermLocation}
          setActiveTerm={setActiveTerm}
        />
        <SortableContext
          items={buckets.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {buckets.map((bucket, index) => (
              <SortableBucketItem
                key={bucket.id}
                bucket={bucket}
                index={index}
                isLast={index === buckets.length - 1}
                canDelete={buckets.length > 1}
                onNameChange={handleBucketNameChange}
                onToggle={handleToggleBucket}
                onAddTerm={handleAddTerm}
                onRemoveTerm={handleRemoveTerm}
                onOperatorWithinChange={handleOperatorWithinChange}
                onOperatorChange={handleOperatorChange}
                onDelete={handleDeleteBucket}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeTerm ? (
            <span
              className="inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs shadow-softLg"
              style={{ backgroundColor: activeTerm.pillBg, color: activeTerm.pillText }}
            >
              {activeTerm.value}
            </span>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
};

type TermDragMonitorProps = {
  buckets: Bucket[];
  findTermLocation: (
    termId: string
  ) => { bucketId: string; index: number } | null;
  setActiveTerm: Dispatch<SetStateAction<ActiveTerm | null>>;
};

const TermDragMonitor = ({
  buckets,
  findTermLocation,
  setActiveTerm,
}: TermDragMonitorProps) => {
  useDndMonitor({
    onDragStart(event) {
      const termLocation = findTermLocation(String(event.active.id));
      if (!termLocation) return;
      const bucket = buckets.find((b) => b.id === termLocation.bucketId);
      if (!bucket) return;
      const term = bucket.terms[termLocation.index];
      if (term) {
        const theme = getBucketTheme(bucket.themeKey);
        setActiveTerm({
          id: term.id,
          value: term.value,
          pillBg: theme.pillBg,
          pillText: theme.pillText,
        });
      }
    },
    onDragEnd() {
      setActiveTerm(null);
    },
    onDragCancel() {
      setActiveTerm(null);
    },
  });

  return null;
};

export default BucketsPanel;
