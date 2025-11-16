import { useEffect, useState } from "react";
import type { OutputMode } from "../lib/types";

type BooleanPreviewProps = {
  booleanString: string;
  outputMode: OutputMode;
  setOutputMode: (mode: OutputMode) => void;
  onCopy: () => void;
  currentName: string;
  onNameChange: (value: string) => void;
  isDirty: boolean;
  currentSavedId: string | null;
  onSave: () => boolean;
  hasContent: boolean;
};

const BooleanPreview = ({
  booleanString,
  outputMode,
  setOutputMode,
  onCopy,
  currentName,
  onNameChange,
  isDirty,
  currentSavedId,
  onSave,
  hasContent,
}: BooleanPreviewProps) => {
  const [savedPulse, setSavedPulse] = useState(false);

  useEffect(() => {
    if (!savedPulse) return;
    const timeout = window.setTimeout(() => setSavedPulse(false), 800);
    return () => window.clearTimeout(timeout);
  }, [savedPulse]);

  const hasExisting = Boolean(currentSavedId);
  const nameTrimmed = currentName.trim();
  const baseDisabled =
    nameTrimmed.length === 0 || !hasContent || (hasExisting && !isDirty);
  const isSaveDisabled = baseDisabled;

  const saveLabel = !hasExisting
    ? "Save"
    : isDirty
    ? "Update"
    : "Saved";

  const handleSaveClick = () => {
    if (isSaveDisabled) return;
    const success = onSave();
    if (success) {
      setSavedPulse(true);
    }
  };

  const saveButtonClass = savedPulse
    ? "bg-primary/10 text-primary"
    : "bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-softLg";
  const saveButtonDisabledClass = savedPulse
    ? "cursor-default"
    : "disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <section className="pl-6 border-l border-slate-200/70">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Boolean preview</h2>

        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs shadow-soft">
          <button
            type="button"
            onClick={() => setOutputMode("pretty")}
            className={`px-3 py-1 rounded-full ${
              outputMode === "pretty"
                ? "bg-white shadow text-slate-900"
                : "text-slate-600"
            }`}
          >
            Pretty
          </button>
          <button
            type="button"
            onClick={() => setOutputMode("minified")}
            className={`px-3 py-1 rounded-full ${
              outputMode === "minified"
                ? "bg-white shadow text-slate-900"
                : "text-slate-600"
            }`}
          >
            Minified
          </button>
        </div>
      </div>

      <div className="rounded-bucket bg-card shadow-soft border border-slate-100 p-4 h-[320px] flex flex-col">
        <pre className="flex-1 overflow-auto text-xs font-mono whitespace-pre-wrap">
          {booleanString || "/* Start adding terms to see your Boolean here */"}
        </pre>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 flex-1">
            <input
              type="text"
              placeholder="Name this search..."
              value={currentName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full sm:max-w-[220px] rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaveDisabled}
              className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium shadow-soft transition ${saveButtonClass} ${saveButtonDisabledClass}`}
            >
              {saveLabel}
            </button>
          </div>
          <button
            type="button"
            onClick={onCopy}
            disabled={!booleanString}
            className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary-light px-4 py-1.5 text-sm font-medium text-white shadow-soft hover:shadow-softLg disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Copy
          </button>
        </div>
      </div>
    </section>
  );
};

export default BooleanPreview;
