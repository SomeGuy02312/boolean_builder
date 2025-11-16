import type { AppState as SerializedBuilderState } from "./types";

export type SavedSearch = {
  id: string;
  name: string;
  isExample?: boolean;
  shortDescription?: string;
  queryString: string;
  state: SerializedBuilderState;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string;
};

export type SavedSearchCollection = {
  version: number;
  items: SavedSearch[];
};

export const SAVED_SEARCHES_STORAGE_KEY = "booleanBuilder.savedSearches.v1";
export const SAVED_SEARCHES_EXPORT_TYPE = "boolean-builder-saved-searches";
export const SAVED_SEARCHES_EXPORT_VERSION = 1;

export function loadSavedSearches(): SavedSearchCollection {
  if (typeof window === "undefined" || !window.localStorage) {
    return { version: SAVED_SEARCHES_EXPORT_VERSION, items: [] };
  }

  const raw = window.localStorage.getItem(SAVED_SEARCHES_STORAGE_KEY);
  if (!raw) {
    return { version: SAVED_SEARCHES_EXPORT_VERSION, items: [] };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) {
      console.warn(
        "[savedSearches] Invalid structure in localStorage, resetting."
      );
      return { version: SAVED_SEARCHES_EXPORT_VERSION, items: [] };
    }
    return {
      version: parsed.version ?? SAVED_SEARCHES_EXPORT_VERSION,
      items: parsed.items,
    };
  } catch (error) {
    console.warn(
      "[savedSearches] Invalid JSON in localStorage, resetting saved searches:",
      error
    );
    window.localStorage.removeItem(SAVED_SEARCHES_STORAGE_KEY);
    return { version: SAVED_SEARCHES_EXPORT_VERSION, items: [] };
  }
}

export function persistSavedSearches(
  collection: SavedSearchCollection
): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const payload = JSON.stringify(collection);
    window.localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, payload);
  } catch (error) {
    console.warn(
      "[savedSearches] Failed to persist saved searches to localStorage:",
      error
    );
  }
}
