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
};

const BucketsPanel = ({
  buckets,
  handleAddBucket,
  handleBucketNameChange,
  handleToggleBucket,
  handleRemoveTerm,
  handleAddTerm,
  handleOperatorChange,
  handleReorderBuckets,
  handleDeleteBucket,
}: BucketsPanelProps) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = buckets.findIndex((b) => b.id === active.id);
    const newIndex = buckets.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(buckets, oldIndex, newIndex).map((b) => b.id);
    handleReorderBuckets(newOrder);
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
