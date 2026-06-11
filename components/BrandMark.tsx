/**
 * Monogramme « Édition Lagon » — croix médicale en filigrane,
 * ligne de pouls lagon, point corail (la localisation chaude).
 */
interface BrandMarkProps {
  size?: number;
  className?: string;
}

export default function BrandMark({ size = 40, className = '' }: BrandMarkProps) {
  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-ink-800 to-ink-950 border border-white/10 shadow-medallion shrink-0 ${className}`}
    >
      <svg width="72%" height="72%" viewBox="0 0 32 32" fill="none">
        {/* Croix médicale en filigrane */}
        <rect x="13" y="5" width="6" height="22" rx="2.5" fill="#2BC4A4" opacity="0.22" />
        <rect x="5" y="13" width="22" height="6" rx="2.5" fill="#2BC4A4" opacity="0.22" />
        {/* Ligne de pouls */}
        <path
          d="M4 16 H10.5 L13 10.5 L16.5 21.5 L19 16 H26"
          stroke="#6FE0C6"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Point corail — la localisation */}
        <circle cx="27.5" cy="16" r="2" fill="#FF7E66" />
      </svg>
    </div>
  );
}
