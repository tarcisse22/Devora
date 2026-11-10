/**
 * Decorative backdrop for the hero: a soft violet glow from above and a set of
 * layered, flowing ridge lines near the bottom. Purely presentational.
 */
export function HeroAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Top light wash */}
      <div className="absolute left-1/2 top-[-30%] h-[70%] w-[120%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgb(108_79_209/0.16),transparent_65%)]" />
      {/* Glow behind the visualizer */}
      <div className="absolute right-[-10%] top-[12%] h-[70%] w-[60%] bg-[radial-gradient(ellipse_at_center,rgb(132_102_234/0.18),transparent_65%)] blur-2xl" />

      {/* Flowing ridges */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[52%] w-full min-w-[1100px] left-1/2 -translate-x-1/2"
        viewBox="0 0 1600 520"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <defs>
          <linearGradient id="ridge-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2d6e" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#14121f" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a0a0f" />
          </linearGradient>
          <linearGradient id="ridge-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b2250" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#100e18" />
            <stop offset="100%" stopColor="#0a0a0f" />
          </linearGradient>
          <linearGradient id="ridge-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1630" />
            <stop offset="45%" stopColor="#0c0b12" />
            <stop offset="100%" stopColor="#0a0a0f" />
          </linearGradient>
          <linearGradient id="ridge-rim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b7a6ff" stopOpacity="0" />
            <stop offset="55%" stopColor="#b7a6ff" stopOpacity="0.55" />
            <stop offset="80%" stopColor="#cfc4ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#b7a6ff" stopOpacity="0" />
          </linearGradient>
          <filter id="ridge-soft" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Far ridge */}
        <path
          d="M0 250 C 180 210 320 230 470 200 C 640 166 760 120 930 140 C 1080 158 1180 90 1330 70 C 1440 56 1530 80 1600 92 L1600 520 L0 520 Z"
          fill="url(#ridge-far)"
        />
        <path
          d="M470 200 C 640 166 760 120 930 140 C 1080 158 1180 90 1330 70 C 1440 56 1530 80 1600 92"
          stroke="url(#ridge-rim)"
          strokeWidth="1.5"
          filter="url(#ridge-soft)"
        />

        {/* Middle ridge */}
        <path
          d="M0 330 C 160 300 300 330 470 300 C 660 266 780 240 960 262 C 1130 282 1260 210 1420 220 C 1500 225 1560 240 1600 250 L1600 520 L0 520 Z"
          fill="url(#ridge-mid)"
        />
        <path
          d="M560 285 C 700 255 800 242 960 262 C 1130 282 1260 210 1420 220"
          stroke="#9d86f7"
          strokeOpacity="0.25"
          strokeWidth="1"
        />

        {/* Near ridge */}
        <path
          d="M0 420 C 200 380 380 410 560 390 C 760 368 900 330 1080 350 C 1260 370 1420 330 1600 340 L1600 520 L0 520 Z"
          fill="url(#ridge-near)"
        />
      </svg>

      {/* Fade into the page below */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-canvas" />
    </div>
  );
}
