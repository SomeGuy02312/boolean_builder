import { useState } from "react";
import type { SavedSearch, SavedSearchCollection } from "../lib/savedSearches";
import {
  loadSavedSearches,
  persistSavedSearches,
  SAVED_SEARCHES_EXPORT_TYPE,
  SAVED_SEARCHES_EXPORT_VERSION,
} from "../lib/savedSearches";
import type { AppState as SerializedBuilderState } from "../lib/types";
import { EXAMPLE_SAVED_SEARCHES } from "../data/exampleSearches";

const EXAMPLE_SEEDED_KEY = "booleanBuilder.examplesSeeded.v1";

type CreateInput = {
  name: string;
  shortDescription?: string;
  state: SerializedBuilderState;
  queryString: string;
};

export function useSavedSearches() {
  const [collection, setCollection] = useState<SavedSearchCollection>(() => {
    const loaded = loadSavedSearches();
    const exampleSeeded =
      typeof window !== "undefined" &&
      window.localStorage.getItem(EXAMPLE_SEEDED_KEY) === "true";

    if (!exampleSeeded) {
      const existingItems = loaded.items ?? [];
      const existingNames = new Set(
        existingItems.map((item) => item.name.trim().toLowerCase())
      );

      const mergedItems: SavedSearch[] = [
        ...existingItems,
        ...EXAMPLE_SAVED_SEARCHES.filter(
          (example) => !existingNames.has(example.name.trim().toLowerCase())
        ),
      ];

      const initial: SavedSearchCollection = {
        version: loaded.version ?? SAVED_SEARCHES_EXPORT_VERSION,
        items: mergedItems,
      };

      persistSavedSearches(initial);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(EXAMPLE_SEEDED_KEY, "true");
      }

      return initial;
    }

    return loaded;
  });

  const create = (input: CreateInput): SavedSearch => {
    const now = new Date().toISOString();
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const newItem: SavedSearch = {
      id,
      name: input.name,
      shortDescription: input.shortDescription,
      queryString: input.queryString,
      state: input.state,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: now,
    };

    setCollection((prev) => {
      const next: SavedSearchCollection = {
        ...prev,
        items: [...prev.items, newItem],
      };
      persistSavedSearches(next);
      return next;
    });

    return newItem;
  };

  const update = (
    id: string,
    updates: Partial<
      Pick<SavedSearch, "name" | "shortDescription" | "state" | "queryString">
    >
  ): void => {
    const now = new Date().toISOString();
    setCollection((prev) => {
      const nextItems = prev.items.map((item) => {
        if (item.id !== id) return item;
        const touched =
          updates.state !== undefined || updates.queryString !== undefined;
        return {
          ...item,
          ...updates,
          updatedAt: touched ? now : item.updatedAt,
        };
      });
      const next: SavedSearchCollection = { ...prev, items: nextItems };
      persistSavedSearches(next);
      return next;
    });
  };

  const deleteSearch = (id: string): void => {
    setCollection((prev) => {
      const next: SavedSearchCollection = {
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      };
      persistSavedSearches(next);
      return next;
    });
  };

  const markUsed = (id: string): void => {
    const now = new Date().toISOString();
    setCollection((prev) => {
      const nextItems = prev.items.map((item) =>
        item.id === id ? { ...item, lastUsedAt: now } : item
      );
      const next: SavedSearchCollection = { ...prev, items: nextItems };
      persistSavedSearches(next);
      return next;
    });
  };

  const replaceAll = (items: SavedSearch[]): void => {
    const next: SavedSearchCollection = {
      version: SAVED_SEARCHES_EXPORT_VERSION,
      items,
    };
    setCollection(next);
    persistSavedSearches(next);
  };

  const exportAll = (): string => {
    return JSON.stringify(
      {
        type: SAVED_SEARCHES_EXPORT_TYPE,
        version: SAVED_SEARCHES_EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        items: collection.items,
      },
      null,
      2
    );
  };

  const getRecents = (limit: number): SavedSearch[] => {
    return [...collection.items]
      .sort((a, b) => {
        const aTime = Date.parse(a.lastUsedAt || "") || 0;
        const bTime = Date.parse(b.lastUsedAt || "") || 0;
        return bTime - aTime;
      })
      .slice(0, limit);
  };

  return {
    items: collection.items,
    create,
    update,
    deleteSearch,
    markUsed,
    replaceAll,
    exportAll,
    getRecents,
  };
}
