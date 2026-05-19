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
import type { Character } from "@/lib/db/schema";

const STATUS_STYLES: Record<string, string> = {
  alive:   "bg-green-500/15 text-green-400",
  dead:    "bg-red-500/15 text-red-400",
  missing: "bg-amber-500/15 text-amber-400",
  unknown: "bg-muted text-muted-foreground",
};

const ARC_STYLES: Record<string, string> = {
  "opus-1": "bg-indigo-500/15 text-indigo-400",
  "opus-2": "bg-cyan-500/15 text-cyan-400",
};

function Chip({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function FieldSection({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h3>
      <MarkdownRenderer content={value} />
    </div>
  );
}

async function fetchCharacter(id: string): Promise<Character> {
  const res = await fetch(`/api/characters/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

const emptyForm = { name: "", title: "", description: "", backstory: "", status: "alive" as Character["status"], isPlayerCharacter: false, arc: "" };

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({ queryKey: ["characters", id], queryFn: () => fetchCharacter(id) });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (data) setForm({ name: data.name, title: data.title ?? "", description: data.description ?? "", backstory: data.backstory ?? "", status: data.status ?? "alive", isPlayerCharacter: data.isPlayerCharacter ?? false, arc: data.arc ?? "" });
  }, [data]);

  const field = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch(`/api/characters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, title: form.title || undefined, description: form.description || undefined, backstory: form.backstory || undefined, status: form.status, isPlayerCharacter: form.isPlayerCharacter, arc: form.arc || null }),
      });
      await queryClient.invalidateQueries({ queryKey: ["characters"] });
      await queryClient.invalidateQueries({ queryKey: ["characters", id] });
      setEditing(false);
    } finally { setSaving(false); }
  }, [data, form, id, queryClient]);

  const handleDelete = useCallback(async () => {
    if (!data || !confirm(`¿Eliminar "${data.name}"?`)) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["characters"] });
    router.push("/characters");
  }, [data, id, queryClient, router]);

  const handleCancel = () => { if (data) setForm({ name: data.name, title: data.title ?? "", description: data.description ?? "", backstory: data.backstory ?? "", status: data.status ?? "alive", isPlayerCharacter: data.isPlayerCharacter ?? false, arc: data.arc ?? "" }); setEditing(false); };

  const titleNode = editing
    ? <Input value={form.name} onChange={field("name")} className="h-8 text-base font-semibold" placeholder="Nombre del personaje" />
    : <h1 className="text-base font-semibold truncate">{data?.name}</h1>;

  const actionsNode = editing ? (
    <>
      <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}><X className="h-3.5 w-3.5 mr-1" />Cancelar</Button>
      <Button size="sm" onClick={handleSave} disabled={saving || !form.name.trim()}><Check className="h-3.5 w-3.5 mr-1" />{saving ? "Guardando…" : "Guardar"}</Button>
    </>
  ) : (
    <>
      <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5 mr-1" />Editar</Button>
      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}><Trash2 className="h-3.5 w-3.5 mr-1" />Eliminar</Button>
    </>
  );

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Cargando…</div>;
  if (isError || !data) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Personaje no encontrado.</div>;

  return (
    <EntityPageShell backHref="/characters" title={titleNode} actions={actionsNode}>
      {editing ? (
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Título / Rol</label>
            <Input value={form.title} onChange={field("title")} placeholder="El Traidor, Sacerdotisa…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Estado</label>
              <select value={form.status ?? "alive"} onChange={field("status")} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="alive">Vivo</option>
                <option value="dead">Muerto</option>
                <option value="missing">Desaparecido</option>
                <option value="unknown">Desconocido</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Arco</label>
              <Input value={form.arc} onChange={field("arc")} placeholder="opus-1 · opus-2 · vacío" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPC" checked={form.isPlayerCharacter} onChange={e => setForm(p => ({ ...p, isPlayerCharacter: e.target.checked }))} className="h-4 w-4 accent-primary" />
            <label htmlFor="isPC" className="text-sm font-medium">Personaje jugador (PC)</label>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea value={form.description} onChange={field("description")} placeholder="Apariencia, personalidad, rasgos visibles…" rows={5} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Trasfondo</label>
            <Textarea value={form.backstory} onChange={field("backstory")} placeholder="Historia, motivaciones, secretos…" rows={7} />
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
          <div className="flex flex-wrap items-center gap-2">
            {data.title && <span className="text-muted-foreground text-sm italic">{data.title}</span>}
            <Chip label={data.status ?? "unknown"} className={STATUS_STYLES[data.status ?? "unknown"]} />
            {data.isPlayerCharacter && <Chip label="PC" className="bg-primary/15 text-primary" />}
            {data.arc && <Chip label={data.arc} className={ARC_STYLES[data.arc] ?? "bg-muted text-muted-foreground"} />}
          </div>
          <FieldSection label="Descripción" value={data.description} />
          <FieldSection label="Trasfondo" value={data.backstory} />
          {!data.description && !data.backstory && <p className="text-sm text-muted-foreground italic">Sin contenido. Haz clic en Editar para agregar información.</p>}
        </div>
      )}
    </EntityPageShell>
  );
}
