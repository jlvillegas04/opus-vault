"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EntityPageShell } from "@/components/entity-page-shell";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { Plotline } from "@/lib/db/schema";

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-green-500/15 text-green-400",
  resolved:  "bg-muted text-muted-foreground",
  dormant:   "bg-amber-500/15 text-amber-400",
  abandoned: "bg-red-500/15 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activa", resolved: "Resuelta", dormant: "Dormida", abandoned: "Abandonada",
};

const ARC_STYLES: Record<string, string> = {
  "opus-1": "bg-indigo-500/15 text-indigo-400",
  "opus-2": "bg-cyan-500/15 text-cyan-400",
};

function FieldSection({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h3>
      <MarkdownRenderer content={value} />
    </div>
  );
}

async function fetchPlotline(id: string): Promise<Plotline> {
  const res = await fetch(`/api/plotlines/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

const emptyForm = { title: "", status: "active" as Plotline["status"], arc: "", description: "", hooks: "", complications: "", potentialResolutions: "" };

export default function PlotlineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({ queryKey: ["plotlines", id], queryFn: () => fetchPlotline(id) });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (data) setForm({ title: data.title, status: data.status ?? "active", arc: data.arc ?? "", description: data.description ?? "", hooks: data.hooks ?? "", complications: data.complications ?? "", potentialResolutions: data.potentialResolutions ?? "" });
  }, [data]);

  const field = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch(`/api/plotlines/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, status: form.status, arc: form.arc || null, description: form.description || undefined, hooks: form.hooks || undefined, complications: form.complications || undefined, potentialResolutions: form.potentialResolutions || undefined }),
      });
      await queryClient.invalidateQueries({ queryKey: ["plotlines"] });
      await queryClient.invalidateQueries({ queryKey: ["plotlines", id] });
      setEditing(false);
    } finally { setSaving(false); }
  }, [data, form, id, queryClient]);

  const handleDelete = useCallback(async () => {
    if (!data || !confirm(`¿Eliminar "${data.title}"?`)) return;
    await fetch(`/api/plotlines/${id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["plotlines"] });
    router.push("/plotlines");
  }, [data, id, queryClient, router]);

  const handleCancel = () => { if (data) setForm({ title: data.title, status: data.status ?? "active", arc: data.arc ?? "", description: data.description ?? "", hooks: data.hooks ?? "", complications: data.complications ?? "", potentialResolutions: data.potentialResolutions ?? "" }); setEditing(false); };

  const titleNode = editing
    ? <Input value={form.title} onChange={field("title")} className="h-8 text-base font-semibold" placeholder="Título de la trama" />
    : <h1 className="text-base font-semibold truncate">{data?.title}</h1>;

  const actionsNode = editing ? (
    <>
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
  if (isError || !data) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Trama no encontrada.</div>;

  return (
    <EntityPageShell backHref="/plotlines" title={titleNode} actions={actionsNode}>
      {editing ? (
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Estado</label>
              <select value={form.status ?? "active"} onChange={field("status")} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Arco</label>
              <Input value={form.arc} onChange={field("arc")} placeholder="opus-1 · opus-2 · vacío" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea value={form.description} onChange={field("description")} placeholder="¿De qué trata esta trama?…" rows={5} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ganchos</label>
            <Textarea value={form.hooks} onChange={field("hooks")} placeholder="¿Cómo se puede activar o introducir esta trama?…" rows={4} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Complicaciones</label>
            <Textarea value={form.complications} onChange={field("complications")} placeholder="Obstáculos, giros, antagonistas…" rows={4} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Resoluciones posibles</label>
            <Textarea value={form.potentialResolutions} onChange={field("potentialResolutions")} placeholder="¿Cómo podría terminar esta trama?…" rows={4} />
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[data.status ?? "active"]}`}>
              {STATUS_LABELS[data.status ?? "active"]}
            </span>
            {data.arc && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ARC_STYLES[data.arc] ?? "bg-muted text-muted-foreground"}`}>
                {data.arc}
              </span>
            )}
          </div>
          <FieldSection label="Descripción" value={data.description} />
          <FieldSection label="Ganchos" value={data.hooks} />
          <FieldSection label="Complicaciones" value={data.complications} />
          <FieldSection label="Resoluciones posibles" value={data.potentialResolutions} />
          {!data.description && !data.hooks && !data.complications && !data.potentialResolutions && <p className="text-sm text-muted-foreground italic">Sin contenido. Haz clic en Editar para agregar información.</p>}
        </div>
      )}
    </EntityPageShell>
  );
}
