'use client';

import { POSITIONS_DOM } from '@/lib/geo';

interface TerritoireSelectorProps {
  onSelect: (position: [number, number], territoire: string) => void;
  territoire: string;
}

const TERRITOIRES = [
  { label: 'Martinique', flag: '🇲🇶', key: 'martinique', position: POSITIONS_DOM.martinique },
  { label: 'Guadeloupe', flag: '🇬🇵', key: 'guadeloupe', position: POSITIONS_DOM.guadeloupe },
  { label: 'Guyane',     flag: '🇬🇫', key: 'guyane',     position: POSITIONS_DOM.guyane     },
  { label: 'Réunion',    flag: '🇷🇪', key: 'reunion',    position: POSITIONS_DOM.reunion    },
  { label: 'Mayotte',    flag: '🇾🇹', key: 'mayotte',    position: POSITIONS_DOM.mayotte    },
  { label: 'Saint-Martin',     flag: '🇲🇫', key: 'saintMartin',     position: POSITIONS_DOM.saintMartin     },
  { label: 'Saint-Barthélemy', flag: '🇧🇱', key: 'saintBarthelemy', position: POSITIONS_DOM.saintBarthelemy },
];

export default function TerritoireSelector({ onSelect, territoire }: TerritoireSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {TERRITOIRES.map((t) => {
        const active = territoire === t.label;
        return (
          <button
            key={t.key}
            onClick={() => onSelect(t.position, t.label)}
            aria-label={`Voir les médecins en ${t.label}`}
            aria-pressed={active}
            className={`flex items-center gap-1.5 h-10 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-all tap-scale ${
              active
                ? 'bg-lagoon-400 text-ink-950 shadow-glow'
                : 'glass-ink text-sand-100 shadow-float hover:text-lagoon-200'
            }`}
          >
            <span aria-hidden="true">{t.flag}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
