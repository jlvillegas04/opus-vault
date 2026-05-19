"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface EntityPageShellProps {
  backHref: string;
  title: ReactNode;
  actions: ReactNode;
  children: ReactNode;
}

export function EntityPageShell({ backHref, title, actions, children }: EntityPageShellProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="shrink-0 border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">{title}</div>
        <div className="flex items-center gap-1 shrink-0">{actions}</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
