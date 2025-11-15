// src/lib/booleanBuilder.ts

import type { Bucket, OutputMode, Operator } from "./types";

/**
 * Format a single term:
 * - trims whitespace
 * - adds quotes around multi-word phrases if not already quoted
 */
function formatTerm(raw: string): string {
  const term = raw.trim();
  if (!term) return "";

  const isAlreadyQuoted = /^".*"$/.test(term);
  const hasWhitespace = /\s/.test(term);

  if (hasWhitespace && !isAlreadyQuoted) {
    return `"${term}"`;
  }

  return term;
}

/**
 * Build the final Boolean string from buckets + mode.
 * - Filters out disabled or empty buckets
 * - ORs within each bucket
 * - Uses operatorAfter between buckets
 * - No outer parentheses in the final string
 */
export function buildBoolean(
  buckets: Bucket[],
  mode: OutputMode
): string {
  const activeBuckets = buckets.filter(
    (b) => b.isEnabled && b.terms.length > 0
  );

  if (activeBuckets.length === 0) {
    return "";
  }

  // Build each bucket's group: (term1 OR term2 OR "multi word")
  const groups = activeBuckets.map((bucket) => {
    const formattedTerms = bucket.terms
      .map(formatTerm)
      .filter(Boolean);

    if (formattedTerms.length === 0) return "";

    return `(${formattedTerms.join(" OR ")})`;
  });

  // Stitch them together with operators between buckets
  const parts: string[] = [];

  for (let i = 0; i < activeBuckets.length; i++) {
    const group = groups[i];
    if (!group) continue;

    if (i === 0) {
      // First group, no operator before it
      parts.push(group);
    } else {
      // Operator comes from the PREVIOUS bucket
      const prevBucket = activeBuckets[i - 1];
      const op: Operator = prevBucket.operatorAfter ?? "AND";
      parts.push(op, group);
    }
  }

  if (mode === "minified") {
    return parts.join(" ");
  }

  // Pretty mode: each operator + group on its own line
  const prettyLines: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === 0) {
      // first group
      prettyLines.push(part);
    } else {
      // operator then group
      const isOperator = (p: string) =>
        p === "AND" || p === "OR" || p === "AND NOT";

      const prev = parts[i - 1];
      if (isOperator(prev)) {
        // operator already handled, skip special logic
        prettyLines.push(part);
      } else if (isOperator(part)) {
        prettyLines.push(part);
      } else {
        prettyLines.push(part);
      }
    }
  }

  // Simpler: just join with newlines between parts
  return parts.join("\n");
}
