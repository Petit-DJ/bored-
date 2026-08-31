/**
 * Background environment: faint concentric orbit rings and a slow elliptical
 * armature that echoes the helix axis. Pure linework in silver — no gradients,
 * no glow. It sits behind everything and never competes with the cards.
 */
export function OrbitField({ tone = "ink" }: { tone?: "ink" | "light" }) {
  const stroke = tone === "light" ? "var(--curtain-foreground)" : "var(--silver-deep)";
  const base = tone === "light" ? 0.16 : 0.3;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* concentric orbit rings, centred on the helix axis */}
      <svg
        className="absolute left-1/2 top-1/2 h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2 animate-orbit-drift"
        viewBox="0 0 1000 1000"
        fill="none"
        stroke={stroke}
      >
        <g opacity={base} strokeWidth="0.6">
          <circle cx="500" cy="500" r="150" />
          <circle cx="500" cy="500" r="238" />
          <circle cx="500" cy="500" r="332" />
          <circle cx="500" cy="500" r="430" />
        </g>
        {/* perspective ellipses: the helix path implied, not drawn */}
        <g opacity={base * 0.85} strokeWidth="0.5">
          <ellipse cx="500" cy="500" rx="332" ry="88" />
          <ellipse cx="500" cy="500" rx="332" ry="88" transform="rotate(24 500 500)" />
          <ellipse cx="500" cy="500" rx="430" ry="112" transform="rotate(-18 500 500)" />
        </g>
      </svg>

      {/* understated architectural rules: a city plan seen from far away */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        fill="none"
        stroke={stroke}
      >
        <g opacity={base * 0.5} strokeWidth="0.12">
          <line x1="14" y1="0" x2="14" y2="100" />
          <line x1="50" y1="0" x2="50" y2="100" />
          <line x1="86" y1="0" x2="86" y2="100" />
          <line x1="0" y1="22" x2="100" y2="22" />
          <line x1="0" y1="78" x2="100" y2="78" />
        </g>
      </svg>
    </div>
  );
}
