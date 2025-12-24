// ============================================
// API ADMIN CONFIG - White Label Factory 2025
// ============================================
// Endpoint pour lire et modifier la config depuis Baserow.

import { NextRequest, NextResponse } from 'next/server';

const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://baserow.mick-solutions.ch/api';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const GLOBAL_INFOS_TABLE_ID = process.env.BASEROW_GLOBAL_INFOS_TABLE_ID || '751';
const CONFIG_ROW_ID = 1; // ID de la ligne de config (première ligne de la table)

// Mapping Baserow -> Admin interface
const fieldMapping: Record<string, string> = {
  'Nom Site': 'nomSite',
  'Slogan': 'slogan',
  'Initiales Logo': 'initialesLogo',
  'Logo URL': 'logoUrl',
  'Couleur Primaire': 'couleurPrimaire',
  'Couleur Accent': 'couleurAccent',
  'Couleur Background': 'couleurBackground',
  'Couleur Text': 'couleurText',
  'Show_Navbar': 'showNavbar',
  'Show_Hero': 'showHero',
  'Show_Advantages': 'showAdvantages',
  'Show_Services': 'showServices',
  'Show_Portfolio': 'showPortfolio',
  'Show_Trust': 'showTrust',
  'Show_Contact': 'showContact',
  'Show_FAQ': 'showFaq',
  'Show_Gallery': 'showGallery',
  'Theme_Global': 'themeGlobal',
  'Navbar_Variant': 'navbarVariant',
  'Hero_Variant': 'heroVariant',
  'Footer_Variant': 'footerVariant',
  'Meta Titre': 'metaTitre',
  'Meta Description': 'metaDescription',
  'Mots Cles': 'motsCles',
  'Email': 'email',
  'Telephone': 'telephone',
  'Adresse': 'adresse',
  'Lien Linkedin': 'lienLinkedin',
  'Titre Hero': 'titreHero',
  'Sous-titre Hero': 'sousTitreHero',
  'Badge Hero': 'badgeHero',
  'CTA Principal': 'ctaPrincipal',
  'CTA Secondaire': 'ctaSecondaire',
};

// Reverse mapping pour l'update
const reverseFieldMapping: Record<string, string> = Object.fromEntries(
  Object.entries(fieldMapping).map(([k, v]) => [v, k])
);

/**
 * GET /api/admin/config
 * Récupère la configuration actuelle
 */
export async function GET() {
  try {
    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${GLOBAL_INFOS_TABLE_ID}/${CONFIG_ROW_ID}/`,
      {
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Baserow error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transformer les données Baserow en format admin
    const config: Record<string, unknown> = {};
    
    for (const [baserowField, adminField] of Object.entries(fieldMapping)) {
      const value = data[baserowField];
      
      // Gérer les différents types de valeurs
      if (typeof value === 'object' && value !== null && 'value' in value) {
        // Champ select single
        config[adminField] = value.value;
      } else if (value === true || value === false) {
        config[adminField] = value;
      } else {
        config[adminField] = value ?? '';
      }
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Admin config GET error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/config
 * Met à jour la configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transformer les données admin en format Baserow
    const baserowData: Record<string, unknown> = {};
    
    for (const [adminField, value] of Object.entries(body)) {
      const baserowField = reverseFieldMapping[adminField];
      if (baserowField) {
        baserowData[baserowField] = value;
      }
    }

    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${GLOBAL_INFOS_TABLE_ID}/${CONFIG_ROW_ID}/`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(baserowData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Baserow update error:', errorText);
      throw new Error(`Baserow error: ${response.status}`);
    }

    // Vérifier que la réponse est valide
    await response.json();
    
    return NextResponse.json({ 
      success: true,
      message: 'Configuration mise à jour',
    });
  } catch (error) {
    console.error('Admin config PUT error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}

