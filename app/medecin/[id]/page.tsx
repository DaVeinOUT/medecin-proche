import type { Metadata } from 'next';
import { getMedecinById } from '@/lib/supabase';
import { avatarGradient, avatarAurora, getInitiales } from '@/lib/avatar';
import { toTitleCase, formatTel, nomAffiche } from '@/lib/utils';
import { Phone, PhoneOff, MapPin, Clock, Globe, Users, ChevronLeft, CheckCircle, XCircle, CalendarX, Navigation, Flag } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FavoriButton from '@/components/FavoriButton';
import ShareButton from '@/components/ShareButton';
import PulseLine from '@/components/PulseLine';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medecinproche.app';

// Ordre et libellés des jours pour le JSONB horaires { "lun": "08h00–12h00", ... }
const JOURS: [string, string][] = [
  ['lun', 'Lundi'], ['mar', 'Mardi'], ['mer', 'Mercredi'], ['jeu', 'Jeudi'],
  ['ven', 'Vendredi'], ['sam', 'Samedi'], ['dim', 'Dimanche'],
];

const JOUR_CLES = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'] as const;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const medecin = await getMedecinById(id);
  if (!medecin) return { title: 'Médecin introuvable | Médecin Proche' };

  const nomComplet = nomAffiche(medecin.prenom, medecin.nom, medecin.specialite);
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
  const aurora     = avatarAurora(medecin.nom, medecin.specialite);
  const displayNom = nomAffiche(medecin.prenom, medecin.nom, medecin.specialite);
  const jourCourant = JOUR_CLES[new Date().getDay()];

  return (
    <div className="min-h-screen bg-sand-50">

      {/* ── HÉROS ENCRE — auroras spécialité + grain ── */}
      <div className="relative bg-ink-950 grain overflow-hidden">
        <div className="aurora w-72 h-72 -top-24 -right-20" style={{ background: aurora }} />
        <div className="aurora w-56 h-56 -bottom-20 -left-16" style={{ background: '#14A88B', opacity: 0.35 }} />

        <div className="max-w-2xl mx-auto px-4 pt-12 pb-9 relative z-10">

          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sand-50 text-sm font-bold bg-white/10 border border-white/20 backdrop-blur-sm px-3.5 py-2.5 rounded-full tap-scale"
            >
              <ChevronLeft size={15} />
              Retour
            </Link>
            <div className="flex items-center gap-2">
              <ShareButton
                title={`${displayNom} — ${medecin.specialite}`}
                text={`${medecin.specialite} à ${medecin.ville} (${medecin.territoire})`}
                url={`${BASE_URL}/medecin/${medecin.id}`}
              />
              <FavoriButton medecin={medecin} />
            </div>
          </div>

          {/* Identité — centré, hiérarchie éditoriale */}
          <div className="text-center">
            <div className={`w-24 h-24 rounded-[28px] bg-gradient-to-br ${gradient} border border-white/25 shadow-medallion flex items-center justify-center mx-auto mb-5`}>
              <span className="text-white text-3xl font-display font-semibold tracking-tight">{initiales}</span>
            </div>

            <p className="label-mono text-lagoon-300 mb-2">{medecin.specialite}</p>
            <h1 className="font-display font-semibold text-3xl text-sand-50 leading-tight text-balance">
              {displayNom}
            </h1>

            <div className="mt-4 flex justify-center">
              {medecin.accepte_nouveaux_patients ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-lagoon-400/20 border border-lagoon-400/40 text-lagoon-200 px-4 py-2 rounded-full">
                  <CheckCircle size={13} aria-hidden="true" />
                  Accepte de nouveaux patients
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 border border-white/20 text-sand-200 px-4 py-2 rounded-full">
                  <XCircle size={13} aria-hidden="true" />
                  Cabinet complet
                </span>
              )}
            </div>

            <PulseLine animated className="w-36 h-4 mx-auto mt-5 text-lagoon-400/70" />
          </div>

        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-3">

        {/* Informations */}
        <div className="bg-paper border border-sand-200 rounded-3xl shadow-card overflow-hidden">
          <p className="px-5 pt-4 pb-2 label-mono text-mist-500">
            Informations
          </p>

          <div className="divide-y divide-sand-100">
            <div className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-9 h-9 bg-lagoon-50 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-lagoon-700" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-mist-500 font-medium">Adresse</p>
                <p className="text-sm text-ink-900 font-semibold">{toTitleCase(medecin.adresse)}</p>
                <p className="text-sm text-mist-600">{toTitleCase(medecin.ville)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-9 h-9 bg-lagoon-50 rounded-xl flex items-center justify-center shrink-0">
                <Users size={15} className="text-lagoon-700" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-mist-500 font-medium">Secteur</p>
                <p className="text-sm text-ink-900 font-semibold">Secteur {medecin.secteur}</p>
              </div>
            </div>

            {medecin.langues && medecin.langues.length > 0 && (
              <div className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 bg-lagoon-50 rounded-xl flex items-center justify-center shrink-0">
                  <Globe size={15} className="text-lagoon-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-mist-500 font-medium">Langues parlées</p>
                  <p className="text-sm text-ink-900 font-semibold">{medecin.langues.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Horaires — toujours affiché, jour courant surligné */}
        <div className="bg-paper border border-sand-200 rounded-3xl shadow-card overflow-hidden">
          <p className="px-5 pt-4 pb-2 label-mono text-mist-500">
            Horaires
          </p>
          <div className="flex items-start gap-4 px-5 pb-4">
            <div className="w-9 h-9 bg-lagoon-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <Clock size={15} className="text-lagoon-700" aria-hidden="true" />
            </div>
            {medecin.horaires && typeof medecin.horaires === 'object' ? (
              <div className="flex-1 space-y-0.5">
                {JOURS.map(([key, label]) => {
                  const isToday = key === jourCourant;
                  const ouvert  = Boolean(medecin.horaires?.[key]);
                  return (
                    <div
                      key={key}
                      className={`flex items-baseline justify-between gap-3 rounded-lg px-2 py-1 -mx-2 ${isToday ? 'bg-lagoon-50' : ''}`}
                    >
                      <span className={`text-sm ${
                        isToday ? 'text-lagoon-700 font-bold' : ouvert ? 'text-ink-800 font-medium' : 'text-sand-300'
                      }`}>
                        {label}
                        {isToday && <span className="label-mono text-lagoon-600 ml-2">Aujourd&apos;hui</span>}
                      </span>
                      <span className={`text-sm text-right tnum ${
                        isToday ? 'text-lagoon-700 font-bold' : ouvert ? 'text-ink-900 font-semibold' : 'text-sand-300'
                      }`}>
                        {medecin.horaires?.[key] ?? 'Fermé'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-mist-500 italic">Horaires non renseignés — contactez le cabinet</p>
            )}
          </div>
        </div>

        {/* RDV en ligne */}
        <div className="bg-mango-50 border border-mango-100 rounded-3xl overflow-hidden">
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="w-9 h-9 bg-mango-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <CalendarX size={15} className="text-mango-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-mango-600 font-bold">Pas de prise de RDV en ligne</p>
              <p className="text-xs text-mist-600 mt-0.5 leading-relaxed">Contactez directement le cabinet par téléphone pour réserver une consultation.</p>
            </div>
          </div>
        </div>

        {/* Signaler une erreur — un faux numéro détruit la confiance */}
        <a
          href={`mailto:davedorelus025@gmail.com?subject=${encodeURIComponent(`[Médecin Proche] Erreur fiche — ${displayNom} (${medecin.ville})`)}&body=${encodeURIComponent(`Fiche : ${BASE_URL}/medecin/${medecin.id}\nPraticien : ${displayNom} — ${medecin.specialite}\n\nQuelle information est incorrecte ? (téléphone, adresse, horaires, autre)\n\n`)}`}
          className="flex items-center justify-center gap-2 w-full py-3 text-xs font-semibold text-mist-500 hover:text-ink-800 transition-colors"
        >
          <Flag size={13} aria-hidden="true" />
          Signaler une erreur sur cette fiche
        </a>

      </div>

      {/* ── CTA FIXE EN BAS — capsule verre encré ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-3 z-50"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <div className="max-w-2xl mx-auto glass-ink rounded-[26px] shadow-float p-2 flex items-stretch gap-2">
          {medecin.telephone ? (
            <a
              href={`tel:${medecin.telephone}`}
              className={`btn-appeler flex items-center justify-center gap-2.5 flex-1 bg-gradient-to-r ${gradient} text-white py-3.5 rounded-[20px] font-bold text-base tap-scale`}
            >
              <Phone size={19} aria-hidden="true" />
              <span className="truncate">Appeler — <span className="tnum">{formatTel(medecin.telephone)}</span></span>
            </a>
          ) : (
            <div className="flex items-center justify-center gap-2.5 flex-1 bg-white/10 text-sand-200/70 py-3.5 rounded-[20px] font-semibold text-sm">
              <PhoneOff size={17} aria-hidden="true" />
              Numéro non disponible
            </div>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${medecin.lat},${medecin.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Itinéraire vers le cabinet"
            className="flex flex-col items-center justify-center gap-0.5 px-4 bg-white/10 border border-white/20 text-sand-50 rounded-[20px] font-bold text-xs tap-scale shrink-0"
          >
            <Navigation size={18} aria-hidden="true" />
            Y aller
          </a>
        </div>
      </div>

      <div className="h-32" />

    </div>
  );
}
