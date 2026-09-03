import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Premium identity avatar: renders the user's image when available, otherwise
 * initials on a deterministic gradient derived from the name.
 */

const GRADIENTS = [
  "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  "linear-gradient(135deg, #f59e0b, #f43f5e)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #d946ef, #a855f7)",
  "linear-gradient(135deg, #0ea5e9, #6366f1)",
  "linear-gradient(135deg, #f97316, #ec4899)",
] as const;

export function gradientForName(name?: string | null): string {
  if (!name) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function initialsForName(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
}

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const gradient = gradientForName(name);
  const initials = initialsForName(name);

  return (
    <Avatar className={cn("size-9 shrink-0", className)}>
      {image ? (
        <AvatarImage src={image} alt={name ?? "User"} referrerPolicy="no-referrer" />
      ) : null}
      <AvatarFallback
        className="text-white"
        style={{ backgroundImage: gradient }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}