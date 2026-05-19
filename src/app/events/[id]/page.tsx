"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, X, Check, Eye, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EntityPageShell } from "@/components/entity-page-shell";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { Event } from "@/lib/db/schema";

function FieldSection({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h3>
      <MarkdownRenderer content={value} />
    </div>
  );
}

async function fetchEvent(id: string): Promise<Event> {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

const emptyForm = { title: "", sessionNumber: "", eventDate: "", realDate: "", description: "", consequences: "" };
type EditMode = "split" | "preview";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({ queryKey: ["events", id], queryFn: () => fetchEvent(id) });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>("split");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (data) setForm({
      title: data.title,
      sessionNumber: data.sessionNumber != null ? String(data.sessionNumber) : "",
      eventDate: data.eventDate ?? "",
      realDate: data.realDate ? new Date(data.realDate).toISOString().split("T")[0] : "",
      description: data.description ?? "",
      consequences: data.consequences ?? "",
    });
  }, [data]);

  const field = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          sessionNumber: form.sessionNumber ? Number(form.sessionNumber) : undefined,
          eventDate: form.eventDate || undefined,
          realDate: form.realDate || undefined,
          description: form.description || undefined,
          consequences: form.consequences || undefined,
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["events", id] });
      setEditing(false);
    } finally { setSaving(false); }
  }, [data, form, id, queryClient]);

  const handleDelete = useCallback(async () => {
    if (!data || !confirm(`¿Eliminar "${data.title}"?`)) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["events"] });
    router.push("/events");
  }, [data, id, queryClient, router]);

  const handleCancel = () => {
    if (data) setForm({ title: data.title, sessionNumber: data.sessionNumber != null ? String(data.sessionNumber) : "", eventDate: data.eventDate ?? "", realDate: data.realDate ? new Date(data.realDate).toISOString().split("T")[0] : "", description: data.description ?? "", consequences: data.consequences ?? "" });
    setEditing(false);
  };

  const titleNode = editing
    ? <Input value={form.title} onChange={field("title")} className="h-8 text-base font-semibold" placeholder="Título del evento" />
    : <h1 className="text-base font-semibold truncate">{data?.title}</h1>;

  const actionsNode = editing ? (
    <>
      <div className="flex items-center border rounded-md overflow-hidden mr-1">
        <button className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${editMode === "split" ? "bg-accent text-accent-foreground" : "hover:bg-muted text-muted-foreground"}`} onClick={() => setEditMode("split")}><Code2 className="h-3 w-3" />Split</button>
        <button className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${editMode === "preview" ? "bg-accent text-accent-foreground" : "hover:bg-muted text-muted-foreground"}`} onClick={() => setEditMode("preview")}><Eye className="h-3 w-3" />Preview</button>
      </div>
      <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}><X className="h-3.5 w-3.5 mr-1" />Cancelar</Button>
      <Button size="sm" onClick={handleSave} disabled={saving || !form.title.trim()}><Check className="h-3.5 w-3.5 mr-1" />{saving ? "Guardando…" : "Guardar"}</Button>
    </>
  ) : (
    <>
      <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5 mr-1" />Editar</Button>
      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}><Trash2 className="h-3.5 w-3.5 mr-1" />Eliminar</Button>
    </>
  );

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Cargando…</div>;
  if (isError || !data) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Evento no encontrado.</div>;

  return (
    <EntityPageShell backHref="/events" title={titleNode} actions={actionsNode}>
      {editing ? (
        <div className="flex flex-col flex-1 overflow-hidden h-full">
          {/* Metadata fields strip */}
          <div className="shrink-0 px-6 py-4 border-b">
            <div className="max-w-2xl grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sesión #</label>
                <Input type="number" value={form.sessionNumber} onChange={field("sessionNumber")} placeholder="20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha en el mundo</label>
                <Input value={form.eventDate} onChange={field("eventDate")} placeholder="Día 45, Tercer Mes" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha real</label>
                <Input type="date" value={form.realDate} onChange={field("realDate")} />
              </div>
            </div>
          </div>
          {/* Split editor for description */}
          {editMode === "split" ? (
            <div className="flex flex-1 min-h-0 divide-x overflow-hidden">
              <div className="flex-1 flex flex-col min-w-0">
                <div className="px-3 py-1.5 border-b bg-muted/30 shrink-0 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Descripción</span>
                </div>
                <textarea className="flex-1 resize-none bg-transparent p-4 text-sm font-mono leading-7 focus:outline-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Narración de la sesión…" spellCheck={false} />
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <div className="px-3 py-1.5 border-b bg-muted/30 shrink-0">
                  <span className="text-xs text-muted-foreground font-medium">Preview</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {form.description ? <MarkdownRenderer content={form.description} /> : <p className="text-muted-foreground text-sm italic">Sin contenido.</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
              {form.description ? <MarkdownRenderer content={form.description} /> : <p className="text-muted-foreground text-sm italic">Sin contenido.</p>}
            </div>
          )}
          {/* Consequences field */}
          <div className="shrink-0 border-t px-6 py-4">
            <div className="max-w-2xl space-y-1.5">
              <label className="text-sm font-medium">Consecuencias</label>
              <Textarea value={form.consequences} onChange={field("consequences")} placeholder="Cambios en el mundo, consecuencias narrativas…" rows={3} />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
          <div className="flex flex-wrap gap-4 text-sm">
            {data.sessionNumber != null && <span className="text-muted-foreground">Sesión <strong className="text-foreground">{data.sessionNumber}</strong></span>}
            {data.eventDate && <span className="text-muted-foreground">Fecha en el mundo: <strong className="text-foreground">{data.eventDate}</strong></span>}
            {data.realDate && <span className="text-muted-foreground">Fecha real: <strong className="text-foreground">{new Date(data.realDate).toLocaleDateString()}</strong></span>}
          </div>
          <FieldSection label="Descripción" value={data.description} />
          <FieldSection label="Consecuencias" value={data.consequences} />
          {!data.description && !data.consequences && <p className="text-sm text-muted-foreground italic">Sin contenido. Haz clic en Editar para agregar información.</p>}
        </div>
      )}
    </EntityPageShell>
  );
}
