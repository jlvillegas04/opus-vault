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

interface FactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  name: "",
  alignment: "",
  description: "",
  goals: "",
};

export function FactionForm({ open, onOpenChange }: FactionFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const field =
    (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleOpenChange = (open: boolean) => {
    if (!open) setForm(emptyForm);
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        ...(form.alignment && { alignment: form.alignment }),
        ...(form.description && { description: form.description }),
        ...(form.goals && { goals: form.goals }),
      };

      await fetch("/api/factions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await queryClient.invalidateQueries({ queryKey: ["factions"] });
      handleOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Faction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Name *</label>
            <Input
              required
              value={form.name}
              onChange={field("name")}
              placeholder="The Shadow Council"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Alignment</label>
            <Input
              value={form.alignment}
              onChange={field("alignment")}
              placeholder="Neutral Evil, Chaotic Good…"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Description</label>
            <Textarea
              value={form.description}
              onChange={field("description")}
              placeholder="Descripción breve…"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Goals</label>
            <Textarea
              value={form.goals}
              onChange={field("goals")}
              placeholder="Qué busca esta facción…"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Create Faction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
