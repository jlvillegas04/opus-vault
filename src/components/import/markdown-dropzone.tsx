"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, SkipForward, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImportStatus = "imported" | "updated" | "skipped" | "error";

interface FileResult {
  file: string;
  status: ImportStatus;
  title?: string;
  id?: string;
  error?: string;
}

interface PendingFile {
  file: File;
  name: string;
}

const STATUS_CONFIG: Record<ImportStatus, { icon: typeof CheckCircle; label: string; className: string }> = {
  imported: { icon: CheckCircle, label: "Imported", className: "text-green-500" },
  updated: { icon: RefreshCw, label: "Updated", className: "text-blue-500" },
  skipped: { icon: SkipForward, label: "Skipped (duplicate)", className: "text-yellow-500" },
  error: { icon: AlertCircle, label: "Error", className: "text-red-500" },
};

export function MarkdownDropzone() {
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [overwrite, setOverwrite] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const mdFiles = files.filter((f) => f.name.match(/\.md$/i));
    if (!mdFiles.length) return;
    setPending((prev) => {
      const existingNames = new Set(prev.map((p) => p.name));
      const newFiles = mdFiles
        .filter((f) => !existingNames.has(f.name))
        .map((f) => ({ file: f, name: f.name }));
      return [...prev, ...newFiles];
    });
    setResults([]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(Array.from(e.target.files ?? []));
      e.target.value = "";
    },
    [addFiles]
  );

  const removeFile = (name: string) => {
    setPending((prev) => prev.filter((p) => p.name !== name));
  };

  const handleImport = async () => {
    if (!pending.length || isImporting) return;
    setIsImporting(true);
    setResults([]);

    const formData = new FormData();
    pending.forEach((p) => formData.append("files", p.file, p.name));

    try {
      const res = await fetch(`/api/import/markdown?overwrite=${overwrite}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setResults(data.results);
      setPending([]);
    } catch (err) {
      setResults([{ file: "–", status: "error", error: String(err) }]);
    } finally {
      setIsImporting(false);
    }
  };

  const hasResults = results.length > 0;
  const summary = hasResults
    ? {
        imported: results.filter((r) => r.status === "imported").length,
        updated: results.filter((r) => r.status === "updated").length,
        skipped: results.filter((r) => r.status === "skipped").length,
        errors: results.filter((r) => r.status === "error").length,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
        )}
      >
        <Upload className="size-10 text-muted-foreground" />
        <div className="text-center">
          <p className="font-medium">Drop Markdown files here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse — .md files only</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".md"
          multiple
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {/* Pending files */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {pending.length} file{pending.length !== 1 ? "s" : ""} ready to import
            </h3>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
                className="rounded"
              />
              Overwrite existing notes
            </label>
          </div>

          <ul className="rounded-md border divide-y divide-border">
            {pending.map((p) => (
              <li key={p.name} className="flex items-center gap-3 px-4 py-2.5">
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm truncate">{p.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(p.name); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>

          <Button onClick={handleImport} disabled={isImporting} className="w-full">
            {isImporting ? "Importing…" : `Import ${pending.length} file${pending.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      )}

      {/* Results */}
      {hasResults && summary && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4 text-sm">
            {summary.imported > 0 && (
              <span className="text-green-500">{summary.imported} imported</span>
            )}
            {summary.updated > 0 && (
              <span className="text-blue-500">{summary.updated} updated</span>
            )}
            {summary.skipped > 0 && (
              <span className="text-yellow-500">{summary.skipped} skipped</span>
            )}
            {summary.errors > 0 && (
              <span className="text-red-500">{summary.errors} failed</span>
            )}
          </div>

          <ul className="rounded-md border divide-y divide-border">
            {results.map((r, i) => {
              const cfg = STATUS_CONFIG[r.status];
              const Icon = cfg.icon;
              return (
                <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                  <Icon className={cn("size-4 mt-0.5 shrink-0", cfg.className)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title ?? r.file}</p>
                    <p className="text-xs text-muted-foreground">{r.file}</p>
                    {r.error && <p className="text-xs text-red-500 mt-0.5">{r.error}</p>}
                  </div>
                  <span className={cn("text-xs shrink-0 mt-0.5", cfg.className)}>{cfg.label}</span>
                </li>
              );
            })}
          </ul>

          <Button variant="outline" onClick={() => setResults([])} className="w-full">
            Import more files
          </Button>
        </div>
      )}
    </div>
  );
}
