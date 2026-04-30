"use client";

import { useEffect, useState } from "react";
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
import type { Character } from "@/lib/db/schema";

interface CharacterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character?: Character | null;
}

const STATUS_OPTIONS = ["alive", "dead", "missing", "unknown"] as const;

const emptyForm = {
  name: "",
  title: "",
  description: "",
  backstory: "",
  status: "alive" as Character["status"],
};

export function CharacterForm({ open, onOpenChange, character }: CharacterFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Sync form state when the dialog opens or the character being edited changes
  useEffect(() => {
    if (character) {
      setForm({
        name: character.name,
        title: character.title ?? "",
        description: character.description ?? "",
        backstory: character.backstory ?? "",
        status: character.status ?? "alive",
      });
    } else {
      setForm(emptyForm);
    }
  }, [character, open]);

  const field = (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        ...(form.title && { title: form.title }),
        ...(form.description && { description: form.description }),
        ...(form.backstory && { backstory: form.backstory }),
        status: form.status,
      };

      if (character) {
        await fetch(`/api/characters/${character.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      // Invalidate the characters query so the list refetches automatically
      await queryClient.invalidateQueries({ queryKey: ["characters"] });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{character ? "Edit Character" : "New Character"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Name *</label>
            <Input
              required
              value={form.name}
              onChange={field("name")}
              placeholder="Erevan Shadowcloak"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Title</label>
            <Input
              value={form.title}
              onChange={field("title")}
              placeholder="The Betrayer, High Priestess…"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Status</label>
            {/*
              Using a native <select> styled to match shadcn Input.
              The shadcn Select component isn't installed — a native element
              is identical in appearance and avoids the dependency.
            */}
            <select
              value={form.status ?? "alive"}
              onChange={field("status")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-background">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Description</label>
            <Textarea
              value={form.description}
              onChange={field("description")}
              placeholder="Brief appearance and personality…"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Backstory</label>
            <Textarea
              value={form.backstory}
              onChange={field("backstory")}
              placeholder="Character history and motivations…"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : character ? "Save Changes" : "Create Character"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
