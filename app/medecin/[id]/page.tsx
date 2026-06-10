import type { Metadata } from 'next';
import { getMedecinById } from '@/lib/supabase';
import { avatarGradient, getInitiales } from '@/lib/avatar';
import { toTitleCase } from '@/lib/utils';
import { Phone, PhoneOff, MapPin, Clock, Globe, Users, ChevronLeft, CheckCircle, XCircle, CalendarX, Navigation, Flag } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FavoriButton from '@/components/FavoriButton';
import ShareButton from '@/components/ShareButton';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medecinproche.app';

// Ordre et libellés des jours pour le JSONB horaires { "lun": "08h00–12h00", ... }
const JOURS: [string, string][] = [
  ['lun', 'Lundi'], ['mar', 'Mardi'], ['mer', 'Mercredi'], ['jeu', 'Jeudi'],
  ['ven', 'Vendredi'], ['sam', 'Samedi'], ['dim', 'Dimanche'],
];

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const medecin = await getMedecinById(id);
  if (!medecin) return { title: 'Médecin introuvable | Médecin Proche' };

  const nomComplet = `Dr ${medecin.prenom ?? ''} ${toTitleCase(medecin.nom)}`.trim();
  const title = `${nomComplet} — ${medecin.specialite} à ${medecin.ville} | Médecin Proche`;
  const description = `Consultez la fiche de ${nomComplet}, ${medecin.specialite} à ${medecin.ville} (${medecin.territoire}). Secteur ${medecin.secteur}.${medecin.accepte_nouveaux_patients ? ' Accepte de nouveaux patients.' : ' Complet actuellement.'}`;

  return {
    title,
    description,
    openGraph: {
      title: `${nomComplet} — ${medecin.specialite}`,
      description: `${medecin.specialite} à ${medecin.ville}, ${medecin.territoire}`,
      url: `${BASE_URL}/medecin/${id}`,
      type: 'profile',
    },
  };
}

