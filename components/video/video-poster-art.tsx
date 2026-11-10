/**
 * Custom poster artwork for the walkthrough video: an abstract composition of
 * the product's surfaces (editor, graph, sorting bars). Pure SVG, so it stays
 * crisp at any size and needs no image asset.
 */
export function VideoPosterArt() {
  const bars = [38, 64, 26, 82, 50, 70, 34, 58];
  return (
    <svg viewBox="0 0 960 540" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="vp-glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#6c4fd1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vp-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1826" />
          <stop offset="100%" stopColor="#121119" />
        </linearGradient>
        <linearGradient id="vp-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfc4ff" />
          <stop offset="100%" stopColor="#6c4fd1" />
        </linearGradient>
        <pattern id="vp-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#ffffff" opacity="0.06" />
        </pattern>
      </defs>

      <rect width="960" height="540" fill="#0c0b12" />
      <rect width="960" height="540" fill="url(#vp-dots)" />
      <rect width="960" height="540" fill="url(#vp-glow)" />

      {/* Editor panel */}
      <g transform="translate(70 120) rotate(-4)">
        <rect width="300" height="220" rx="14" fill="url(#vp-panel)" stroke="#ffffff" strokeOpacity="0.1" />
        <circle cx="22" cy="20" r="4" fill="#ffffff" opacity="0.15" />
        <circle cx="36" cy="20" r="4" fill="#ffffff" opacity="0.15" />
        <circle cx="50" cy="20" r="4" fill="#ffffff" opacity="0.15" />
        {[
          [24, 90, "#9d86f7"],
          [24, 150, "#ffffff"],
          [44, 120, "#6ee7b7"],
          [44, 170, "#ffffff"],
          [44, 80, "#cfc4ff"],
          [24, 60, "#9d86f7"],
          [24, 130, "#ffffff"],
        ].map(([x, w, c], i) => (
          <rect key={i} x={x as number} y={48 + i * 22} width={w as number} height="7" rx="3.5" fill={c as string} opacity={c === "#ffffff" ? 0.18 : 0.6} />
        ))}
      </g>

      {/* Sorting bars panel */}
      <g transform="translate(610 300) rotate(3)">
        <rect width="290" height="180" rx="14" fill="url(#vp-panel)" stroke="#ffffff" strokeOpacity="0.1" />
        {bars.map((h, i) => (
          <rect
            key={i}
            x={26 + i * 31}
            y={150 - h * 1.4}
            width="20"
            height={h * 1.4}
            rx="4"
            fill={i === 3 || i === 5 ? "url(#vp-bar)" : "#ffffff"}
            opacity={i === 3 || i === 5 ? 0.9 : 0.14}
          />
        ))}
      </g>

      {/* Graph panel */}
      <g transform="translate(560 70)">
        <rect width="320" height="190" rx="14" fill="url(#vp-panel)" stroke="#ffffff" strokeOpacity="0.1" />
        <g stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.5">
          <line x1="60" y1="100" x2="140" y2="50" />
          <line x1="60" y1="100" x2="140" y2="150" />
          <line x1="140" y1="50" x2="250" y2="70" />
          <line x1="140" y1="150" x2="250" y2="70" />
          <line x1="140" y1="150" x2="250" y2="140" />
        </g>
        <g stroke="#b7a6ff" strokeOpacity="0.8" strokeWidth="2">
          <line x1="60" y1="100" x2="140" y2="150" />
          <line x1="140" y1="150" x2="250" y2="70" />
        </g>
        {[
          [60, 100, true],
          [140, 50, false],
          [140, 150, true],
          [250, 70, true],
          [250, 140, false],
        ].map(([x, y, on], i) => (
          <circle
            key={i}
            cx={x as number}
            cy={y as number}
            r="13"
            fill={on ? "#2a2150" : "#16151f"}
            stroke={on ? "#b7a6ff" : "#ffffff"}
            strokeOpacity={on ? 0.9 : 0.25}
            strokeWidth="1.5"
          />
        ))}
      </g>

      {/* Vignette */}
      <rect width="960" height="540" fill="url(#vp-glow)" opacity="0.4" />
    </svg>
  );
}
