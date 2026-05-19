"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  className?: string;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: FilterOption[];
  activeFilter?: string | null;
  onFilterChange?: (value: string | null) => void;
}

export function FilterBar({
  search,
  onSearchChange,
  placeholder = "Search...",
  filters,
  activeFilter = null,
  onFilterChange,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filters && filters.length > 0 && onFilterChange && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors",
              activeFilter === null
                ? "bg-foreground text-background border-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            onClick={() => onFilterChange(null)}
          >
            All
          </Badge>
          {filters.map((filter) => (
            <Badge
              key={filter.value}
              variant="outline"
              className={cn(
                "cursor-pointer transition-colors capitalize",
                activeFilter === filter.value
                  ? filter.className
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={() => onFilterChange(activeFilter === filter.value ? null : filter.value)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
