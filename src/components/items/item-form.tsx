"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Item } from "@/lib/db/schema";

interface ItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RARITY_OPTIONS: Array<{ value: Item["rarity"]; label: string }> = [
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "very_rare", label: "Very Rare" },
  { value: "legendary", label: "Legendary" },
  { value: "artifact", label: "Artifact" },
  { value: "unique", label: "Unique" },
];

const emptyForm = {
  name: "",
  rarity: "" as Item["rarity"] | "",
  description: "",
  properties: "",
  history: "",
};

export function ItemForm({ open, onOpenChange }: ItemFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const field =
    (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        ...(form.rarity && { rarity: form.rarity }),
        ...(form.description && { description: form.description }),
        ...(form.properties && { properties: form.properties }),
        ...(form.history && { history: form.history }),
      };

      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await queryClient.invalidateQueries({ queryKey: ["items"] });
      setForm(emptyForm);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setForm(emptyForm);
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Name *</label>
            <Input
              required
              value={form.name}
              onChange={field("name")}
              placeholder="Amuleto del Ojo de Horus"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Rarity</label>
            <select
              value={form.rarity ?? ""}
              onChange={field("rarity")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="" className="bg-background">
                — No rarity —
              </option>
              {RARITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value ?? ""} className="bg-background">
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Description</label>
            <Textarea
              value={form.description}
              onChange={field("description")}
              placeholder="Descripción del objeto…"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Properties</label>
            <Textarea
              value={form.properties}
              onChange={field("properties")}
              placeholder="Propiedades mágicas, estadísticas…"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">History</label>
            <Textarea
              value={form.history}
              onChange={field("history")}
              placeholder="Historia y procedencia del objeto…"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
