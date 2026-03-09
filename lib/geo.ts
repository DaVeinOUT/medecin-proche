/**
 * Calcule la distance en km entre deux coordonnées GPS (formule Haversine).
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Positions de référence des DOM-TOM.
 */
export const POSITIONS_DOM = {
  martinique: [14.6415, -61.0242] as [number, number],
  guadeloupe: [16.265, -61.551] as [number, number],
  guyane: [4.9372, -52.3261] as [number, number],
  reunion: [-21.1151, 55.5364] as [number, number],
  mayotte: [-12.8275, 45.1662] as [number, number],
};
