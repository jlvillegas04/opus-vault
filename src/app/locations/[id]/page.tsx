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
import type { Location } from "@/lib/db/schema";

const TYPE_LABELS: Record<string, string> = {
  world: "Mundo", region: "Región", city: "Ciudad", district: "Distrito",
  building: "Edificio", dungeon: "Mazmorra", wilderness: "Naturaleza", plane: "Plano", other: "Otro",
};

async function fetchLocation(id: string): Promise<Location> {
  const res = await fetch(`/api/locations/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

async function fetchAllLocations(): Promise<Location[]> {
  const res = await fetch("/api/locations");
  if (!res.ok) return [];
  return res.json();
}

const emptyForm = { name: "", locationType: "other" as Location["locationType"], parentLocationId: "", description: "" };

export default function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({ queryKey: ["locations", id], queryFn: () => fetchLocation(id) });
  const { data: allLocations } = useQuery({ queryKey: ["locations"], queryFn: fetchAllLocations });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (data) setForm({ name: data.name, locationType: data.locationType ?? "other", parentLocationId: data.parentLocationId ?? "", description: data.description ?? "" });
  }, [data]);

  const field = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch(`/api/locations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, locationType: form.locationType, parentLocationId: form.parentLocationId || null, description: form.description || undefined }),
      });
      await queryClient.invalidateQueries({ queryKey: ["locations"] });
      await queryClient.invalidateQueries({ queryKey: ["locations", id] });
      setEditing(false);
    } finally { setSaving(false); }
  }, [data, form, id, queryClient]);

  const handleDelete = useCallback(async () => {
    if (!data || !confirm(`¿Eliminar "${data.name}"?`)) return;
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["locations"] });
    router.push("/locations");
  }, [data, id, queryClient, router]);

  const handleCancel = () => { if (data) setForm({ name: data.name, locationType: data.locationType ?? "other", parentLocationId: data.parentLocationId ?? "", description: data.description ?? "" }); setEditing(false); };

  const parentName = allLocations?.find(l => l.id === data?.parentLocationId)?.name;

  const titleNode = editing
    ? <Input value={form.name} onChange={field("name")} className="h-8 text-base font-semibold" placeholder="Nombre del lugar" />
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
  if (isError || !data) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Ubicación no encontrada.</div>;

  return (
    <EntityPageShell backHref="/locations" title={titleNode} actions={actionsNode}>
      {editing ? (
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tipo</label>
              <select value={form.locationType ?? "other"} onChange={field("locationType")} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ubicación padre</label>
              <select value={form.parentLocationId} onChange={field("parentLocationId")} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">— Ninguna —</option>
                {allLocations?.filter(l => l.id !== id).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea value={form.description} onChange={field("description")} placeholder="Historia, geografía, puntos de interés…" rows={8} />
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
              {TYPE_LABELS[data.locationType ?? "other"]}
            </span>
            {parentName && <span className="text-muted-foreground">en <strong className="text-foreground">{parentName}</strong></span>}
          </div>
          {data.description ? (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Descripción</h3>
              <MarkdownRenderer content={data.description} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Sin contenido. Haz clic en Editar para agregar información.</p>
          )}
        </div>
      )}
    </EntityPageShell>
  );
}
