import { cn } from "@/lib/utils";

export function UserAvatar({
  src,
  name,
  size = 32,
  className,
}: {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent text-[11px] font-bold text-accent-foreground",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? <img src={src} alt={name} className="size-full object-cover" loading="lazy" /> : initials}
    </span>
  );
}
