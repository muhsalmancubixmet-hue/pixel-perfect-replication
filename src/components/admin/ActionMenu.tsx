import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ActionItem {
  label: string;
  onSelect?: () => void;
  destructive?: boolean;
  separatorBefore?: boolean;
  node?: ReactNode;
}

/** Placeholder handler for prototype-only actions. */
export const mockAction = (label: string, subject: string) => () =>
  toast.success(`${label} — ${subject}`, {
    description: "Prototype action: no backend call was made.",
  });

export function ActionMenu({ items }: { items: ActionItem[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Row actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {items.map((item, i) => (
          <div key={item.label + i}>
            {item.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onSelect={() => item.onSelect?.()}
              className={item.destructive ? "text-destructive focus:text-destructive" : undefined}
              asChild={Boolean(item.node)}
            >
              {item.node ?? item.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
