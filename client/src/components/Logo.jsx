import { useState } from 'react';

/**
 * Renders the real college logo if one has been dropped in at
 * `client/public/images/college-logo.png` (or .svg). Until then, falls back
 * to an original seal mark so the app never shows a broken image icon.
 *
 * To use your real AISSMS logo: save it as college-logo.png (or .svg) into
 * client/public/images/ — no code changes needed, this component picks it up
 * automatically.
 */
export default function Logo({ size = 40, className = '', showWordmark = false, wordmarkClassName = '' }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {!imgFailed ? (
        <img
          src="/images/college-logo.png"
          alt="AISSMS College"
          width={size}
          height={size}
          className="object-contain shrink-0"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <SealMark size={size} />
      )}
      {showWordmark && (
        <span className={`font-display font-semibold ${wordmarkClassName}`}>
          AISSMS <span className="text-seal-dark">Placement</span>
        </span>
      )}
    </div>
  );
}

/** Original wax-seal-style monogram — the app's default mark until a real logo is supplied. */
export function SealMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <circle cx="32" cy="32" r="31" fill="#16213E" stroke="#C9A227" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="#C9A227" strokeWidth="0.75" strokeDasharray="1.5 2.5" />
      {/* Graduation cap glyph */}
      <path d="M32 20L14 27.5L32 35L50 27.5L32 20Z" fill="#C9A227" />
      <path d="M22 31.5V39C22 39 26 43 32 43C38 43 42 39 42 39V31.5" stroke="#C9A227" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="47" y1="28.5" x2="47" y2="37" stroke="#C9A227" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="47" cy="39" r="1.6" fill="#C9A227" />
    </svg>
  );
}
