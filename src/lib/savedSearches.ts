import type { AppState as SerializedBuilderState } from "./types";

export type SavedSearch = {
  id: string;
  name: string;
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

const EMPTY_COLLECTION: SavedSearchCollection = {
  version: SAVED_SEARCHES_EXPORT_VERSION,
  items: [],
};

export function loadSavedSearches(): SavedSearchCollection {
  if (typeof window === "undefined" || !window.localStorage) {
    return { ...EMPTY_COLLECTION };
  }

  const raw = window.localStorage.getItem(SAVED_SEARCHES_STORAGE_KEY);
  if (!raw) {
    return { ...EMPTY_COLLECTION };
  }

  try {
    const parsed = JSON.parse(raw) as SavedSearchCollection;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.version !== "number" ||
      !Array.isArray(parsed.items)
    ) {
      console.warn(
        "[savedSearches] Parsed saved searches missing items[], resetting."
      );
      return { ...EMPTY_COLLECTION };
    }
    return parsed;
  } catch (error) {
    console.warn(
      "[savedSearches] Invalid JSON in localStorage, resetting saved searches:",
      error
    );
    window.localStorage.removeItem(SAVED_SEARCHES_STORAGE_KEY);
    return { ...EMPTY_COLLECTION };
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
