'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Annulé par l'utilisateur — pas d'erreur à afficher
      }
      return;
    }

    // Fallback : copie dans le presse-papier
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Partager cette fiche"
      className="w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center tap-scale transition-colors hover:bg-primary-50"
    >
      {copied
        ? <Check size={17} className="text-emerald-600" />
        : <Share2 size={17} className="text-gray-500" />
      }
    </button>
  );
}
