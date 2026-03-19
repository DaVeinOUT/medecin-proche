'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { SPECIALITES } from '@/types/medecin';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSugg(true)}
            placeholder="Médecin, spécialité ou ville..."
            aria-label="Rechercher un médecin, une spécialité ou une ville"
            aria-autocomplete="list"
            aria-expanded={showSugg}
            className="w-full pl-11 pr-10 py-3.5 bg-white rounded-2xl shadow-float text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Effacer la recherche"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown suggestions */}
      {showSugg && (
        <div
          role="listbox"
          aria-label="Suggestions de spécialités"
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-float z-50 overflow-hidden"
        >
          {suggestions.map((s) => (
            <button
              key={s}
              role="option"
              aria-selected={value === s}
              onMouseDown={() => handleSuggestionClick(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2 transition-colors"
            >
              <Search size={13} className="text-gray-300 shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
