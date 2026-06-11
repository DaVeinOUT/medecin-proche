/**
 * Motif signature « Édition Lagon » — un battement ECG qui se fond en houle.
 * Purement décoratif (aria-hidden). La couleur suit `currentColor` :
 * appliquer une classe `text-…` sur le parent ou via className.
 *
 * `animated` superpose un tracé voyageur sur une ligne de base estompée
 * (désactivé par prefers-reduced-motion).
 */
interface PulseLineProps {
  className?: string;
  animated?: boolean;
}

const PATH =
  'M0 14 H44 L50 14 L54 9.5 L58 14 L63 14 L67 22 L71 2 L77 25 L81 14 H92 ' +
  'C100 14 102 6.5 112 6.5 ' +
  'C122 6.5 122 21.5 132 21.5 ' +
  'C142 21.5 142 10 152 10 ' +
  'C162 10 162 18 172 18 ' +
  'C182 18 186 14 200 14';

export default function PulseLine({ className = '', animated = false }: PulseLineProps) {
  return (
    <svg
      viewBox="0 0 200 28"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      {animated && (
        <path
          d={PATH}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.28}
        />
      )}
      <path
        d={PATH}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={370}
        className={animated ? 'ecg-path' : undefined}
      />
    </svg>
  );
}
