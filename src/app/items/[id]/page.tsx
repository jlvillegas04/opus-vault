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
import type { Item } from "@/lib/db/schema";

const RARITY_STYLES: Record<string, string> = {
  common:    "bg-muted text-muted-foreground",
  uncommon:  "bg-green-500/15 text-green-400",
  rare:      "bg-blue-500/15 text-blue-400",
  very_rare: "bg-purple-500/15 text-purple-400",
  legendary: "bg-amber-500/15 text-amber-400",
  artifact:  "bg-orange-500/15 text-orange-400",
  unique:    "bg-pink-500/15 text-pink-400",
};

const RARITY_LABELS: Record<string, string> = {
  common: "Común", uncommon: "No común", rare: "Raro", very_rare: "Muy raro",
  legendary: "Legendario", artifact: "Artefacto", unique: "Único",
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

async function fetchItem(id: string): Promise<Item> {
  const res = await fetch(`/api/items/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

const emptyForm = { name: "", rarity: "" as Item["rarity"] | "", description: "", properties: "", history: "" };

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({ queryKey: ["items", id], queryFn: () => fetchItem(id) });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (data) setForm({ name: data.name, rarity: data.rarity ?? "", description: data.description ?? "", properties: data.properties ?? "", history: data.history ?? "" });
  }, [data]);

  const field = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, rarity: form.rarity || undefined, description: form.description || undefined, properties: form.properties || undefined, history: form.history || undefined }),
      });
      await queryClient.invalidateQueries({ queryKey: ["items"] });
      await queryClient.invalidateQueries({ queryKey: ["items", id] });
      setEditing(false);
    } finally { setSaving(false); }
  }, [data, form, id, queryClient]);

  const handleDelete = useCallback(async () => {
    if (!data || !confirm(`¿Eliminar "${data.name}"?`)) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["items"] });
    router.push("/items");
  }, [data, id, queryClient, router]);

  const handleCancel = () => { if (data) setForm({ name: data.name, rarity: data.rarity ?? "", description: data.description ?? "", properties: data.properties ?? "", history: data.history ?? "" }); setEditing(false); };

  const titleNode = editing
    ? <Input value={form.name} onChange={field("name")} className="h-8 text-base font-semibold" placeholder="Nombre del objeto" />
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
  if (isError || !data) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Objeto no encontrado.</div>;

  return (
    <EntityPageShell backHref="/items" title={titleNode} actions={actionsNode}>
      {editing ? (
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Rareza</label>
            <select value={form.rarity ?? ""} onChange={field("rarity")} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">— Sin especificar —</option>
              {Object.entries(RARITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea value={form.description} onChange={field("description")} placeholder="Apariencia, origen, propósito…" rows={4} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Propiedades</label>
            <Textarea value={form.properties} onChange={field("properties")} placeholder="Poderes mágicos, estadísticas, efectos…" rows={4} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Historia</label>
            <Textarea value={form.history} onChange={field("history")} placeholder="Dónde fue forjado, quiénes lo han portado…" rows={5} />
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
          {data.rarity && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${RARITY_STYLES[data.rarity]}`}>
              {RARITY_LABELS[data.rarity] ?? data.rarity}
            </span>
          )}
          <FieldSection label="Descripción" value={data.description} />
          <FieldSection label="Propiedades" value={data.properties} />
          <FieldSection label="Historia" value={data.history} />
          {!data.description && !data.properties && !data.history && <p className="text-sm text-muted-foreground italic">Sin contenido. Haz clic en Editar para agregar información.</p>}
        </div>
      )}
    </EntityPageShell>
  );
}
