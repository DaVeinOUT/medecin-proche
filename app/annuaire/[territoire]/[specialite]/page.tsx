import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { slugify } from '@/lib/slug';
import { toTitleCase, nomAffiche } from '@/lib/utils';
import { avatarBg, getInitiales } from '@/lib/avatar';
import PulseLine from '@/components/PulseLine';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, MapPin, Phone, CheckCircle } from 'lucide-react';

// Pages d'annuaire SEO « Pédiatre en Martinique » — régénérées chaque jour (ISR)
export const revalidate = 86400;
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medecinproche.app';

type Props = { params: Promise<{ territoire: string; specialite: string }> };

interface Pair { territoire: string; specialite: string; nb: number }

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getPairs(): Promise<Pair[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from('annuaire_pairs').select('territoire,specialite,nb');
  return (data as Pair[]) ?? [];
}

/** Résout les slugs d'URL vers les vraies valeurs en base */
async function resolvePair(territoireSlug: string, specialiteSlug: string): Promise<Pair | null> {
  const pairs = await getPairs();
  return pairs.find(
    (p) => slugify(p.territoire) === territoireSlug && slugify(p.specialite) === specialiteSlug
  ) ?? null;
}

export async function generateStaticParams() {
  const pairs = await getPairs();
  return pairs.map((p) => ({
    territoire: slugify(p.territoire),
    specialite: slugify(p.specialite),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { territoire, specialite } = await params;
  const pair = await resolvePair(territoire, specialite);
  if (!pair) return { title: 'Annuaire | Médecin Proche' };

  const title = `${pair.specialite} — ${pair.territoire} : ${pair.nb} praticien${pair.nb > 1 ? 's' : ''} | Médecin Proche`;
  const description = `Trouvez un ${pair.specialite.toLowerCase()} en ${pair.territoire} : coordonnées, adresse, téléphone et horaires de ${pair.nb} praticien${pair.nb > 1 ? 's' : ''}. Annuaire santé gratuit des DOM-TOM.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/annuaire/${territoire}/${specialite}` },
    openGraph: { title, description, url: `${BASE_URL}/annuaire/${territoire}/${specialite}` },
  };
}

export default async function AnnuairePage({ params }: Props) {
  const { territoire, specialite } = await params;
  const pair = await resolvePair(territoire, specialite);
  if (!pair) notFound();

  const client = getClient();
  if (!client) notFound();

  const { data } = await client
    .from('medecins_vue')
    .select('id,nom,prenom,specialite,adresse,ville,telephone,secteur,accepte_nouveaux_patients')
    .eq('territoire', pair.territoire)
    .eq('specialite', pair.specialite)
    .order('ville')
    .limit(500);

  const medecins = data ?? [];

  return (
    <div className="min-h-screen bg-sand-50" style={{ paddingBottom: 'calc(var(--bottom-nav-height) + 16px)' }}>

      {/* HÉROS ENCRE — éditorial annuaire */}
      <div className="relative bg-ink-950 grain overflow-hidden">
        <div className="aurora w-64 h-64 -top-20 -right-14" style={{ background: '#2BC4A4', opacity: 0.45 }} />

        <div className="max-w-2xl mx-auto px-4 pt-12 pb-7 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sand-50 text-sm font-bold bg-white/10 border border-white/20 backdrop-blur-sm px-3.5 py-2 rounded-full mb-5 tap-scale"
          >
            <ChevronLeft size={15} />
            Carte
          </Link>
          <p className="label-mono text-lagoon-300 mb-1.5">
            Annuaire · {pair.territoire}
          </p>
          <h1 className="font-display font-semibold text-3xl text-sand-50 leading-tight text-balance">
            {pair.specialite}
          </h1>
          <p className="text-sand-200/70 text-sm mt-1.5 tnum">
            {pair.nb} praticien{pair.nb > 1 ? 's' : ''} référencé{pair.nb > 1 ? 's' : ''}
          </p>
          <PulseLine animated className="w-36 h-4 mt-4 text-lagoon-400/70" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-2.5">
        {medecins.map((m) => (
          <Link
            key={m.id}
            href={`/medecin/${m.id}`}
            className="flex items-center gap-3.5 bg-paper border border-sand-200 rounded-2xl shadow-card px-4 py-3.5 tap-scale hover:shadow-card-hover transition-shadow"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-display font-semibold text-sm ${avatarBg(m.nom, m.specialite)}`}>
              {getInitiales(m.prenom, m.nom)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink-950 truncate">
                {nomAffiche(m.prenom, m.nom, m.specialite)}
              </p>
              <p className="text-xs text-mist-500 truncate flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="shrink-0" aria-hidden="true" />
                {toTitleCase(m.ville || m.adresse)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {m.accepte_nouveaux_patients && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-lagoon-700 bg-lagoon-50 border border-lagoon-100 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} aria-hidden="true" />
                  Disponible
                </span>
              )}
              {m.telephone && <Phone size={14} className="text-lagoon-600" aria-hidden="true" />}
            </div>
          </Link>
        ))}

        <div className="text-center space-y-1.5 px-6 pt-3">
          <PulseLine className="w-20 h-4 mx-auto text-sand-300" />
          <p className="text-[11px] text-mist-500 leading-relaxed">
            Données issues de l&apos;Annuaire Santé (CNAM) — non actualisées en temps réel.
            Vérifiez par téléphone avant de vous déplacer.
          </p>
        </div>
      </div>

      <BottomNav activePage="none" />
    </div>
  );
}
