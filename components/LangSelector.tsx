'use client';

import { LANGS, Lang } from '@/lib/i18n';
import { useLang } from '@/hooks/useLang';
import { Globe } from 'lucide-react';

/** Sélecteur de langue compact (français + créoles) */
export default function LangSelector() {
  const { lang, setLang } = useLang();

  return (
    <div className="relative">
      <Globe
        size={14}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        aria-hidden="true"
      />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        aria-label="Choisir la langue de l'interface"
        className="appearance-none h-10 pl-8 pr-3 rounded-2xl bg-white shadow-float text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}
