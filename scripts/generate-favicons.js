#!/usr/bin/env node
/**
 * Script de génération de favicons PNG depuis icon.svg
 * Génère toutes les tailles nécessaires pour PWA et navigateurs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SVG_SOURCE = path.join(PUBLIC_DIR, 'icon.svg');

// Tailles à générer
const SIZES = [16, 32, 48, 96, 144, 192, 512];

// Vérifie si sharp est disponible, sinon utilise ImageMagick/rsvg
async function generateFavicons() {
  console.log('🎨 Génération des favicons depuis icon.svg...\n');

  // Vérifie que le SVG source existe
  if (!fs.existsSync(SVG_SOURCE)) {
    console.error('❌ Erreur: icon.svg non trouvé dans public/');
    process.exit(1);
  }

  // Essaye avec sharp d'abord
  try {
    const sharp = require('sharp');
    console.log('📦 Utilisation de sharp pour la conversion...\n');

    for (const size of SIZES) {
      const outputPath = path.join(PUBLIC_DIR, `favicon-${size}x${size}.png`);
      
      await sharp(SVG_SOURCE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`  ✅ favicon-${size}x${size}.png`);
    }

    // Générer apple-touch-icon.png (180x180)
    const appleTouchPath = path.join(PUBLIC_DIR, 'apple-touch-icon.png');
    await sharp(SVG_SOURCE)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(appleTouchPath);
    console.log(`  ✅ apple-touch-icon.png (180x180)`);

    // Générer favicon.ico (multi-tailles: 16, 32, 48)
    // Sharp ne supporte pas ICO, on crée un PNG 48x48 comme fallback
    console.log('\n⚠️  favicon.ico: Utilisez un convertisseur en ligne ou ImageMagick pour créer le .ico');
    console.log('   Commande ImageMagick: convert favicon-16x16.png favicon-32x32.png favicon-48x48.png favicon.ico');

    console.log('\n✨ Génération terminée avec succès!');

  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('📦 sharp non installé, tentative avec rsvg-convert/ImageMagick...\n');
      
      // Fallback: utiliser rsvg-convert ou ImageMagick
      try {
        for (const size of SIZES) {
          const outputPath = path.join(PUBLIC_DIR, `favicon-${size}x${size}.png`);
          
          // Essaye rsvg-convert d'abord (plus précis pour SVG)
          try {
            execSync(`rsvg-convert -w ${size} -h ${size} "${SVG_SOURCE}" -o "${outputPath}"`, { stdio: 'pipe' });
          } catch {
            // Fallback sur ImageMagick
            execSync(`convert -background none -resize ${size}x${size} "${SVG_SOURCE}" "${outputPath}"`, { stdio: 'pipe' });
          }
          
          console.log(`  ✅ favicon-${size}x${size}.png`);
        }

        // apple-touch-icon
        const appleTouchPath = path.join(PUBLIC_DIR, 'apple-touch-icon.png');
        try {
          execSync(`rsvg-convert -w 180 -h 180 "${SVG_SOURCE}" -o "${appleTouchPath}"`, { stdio: 'pipe' });
        } catch {
          execSync(`convert -background none -resize 180x180 "${SVG_SOURCE}" "${appleTouchPath}"`, { stdio: 'pipe' });
        }
        console.log(`  ✅ apple-touch-icon.png (180x180)`);

        // favicon.ico avec ImageMagick
        try {
          const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
          execSync(`convert "${path.join(PUBLIC_DIR, 'favicon-16x16.png')}" "${path.join(PUBLIC_DIR, 'favicon-32x32.png')}" "${path.join(PUBLIC_DIR, 'favicon-48x48.png')}" "${icoPath}"`, { stdio: 'pipe' });
          console.log(`  ✅ favicon.ico (multi-résolution)`);
        } catch {
          console.log('  ⚠️  favicon.ico: ImageMagick non disponible pour créer le .ico');
        }

        console.log('\n✨ Génération terminée avec succès!');

      } catch (cmdErr) {
        console.error('\n❌ Erreur: Ni sharp, ni rsvg-convert, ni ImageMagick ne sont disponibles.');
        console.error('   Installez sharp: npm install sharp');
        console.error('   Ou installez librsvg: sudo apt install librsvg2-bin');
        console.error('   Ou installez ImageMagick: sudo apt install imagemagick');
        process.exit(1);
      }
    } else {
      console.error('❌ Erreur lors de la génération:', err.message);
      process.exit(1);
    }
  }
}

generateFavicons();

