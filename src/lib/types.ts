// src/lib/types.ts

export type Operator = "AND" | "OR" | "AND NOT";

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
  /** Operator between this bucket and the NEXT one */
  operatorAfter: Operator;
};

export type OutputMode = "pretty" | "minified";

export type AppState = {
  buckets: Bucket[];
  outputMode: OutputMode;
};
