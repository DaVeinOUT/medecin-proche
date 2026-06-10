'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lang, LANG_STORAGE_KEY, LANG_EVENT, t } from '@/lib/i18n';

const VALID: Lang[] = ['fr', 'gcf', 'rcf', 'swb'];

/**
 * Langue d'interface partagée entre composants (localStorage + événement
 * global pour synchroniser BottomNav, page carte, page urgences…).
 */
export function useLang() {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const sync = () => {
      try {
        const stored = localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
        if (stored && VALID.includes(stored)) setLangState(stored);
      } catch {
        // localStorage indisponible
      }
    };
    sync();
    window.addEventListener(LANG_EVENT, sync);
    return () => window.removeEventListener(LANG_EVENT, sync);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);

  const translate = useCallback((key: string) => t(lang, key), [lang]);

  return { lang, setLang, t: translate };
}
