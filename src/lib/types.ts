// src/lib/types.ts

export type Operator = "AND" | "OR" | "AND NOT";
export type BucketTermOperator = "AND" | "OR";

export type BucketThemeKey =
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "pink"
  | "rose"
  | "orange"
  | "amber"
  | "lime"
  | "green"
  | "teal";

export type TermColorKey =
  | "lavender"
  | "blue"
  | "mint"
  | "cyan"
  | "teal"
  | "yellow"
  | "orange"
  | "red"
  | "pink"
  | "violet";

export interface Term {
  id: string;
  value: string;
  colorKey: TermColorKey;
}

export type Bucket = {
  id: string;
  name: string;
  terms: Term[];
  isEnabled: boolean;
  /** Operator within this bucket */
  operatorWithin: BucketTermOperator;
  /** Operator between this bucket and the NEXT one */
  operatorAfter: Operator;
  themeKey: BucketThemeKey;
};

export type OutputMode = "pretty" | "minified";

export type AppState = {
  buckets: Bucket[];
  outputMode: OutputMode;
};
