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
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap shadow-float transition-all tap-scale ${
              active
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'
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
