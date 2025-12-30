#!/usr/bin/env node
/**
 * Génère les icônes PWA pour l'application Admin V2
 * Utilise Canvas pour créer des icônes PNG avec le logo MS
 */

const fs = require('fs');
const path = require('path');

// Tailles d'icônes requises pour PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Couleurs du thème
const PRIMARY_COLOR = '#2563EB';
const BACKGROUND_COLOR = '#0f172a';

// Créer une icône SVG simple (sera convertie en PNG via le navigateur)
function createIconSVG(size) {
  const fontSize = Math.round(size * 0.4);
  const borderRadius = Math.round(size * 0.15);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${PRIMARY_COLOR};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0EA5E9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${borderRadius}" fill="${BACKGROUND_COLOR}"/>
  <rect x="${size * 0.08}" y="${size * 0.08}" width="${size * 0.84}" height="${size * 0.84}" rx="${borderRadius * 0.7}" fill="url(#grad)" opacity="0.2"/>
  <text x="50%" y="55%" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="bold" fill="url(#grad)" text-anchor="middle" dominant-baseline="middle">MS</text>
</svg>`;
}

// Dossier de sortie
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Générer les icônes SVG (qui seront converties en PNG)
console.log('🎨 Génération des icônes PWA...');

sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`  ✅ ${filename}`);
});

// Créer aussi un favicon.svg
const faviconSVG = createIconSVG(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconSVG);
console.log('  ✅ favicon.svg');

// Créer le fichier apple-touch-icon
const appleTouchSVG = createIconSVG(180);
fs.writeFileSync(path.join(outputDir, 'apple-touch-icon.svg'), appleTouchSVG);
console.log('  ✅ apple-touch-icon.svg');

console.log('\\n✨ Icônes PWA générées avec succès!');
console.log('\\n📱 Note: Les navigateurs modernes acceptent les SVG pour les PWA.');
console.log('   Pour une compatibilité maximale, convertissez-les en PNG avec:');
console.log('   npx sharp-cli icons/*.svg --output icons/ --format png');

