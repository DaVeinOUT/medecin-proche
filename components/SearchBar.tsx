'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { SPECIALITES } from '@/types/medecin';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Médecin, spécialité ou ville...' }: SearchBarProps) {
  const [value, setValue]               = useState('');
  const [suggestions, setSuggestions]   = useState<string[]>([]);
  const [showSugg, setShowSugg]         = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Ferme le dropdown si clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSugg(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (v: string) => {
    setValue(v);
    if (v.trim().length < 2) { setSuggestions([]); setShowSugg(false); return; }
    const q = v.toLowerCase();
    const matches = (SPECIALITES as readonly string[]).filter((s) =>
      s.toLowerCase().includes(q)
    ).slice(0, 5);
    setSuggestions(matches);
    setShowSugg(matches.length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSugg(false);
    onSearch(value.trim());
  };

  const handleSuggestionClick = (s: string) => {
    setValue(s);
    setShowSugg(false);
    onSearch(s);
  };

  const handleClear = () => {
    setValue('');
    setSuggestions([]);
    setShowSugg(false);
    onSearch('');
  };

  return (
    <div ref={wrapperRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lagoon-600 pointer-events-none" size={17} />
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSugg(true)}
            placeholder={placeholder}
            role="combobox"
            aria-label="Rechercher un médecin, une spécialité ou une ville"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSugg}
            className="w-full pl-11 pr-11 py-3.5 bg-paper border border-sand-200 rounded-2xl shadow-lift text-[15px] text-ink-950 placeholder:text-mist-500 focus:outline-none focus:ring-2 focus:ring-lagoon-400 focus:border-lagoon-400 transition"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Effacer la recherche"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-mist-500 hover:text-ink-900 hover:bg-sand-100 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown suggestions */}
      {showSugg && (
        <div
          id="search-suggestions"
          role="listbox"
          aria-label="Suggestions de spécialités"
          className="absolute top-full left-0 right-0 mt-2 bg-paper border border-sand-200 rounded-2xl shadow-float z-50 overflow-hidden divide-y divide-sand-100"
        >
          {suggestions.map((s) => (
            <button
              key={s}
              role="option"
              aria-selected={value === s}
              onMouseDown={() => handleSuggestionClick(s)}
              className="w-full text-left px-4 py-3 text-sm font-medium text-ink-800 hover:bg-lagoon-50 hover:text-lagoon-700 flex items-center gap-2.5 transition-colors"
            >
              <Search size={13} className="text-lagoon-500 shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
