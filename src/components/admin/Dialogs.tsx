import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FieldDef =
  | {
      name: string;
      label: string;
      type?: "text" | "email" | "tel" | "number";
      placeholder?: string;
      required?: boolean;
    }
  | { name: string; label: string; type: "textarea"; placeholder?: string; required?: boolean }
  | { name: string; label: string; type: "select"; options: readonly string[]; required?: boolean }
  | { name: string; label: string; type: "switch" };

export type FormValues = Record<string, string | boolean>;

function Fields({
  fields,
  values,
  set,
}: {
  fields: FieldDef[];
  values: FormValues;
  set: (k: string, v: string | boolean) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((f) => {
        const id = `f-${f.name}`;
        const wide = f.type === "textarea";
        if (f.type === "switch") {
          return (
            <div
              key={f.name}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2 sm:col-span-2"
            >
              <Label htmlFor={id}>{f.label}</Label>
              <Switch
                id={id}
                checked={Boolean(values[f.name])}
                onCheckedChange={(v) => set(f.name, v)}
              />
            </div>
          );
        }
        return (
          <div key={f.name} className={wide ? "grid gap-1.5 sm:col-span-2" : "grid gap-1.5"}>
            <Label htmlFor={id}>{f.label}</Label>
            {f.type === "select" ? (
              <Select value={String(values[f.name] ?? "")} onValueChange={(v) => set(f.name, v)}>
                <SelectTrigger id={id} className="h-10">
                  <SelectValue placeholder={`Select ${f.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {f.options.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : f.type === "textarea" ? (
              <Textarea
                id={id}
                rows={3}
                placeholder={f.placeholder}
                value={String(values[f.name] ?? "")}
                onChange={(e) => set(f.name, e.target.value)}
              />
            ) : (
              <Input
                id={id}
                className="h-10"
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                value={String(values[f.name] ?? "")}
                onChange={(e) => set(f.name, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function useForm(open: boolean, initial: FormValues) {
  const [values, setValues] = useState<FormValues>(initial);
  // reset whenever opened with new initial values
  const key = JSON.stringify(initial);
  useEffect(() => {
    if (open) setValues(JSON.parse(key) as FormValues);
  }, [open, key]);
  return [
    values,
    (k: string, v: string | boolean) => setValues((s) => ({ ...s, [k]: v })),
  ] as const;
}

function missing(fields: FieldDef[], values: FormValues) {
  return fields.some((f) => "required" in f && f.required && !String(values[f.name] ?? "").trim());
}

interface FormProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  fields: FieldDef[];
  initial?: FormValues;
  submitLabel?: string;
  onSubmit: (values: FormValues) => void;
  children?: ReactNode;
}

/** Centered modal form (bottom-friendly on mobile via 95vw + scrollable body). */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initial = {},
  submitLabel = "Save",
  onSubmit,
  children,
}: FormProps) {
  const [values, set] = useForm(open, initial);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Fields fields={fields} values={values} set={set} />
        {children}
        <DialogFooter className="gap-2">
          <Button variant="outline" className="h-10" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="h-10"
            disabled={missing(fields, values)}
            onClick={() => {
              onSubmit(values);
              onOpenChange(false);
            }}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Side drawer form used for edits. */
export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initial = {},
  submitLabel = "Save changes",
  onSubmit,
}: FormProps) {
  const [values, set] = useForm(open, initial);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 px-4">
          <Fields fields={fields} values={values} set={set} />
        </div>
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-background p-4">
          <Button variant="outline" className="h-10" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="h-10"
            disabled={missing(fields, values)}
            onClick={() => {
              onSubmit(values);
              onOpenChange(false);
            }}
          >
            {submitLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Confirmation dialog that requires a reason note. */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="reason">Reason (saved to audit log)</Label>
          <Textarea
            id="reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why…"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="h-10" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="h-10"
            variant={destructive ? "destructive" : "default"}
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm(reason);
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Simple yes/no confirm. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="h-10" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="h-10"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const saved = (title: string, description?: string) =>
  toast.success(title, description ? { description } : undefined);
