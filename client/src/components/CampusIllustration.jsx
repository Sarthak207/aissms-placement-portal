import { useState } from 'react';

/**
 * Renders a real campus photo if one has been dropped in at
 * `client/public/images/campus.jpg` (or .png). Falls back to an original
 * illustrated campus building — flat vector style matching the app's
 * navy/parchment/gold palette — so the landing page never shows a broken image.
 */
export default function CampusIllustration({ className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      <img
        src="/images/campus.jpg"
        alt="AISSMS College campus"
        className={`object-cover ${className}`}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return <CampusArt className={className} />;
}

/** Original illustration — stylized academic building, not a photo of any real campus. */
function CampusArt({ className = '' }) {
  return (
    <svg viewBox="0 0 480 320" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="480" height="320" fill="#EEF0F6" />

      {/* sky gradient wash */}
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FAF9F6" />
          <stop offset="100%" stopColor="#EEF0F6" />
        </linearGradient>
      </defs>
      <rect width="480" height="230" fill="url(#skyGrad)" />

      {/* ground */}
      <rect y="255" width="480" height="65" fill="#D3D8E8" />
      <rect y="255" width="480" height="4" fill="#A7B0D1" />

      {/* steps */}
      <rect x="120" y="245" width="240" height="12" fill="#C9CFE0" />
      <rect x="135" y="233" width="210" height="12" fill="#D3D8E8" />

      {/* main building block */}
      <rect x="150" y="140" width="180" height="93" fill="#16213E" />
      {/* pediment / roof triangle */}
      <path d="M140 140 L240 90 L340 140 Z" fill="#232F52" />
      <path d="M140 140 L240 90 L340 140 Z" fill="none" stroke="#C9A227" strokeWidth="1.5" />

      {/* columns */}
      {[168, 194, 220, 246, 272, 298].map((x) => (
        <rect key={x} x={x} y="150" width="10" height="83" fill="#4A5786" />
      ))}
      <rect x="160" y="145" width="160" height="8" fill="#C9A227" opacity="0.9" />

      {/* entrance door */}
      <rect x="222" y="195" width="36" height="38" fill="#C9A227" opacity="0.85" />
      <line x1="240" y1="195" x2="240" y2="233" stroke="#16213E" strokeWidth="1" />

      {/* flag on top */}
      <line x1="240" y1="90" x2="240" y2="62" stroke="#4A5786" strokeWidth="2" />
      <path d="M240 62 L266 68 L240 74 Z" fill="#C9A227" />

      {/* side wings */}
      <rect x="90" y="175" width="60" height="58" fill="#232F52" />
      <rect x="330" y="175" width="60" height="58" fill="#232F52" />
      {[100, 118, 136].map((x) => (
        <rect key={x} x={x} y="190" width="10" height="18" fill="#C9A227" opacity="0.7" />
      ))}
      {[340, 358, 376].map((x) => (
        <rect key={x} x={x} y="190" width="10" height="18" fill="#C9A227" opacity="0.7" />
      ))}

      {/* trees */}
      <g opacity="0.9">
        <circle cx="60" cy="225" r="22" fill="#4A5786" opacity="0.35" />
        <rect x="57" y="240" width="6" height="18" fill="#7C8598" />
        <circle cx="420" cy="220" r="26" fill="#4A5786" opacity="0.35" />
        <rect x="416" y="238" width="7" height="20" fill="#7C8598" />
      </g>

      {/* small foreground figures for scale */}
      <g fill="#16213E" opacity="0.55">
        <circle cx="175" cy="256" r="4" />
        <rect x="171" y="260" width="8" height="16" rx="2" />
        <circle cx="305" cy="258" r="4" />
        <rect x="301" y="262" width="8" height="16" rx="2" />
      </g>
    </svg>
  );
}
