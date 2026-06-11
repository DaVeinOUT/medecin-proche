import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

// Icône SVG — « Édition Lagon » : encre océan, croix en filigrane,
// ligne de pouls lagon, point corail (aligné sur components/BrandMark.tsx)
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#103A32"/>
      <stop offset="1" stop-color="#071E1A"/>
    </linearGradient>
  </defs>

  <!-- Fond encre océan -->
  <rect width="512" height="512" rx="118" fill="url(#ink)"/>

  <!-- Croix médicale en filigrane -->
  <rect x="206" y="86" width="100" height="340" rx="40" fill="#2BC4A4" opacity="0.22"/>
  <rect x="86" y="206" width="340" height="100" rx="40" fill="#2BC4A4" opacity="0.22"/>

  <!-- Ligne de pouls lagon -->
  <path d="M76 256 H172 L210 172 L266 340 L304 256 H400"
        stroke="#6FE0C6" stroke-width="34"
        stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- Point corail — la localisation -->
  <circle cx="430" cy="256" r="30" fill="#FF7E66"/>
</svg>
`.trim();

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

for (const { size, name } of sizes) {
  await sharp(Buffer.from(svgIcon))
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, name));
  console.log(`✓ ${name} (${size}x${size})`);
}

console.log('\nIcônes générées dans /public/');
