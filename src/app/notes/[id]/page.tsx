"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2, X, Check, Eye, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { Note } from "@/lib/db/schema";

async function fetchNote(id: string): Promise<Note> {
  const res = await fetch(`/api/notes/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

type EditMode = "split" | "preview";

export default function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: note, isLoading, isError } = useQuery({
    queryKey: ["notes", id],
    queryFn: () => fetchNote(id),
  });

  const [editing, setEditing] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>("split");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  useEffect(() => {
    if (note) setForm({ title: note.title, content: note.content ?? "" });
  }, [note]);

  const handleSave = useCallback(async () => {
    if (!note) return;
    setSaving(true);
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, content: form.content || undefined }),
      });
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      await queryClient.invalidateQueries({ queryKey: ["notes", id] });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [note, form, id, queryClient]);

  const handleDelete = useCallback(async () => {
    if (!note) return;
    if (!confirm(`¿Eliminar "${note.title}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["notes"] });
    router.push("/notes");
  }, [note, queryClient, router]);

  const handleCancel = () => {
    if (!note) return;
    setForm({ title: note.title, content: note.content ?? "" });
    setEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
        Cargando…
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-muted-foreground">Nota no encontrada.</p>
        <Button variant="ghost" size="sm" onClick={() => router.push("/notes")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push("/notes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="h-8 text-base font-semibold"
              placeholder="Título de la nota"
            />
          ) : (
            <h1 className="text-base font-semibold truncate">{note.title}</h1>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {editing ? (
            <>
              <div className="flex items-center border rounded-md overflow-hidden mr-1">
                <button
                  className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${editMode === "split" ? "bg-accent text-accent-foreground" : "hover:bg-muted text-muted-foreground"}`}
                  onClick={() => setEditMode("split")}
                >
                  <Code2 className="h-3 w-3" />
                  Split
                </button>
                <button
                  className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${editMode === "preview" ? "bg-accent text-accent-foreground" : "hover:bg-muted text-muted-foreground"}`}
                  onClick={() => setEditMode("preview")}
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
              </div>
              <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !form.title.trim()}>
                <Check className="h-3.5 w-3.5 mr-1" />
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
              </Button>
              <Button
                size="sm" variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      {editing ? (
        editMode === "split" ? (
          /* Split pane */
          <div className="flex flex-1 min-h-0 divide-x">
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="px-3 py-1.5 border-b bg-muted/30">
                <span className="text-xs text-muted-foreground font-medium">Markdown</span>
              </div>
              <textarea
                className="flex-1 resize-none bg-transparent p-4 text-sm font-mono leading-7 focus:outline-none"
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Escribe en markdown…"
                spellCheck={false}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col min-h-0">
              <div className="px-3 py-1.5 border-b bg-muted/30">
                <span className="text-xs text-muted-foreground font-medium">Preview</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {form.content ? (
                  <MarkdownRenderer content={form.content} />
                ) : (
                  <p className="text-muted-foreground text-sm italic">Sin contenido.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Preview-only edit mode */
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
            {form.content ? (
              <MarkdownRenderer content={form.content} />
            ) : (
              <p className="text-muted-foreground text-sm italic">Sin contenido.</p>
            )}
          </div>
        )
      ) : (
        /* Read mode */
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {note.content ? (
              <MarkdownRenderer content={note.content} />
            ) : (
              <p className="text-muted-foreground text-sm italic">Sin contenido.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