export default async function MedecinPage({ params }: Props) {
  const { id } = await params;
  const medecin = await getMedecinById(id);

  if (!medecin) notFound();

  const initiales  = getInitiales(medecin.prenom, medecin.nom);
  const gradient   = avatarGradient(medecin.nom, medecin.specialite);
  const displayNom = toTitleCase(medecin.nom);

  return (
    <div className="min-h-screen bg-surface">

      {/* ── HERO PLEINE LARGEUR avec dégradé spécialité ── */}
      <div className={`relative bg-gradient-to-br ${gradient} overflow-hidden`}>
        {/* Cercles décoratifs — texture tropicale subtile */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />

        <div className="max-w-2xl mx-auto px-4 pt-14 pb-10 relative z-10">

          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white/90 text-sm font-semibold bg-white/20 backdrop-blur-sm px-3.5 py-2 rounded-xl tap-scale"
            >
              <ChevronLeft size={15} />
              Retour
            </Link>
            <div className="flex items-center gap-2">
              <ShareButton
                title={`Dr ${medecin.prenom ?? ''} ${displayNom} — ${medecin.specialite}`}
                text={`${medecin.specialite} à ${medecin.ville} (${medecin.territoire})`}
                url={`${BASE_URL}/medecin/${medecin.id}`}
              />
              <FavoriButton medecin={medecin} />
            </div>
          </div>

          {/* Identité — centré, hiérarchie forte */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-3xl bg-white/25 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center mx-auto mb-5 shadow-float">
              <span className="text-white text-3xl font-extrabold tracking-tight">{initiales}</span>
            </div>

            <h1 className="text-2xl font-extrabold text-white leading-tight">
              Dr {medecin.prenom ? toTitleCase(medecin.prenom) : ''} {displayNom}
            </h1>
            <p className="text-white/80 text-sm font-medium mt-1">{medecin.specialite}</p>

            <div className="mt-4 flex justify-center">
              {medecin.accepte_nouveaux_patients ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/90 text-emerald-700 px-4 py-1.5 rounded-full shadow-sm">
                  <CheckCircle size={13} />
                  Accepte de nouveaux patients
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/90 text-red-700 px-4 py-1.5 rounded-full shadow-sm">
                  <XCircle size={13} />
                  Cabinet complet
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-3">

        {/* Informations */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Informations
          </p>

          <div className="divide-y divide-gray-50">
            <div className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Adresse</p>
                <p className="text-sm text-gray-800 font-semibold">{toTitleCase(medecin.adresse)}</p>
                <p className="text-sm text-gray-500">{toTitleCase(medecin.ville)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                <Users size={15} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Secteur</p>
                <p className="text-sm text-gray-800 font-semibold">Secteur {medecin.secteur}</p>
              </div>
            </div>

            {medecin.langues && medecin.langues.length > 0 && (
              <div className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Globe size={15} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Langues parlées</p>
                  <p className="text-sm text-gray-800 font-semibold">{medecin.langues.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Horaires — toujours affiché */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Horaires
          </p>
          <div className="flex items-start gap-4 px-5 pb-4">
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <Clock size={15} className="text-primary-600" />
            </div>
            {medecin.horaires && typeof medecin.horaires === 'object' ? (
              <div className="flex-1 space-y-1">
                {JOURS.map(([key, label]) => (
                  <div key={key} className="flex items-baseline justify-between gap-3">
                    <span className={`text-sm ${medecin.horaires?.[key] ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>
                      {label}
                    </span>
                    <span className={`text-sm text-right ${medecin.horaires?.[key] ? 'text-gray-800 font-semibold' : 'text-gray-300'}`}>
                      {medecin.horaires?.[key] ?? 'Fermé'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Horaires non renseignés — contactez le cabinet</p>
            )}
          </div>
        </div>

        {/* RDV en ligne */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl overflow-hidden">
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <CalendarX size={15} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-700 font-bold">Pas de prise de RDV en ligne</p>
              <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">Contactez directement le cabinet par téléphone pour réserver une consultation.</p>
            </div>
          </div>
        </div>

        {/* Signaler une erreur — un faux numéro détruit la confiance */}
        <a
          href={`mailto:davedorelus025@gmail.com?subject=${encodeURIComponent(`[Médecin Proche] Erreur fiche — Dr ${displayNom} (${medecin.ville})`)}&body=${encodeURIComponent(`Fiche : ${BASE_URL}/medecin/${medecin.id}\nPraticien : Dr ${medecin.prenom ?? ''} ${displayNom} — ${medecin.specialite}\n\nQuelle information est incorrecte ? (téléphone, adresse, horaires, autre)\n\n`)}`}
          className="flex items-center justify-center gap-2 w-full py-3 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Flag size={13} aria-hidden="true" />
          Signaler une erreur sur cette fiche
        </a>

      </div>

      {/* ── CTA FIXE EN BAS ── */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 8px) + 12px)' }}
      >
        <div className="flex items-stretch gap-2.5">
          {medecin.telephone ? (
            <a
              href={`tel:${medecin.telephone}`}
              className={`btn-appeler flex items-center justify-center gap-2.5 flex-1 bg-gradient-to-r ${gradient} text-white py-3.5 rounded-2xl font-bold text-base tap-scale`}
            >
              <Phone size={19} />
              Appeler — {medecin.telephone}
            </a>
          ) : (
            <div className="flex items-center justify-center gap-2.5 flex-1 bg-gray-100 text-gray-400 py-3.5 rounded-2xl font-semibold text-sm">
              <PhoneOff size={17} />
              Numéro non disponible
            </div>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${medecin.lat},${medecin.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Itinéraire vers le cabinet"
            className="flex flex-col items-center justify-center gap-0.5 px-4 bg-white border-2 border-primary-600 text-primary-600 rounded-2xl font-bold text-xs tap-scale shrink-0"
          >
            <Navigation size={18} />
            Y aller
          </a>
        </div>
      </div>

      <div className="h-28" />

    </div>
  );
}
