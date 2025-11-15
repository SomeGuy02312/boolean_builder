import type { Bucket, Operator } from "../lib/types";
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import BucketCard from "./BucketCard";

const END_DROP_PREFIX = "term-drop-end::";

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
      </DndContext>
    </section>
  );
};

export default BucketsPanel;
