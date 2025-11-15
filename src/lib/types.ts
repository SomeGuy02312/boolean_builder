// src/lib/types.ts

export type Operator = "AND" | "OR" | "AND NOT";

export type Bucket = {
  id: string;
  name: string;
  terms: string[];
  isEnabled: boolean;
  /** Operator between this bucket and the NEXT one */
  operatorAfter: Operator;
};

export type OutputMode = "pretty" | "minified";

export type AppState = {
  buckets: Bucket[];
  outputMode: OutputMode;
};
