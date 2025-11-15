import type { Bucket, Operator } from "../lib/types";
import BucketCard from "./BucketCard";

type BucketsPanelProps = {
  buckets: Bucket[];
  pillColorClasses: string[];
  handleAddBucket: () => void;
  handleBucketNameChange: (id: string, name: string) => void;
  handleToggleBucket: (id: string) => void;
  handleRemoveTerm: (bucketId: string, termIndex: number) => void;
  handleAddTerm: (bucketId: string, term: string) => void;
  handleOperatorChange: (bucketId: string, operator: Operator) => void;
};

const BucketsPanel = ({
  buckets,
  pillColorClasses,
  handleAddBucket,
  handleBucketNameChange,
  handleToggleBucket,
  handleRemoveTerm,
  handleAddTerm,
  handleOperatorChange,
}: BucketsPanelProps) => {
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

      <div className="space-y-4">
        {buckets.map((bucket, index) => (
          <BucketCard
            key={bucket.id}
            bucket={bucket}
            index={index}
            isLast={index === buckets.length - 1}
            pillColorClasses={pillColorClasses}
            onNameChange={handleBucketNameChange}
            onToggle={handleToggleBucket}
            onAddTerm={handleAddTerm}
            onRemoveTerm={handleRemoveTerm}
            onOperatorChange={handleOperatorChange}
          />
        ))}
      </div>
    </section>
  );
};

export default BucketsPanel;
