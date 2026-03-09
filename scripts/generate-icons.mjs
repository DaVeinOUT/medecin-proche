import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

// Icône SVG — croix médicale bleue sur fond blanc arrondi
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Fond blanc -->
  <rect width="512" height="512" fill="#ffffff"/>

  <!-- Cercle bleu principal -->
  <circle cx="256" cy="256" r="220" fill="#1A6FE8"/>

  <!-- Croix médicale blanche -->
  <rect x="186" y="116" width="140" height="280" rx="24" fill="white"/>
  <rect x="116" y="186" width="280" height="140" rx="24" fill="white"/>
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
