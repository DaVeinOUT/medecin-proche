'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

/** Pastille verre — conçue pour les héros encre (fiche médecin) */
export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Annulé par l'utilisateur
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  return (
    <div className="relative">
      {/* Toast "Lien copié !" */}
      {copied && (
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-ink-900 border border-white/10 text-sand-50 text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap shadow-float pointer-events-none">
          Lien copié !
        </div>
      )}

      <button
        onClick={handleShare}
        aria-label="Partager cette fiche"
        className="w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center tap-scale transition-colors hover:bg-white/20"
      >
        {copied
          ? <Check size={17} className="text-lagoon-300" />
          : <Share2 size={17} className="text-sand-100" />
        }
      </button>
    </div>
  );
}
