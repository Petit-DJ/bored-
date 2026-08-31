import { cn } from "@/lib/utils";

export type DiscoveryMode = "helix" | "map";

/**
 * Understated mode switch: two words set in the metadata face, divided by a
 * silver rule — closer to a printed index than a segmented control.
 */
export function ViewToggle({
  mode,
  onChange,
  className,
}: {
  mode: DiscoveryMode;
  onChange: (mode: DiscoveryMode) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Discovery mode"
      className={cn(
        "pointer-events-auto inline-flex items-stretch border border-border bg-card/90 postcard-shadow",
        className,
      )}
    >
      {(["helix", "map"] as const).map((value, i) => {
        const isActive = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={cn(
              "label-micro min-h-9 px-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              i === 1 && "border-l border-silver",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-ink",
            )}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
