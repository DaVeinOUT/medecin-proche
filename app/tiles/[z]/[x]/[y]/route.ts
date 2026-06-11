import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy de tuiles CARTO Voyager via l'origine de l'app.
 *
 * Pourquoi : les CDN de tuiles (OSM, CARTO) sont throttlés ou inaccessibles
 * sur certains réseaux mobiles/IPv6 défaillants — fréquent dans les DOM-TOM.
 * Le navigateur ne parle qu'à notre domaine ; le serveur (Vercel) récupère
 * la tuile et la met en cache edge (s-maxage 30 j).
 *
 * URL : /tiles/{z}/{x}/{y}.png ou /tiles/{z}/{x}/{y}@2x.png (retina)
 */

const SUBDOMAINS = ['a', 'b', 'c', 'd'];
const MAX_ZOOM = 20;

const Y_PATTERN = /^(\d+)(@2x)?\.png$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ z: string; x: string; y: string }> },
) {
  const { z, x, y } = await params;

  const zNum = Number(z);
  const xNum = Number(x);
  const yMatch = y.match(Y_PATTERN);

  if (
    !Number.isInteger(zNum) || zNum < 0 || zNum > MAX_ZOOM ||
    !Number.isInteger(xNum) || xNum < 0 ||
    !yMatch
  ) {
    return new NextResponse('Bad tile coordinates', { status: 400 });
  }

  const yNum = Number(yMatch[1]);
  const retina = yMatch[2] ?? '';
  const sub = SUBDOMAINS[(xNum + yNum) % SUBDOMAINS.length];
  const upstream = `https://${sub}.basemaps.cartocdn.com/rastertiles/voyager/${zNum}/${xNum}/${yNum}${retina}.png`;

  try {
    const res = await fetch(upstream, {
      headers: { 'User-Agent': 'medecin-proche.app tile proxy' },
      // Cache data Next : une tuile est immuable à l'échelle d'une semaine
      next: { revalidate: 604800 },
    });

    if (!res.ok) {
      return new NextResponse('Tile unavailable', { status: res.status });
    }

    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        // Navigateur 7 j, edge CDN 30 j — les fonds de carte bougent rarement
        'Cache-Control': 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new NextResponse('Tile fetch failed', { status: 502 });
  }
}
