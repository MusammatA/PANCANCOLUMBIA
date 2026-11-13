/** Show the complete original artwork and soften only its lavender field. */
export function ChapterLogo() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="brand-logo"
      viewBox="0 0 909 909"
      width="144"
      height="144"
    >
      <defs>
        <filter id="chapter-logo-lavender" colorInterpolationFilters="sRGB">
          {/* Select RGB values close to the flat lavender (#C08EE0). */}
          <feComponentTransfer in="SourceGraphic" result="lavenderChannels">
            <feFuncR type="discrete" tableValues="0 0 0 0 0 0 0 0 0 0 0 1 1 0 0 0" />
            <feFuncG type="discrete" tableValues="0 0 0 0 0 0 0 0 1 1 0 0 0 0 0 0" />
            <feFuncB type="discrete" tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 0" />
          </feComponentTransfer>
          {/* Where all three channels match, remove 35% of the original alpha. */}
          <feColorMatrix
            in="lavenderChannels"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.35 0.35 0.35 0 -0.70"
            result="lavenderMask"
          />
          <feComposite in="SourceGraphic" in2="lavenderMask" operator="out" />
        </filter>
      </defs>
      {/* The screenshot has a five-pixel white rim beyond the square artwork. */}
      <image href="/images/columbia-pancan.png" width="914" height="914" filter="url(#chapter-logo-lavender)" />
    </svg>
  );
}
