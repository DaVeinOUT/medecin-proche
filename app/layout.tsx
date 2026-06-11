import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

// « Édition Lagon » — serif éditoriale pour les titres, sans humaniste pour l'UI
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Médecin Proche — DOM-TOM',
  description: 'Trouvez un professionnel de santé près de chez vous en Martinique, Guadeloupe, Guyane, La Réunion et Mayotte',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#071E1A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${fraunces.variable} ${jakarta.variable} font-sans antialiased bg-sand-50 text-ink-950`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
