import { useState, type Dispatch, type SetStateAction } from "react";
import type { Bucket, Operator, TermColorKey } from "../lib/types";
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  DragOverlay,
  useDndMonitor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import BucketCard from "./BucketCard";

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

const END_DROP_PREFIX = "term-drop-end::";

type ActiveTerm = {
  id: string;
  value: string;
  colorKey: TermColorKey;
};

type BucketsPanelProps = {
  buckets: Bucket[];
  handleAddBucket: () => void;
  handleBucketNameChange: (id: string, name: string) => void;
  handleToggleBucket: (id: string) => void;
  handleRemoveTerm: (bucketId: string, termIndex: number) => void;
  handleAddTerm: (bucketId: string, term: string) => void;
  handleOperatorChange: (bucketId: string, operator: Operator) => void;
  handleReorderBuckets: (orderedIds: string[]) => void;
  handleDeleteBucket: (id: string) => void;
  onMoveTerm: (
    sourceBucketId: string,
    sourceIndex: number,
    targetBucketId: string,
    targetIndex: number
  ) => void;
};

const BucketsPanel = (props: BucketsPanelProps) => {
  const {
    buckets,
    handleAddBucket,
    handleBucketNameChange,
    handleToggleBucket,
    handleRemoveTerm,
    handleAddTerm,
    handleOperatorChange,
    handleReorderBuckets,
    handleDeleteBucket,
    onMoveTerm,
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Buckets</h2>
        <button
          type="button"
          onClick={handleAddBucket}
          disabled={buckets.length >= 8}
          className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary-light px-3.5 py-1.5 text-sm font-medium text-white shadow-soft hover:shadow-softLg disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          + Add bucket
        </button>
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
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                index={index}
                isLast={index === buckets.length - 1}
                onNameChange={handleBucketNameChange}
                onToggle={handleToggleBucket}
                onAddTerm={handleAddTerm}
                onRemoveTerm={handleRemoveTerm}
                onOperatorChange={handleOperatorChange}
                onDelete={handleDeleteBucket}
                canDelete={buckets.length > 1}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeTerm ? (
            <span
              className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs shadow-softLg ${TERM_COLOR_CLASSES[activeTerm.colorKey]}`}
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
        setActiveTerm({
          id: term.id,
          value: term.value,
          colorKey: term.colorKey,
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
