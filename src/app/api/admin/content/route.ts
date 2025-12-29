// ============================================
// API Route: /api/admin/content
// ============================================
// Gestion des contenus dynamiques
// 🔐 SÉCURISÉ: Nécessite une session admin valide

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';

const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://baserow.mick-solutions.ch/api';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN || '';

interface ContentFieldConfig {
  key: string;
  baserowKey: string;
  type: 'text' | 'textarea' | 'richtext' | 'number' | 'boolean' | 'image' | 'url' | 'date' | 'select';
  label: string;
  required?: boolean;
  options?: string[];
  isLayout?: boolean; // Indique si c'est un champ de layout
}

// Champs communs de layout (à ajouter dans Baserow si nécessaire)
const LAYOUT_FIELDS: ContentFieldConfig[] = [
  { key: 'gridWidth', baserowKey: 'Grid_Width', type: 'select', label: 'Largeur (colonnes)', options: ['1', '2', '3', '4'] },
  { key: 'gridHeight', baserowKey: 'Grid_Height', type: 'select', label: 'Hauteur (lignes)', options: ['1', '2'] },
  { key: 'layoutType', baserowKey: 'Layout_Type', type: 'select', label: 'Type de layout', options: ['quarter', 'half-h', 'half-v', 'full'] },
];

// Mapping des types de contenu vers leurs tables Baserow
const CONTENT_TABLES: Record<string, { tableId: number; fields: ContentFieldConfig[]; supportsLayout?: boolean }> = {
  testimonials: {
    tableId: 750,
    fields: [
      { key: 'clientName', baserowKey: 'Nom du client', type: 'text', label: 'Nom du client', required: true },
      { key: 'position', baserowKey: 'Poste / Entreprise', type: 'text', label: 'Poste / Entreprise' },
      { key: 'message', baserowKey: 'Message', type: 'textarea', label: 'Témoignage', required: true },
      { key: 'rating', baserowKey: 'Note', type: 'number', label: 'Note (1-5)' },
      { key: 'photo', baserowKey: 'Photo', type: 'image', label: 'Photo' },
      { key: 'visible', baserowKey: 'Afficher', type: 'boolean', label: 'Visible sur le site' },
    ],
    supportsLayout: true,
  },
  faq: {
    tableId: 752,
    fields: [
      { key: 'question', baserowKey: 'Question', type: 'text', label: 'Question', required: true },
      { key: 'answer', baserowKey: 'Reponse', type: 'textarea', label: 'Réponse', required: true },
      { key: 'order', baserowKey: 'Ordre', type: 'number', label: 'Ordre d\'affichage' },
    ],
    supportsLayout: false, // FAQ généralement en accordéon
  },
  services: {
    tableId: 748,
    fields: [
      { key: 'title', baserowKey: 'Titre', type: 'text', label: 'Titre du service', required: true },
      { key: 'description', baserowKey: 'Description', type: 'textarea', label: 'Description' },
      { key: 'icon', baserowKey: 'Icone', type: 'text', label: 'Icône (emoji ou classe)' },
      { key: 'keyPoints', baserowKey: 'Points Clés', type: 'textarea', label: 'Points clés (un par ligne)' },
      { key: 'price', baserowKey: 'Tarif (indicatif):', type: 'text', label: 'Tarif indicatif' },
      { key: 'order', baserowKey: 'Ordre', type: 'number', label: 'Ordre d\'affichage' },
    ],
    supportsLayout: true,
  },
  projects: {
    tableId: 749,
    fields: [
      { key: 'name', baserowKey: 'Nom', type: 'text', label: 'Nom du projet', required: true },
      { key: 'description', baserowKey: 'Description courte', type: 'textarea', label: 'Description courte' },
      { key: 'slug', baserowKey: 'Slug', type: 'text', label: 'Slug URL' },
      { key: 'link', baserowKey: 'Lien du site', type: 'url', label: 'Lien du site' },
      { key: 'coverImage', baserowKey: 'Image de couverture', type: 'image', label: 'Image de couverture' },
      { key: 'order', baserowKey: 'Ordre', type: 'number', label: 'Ordre d\'affichage' },
    ],
    supportsLayout: true,
  },
  gallery: {
    tableId: 781,
    fields: [
      { key: 'title', baserowKey: 'Titre', type: 'text', label: 'Titre de l\'image' },
      { key: 'image', baserowKey: 'Image', type: 'image', label: 'Image', required: true },
      { key: 'order', baserowKey: 'Ordre', type: 'number', label: 'Ordre d\'affichage' },
      { key: 'displayType', baserowKey: 'Type Affichage', type: 'select', label: 'Type d\'affichage', options: ['Slider', 'Grille', 'Zoom'] },
    ],
    supportsLayout: true,
  },
  advantages: {
    tableId: 757,
    fields: [
      { key: 'title', baserowKey: 'Titre', type: 'text', label: 'Titre', required: true },
      { key: 'description', baserowKey: 'Description', type: 'textarea', label: 'Description' },
      { key: 'icon', baserowKey: 'Icone', type: 'text', label: 'Icône' },
      { key: 'badge', baserowKey: 'Badge', type: 'text', label: 'Badge' },
      { key: 'order', baserowKey: 'Ordre', type: 'number', label: 'Ordre' },
      { key: 'active', baserowKey: 'Is_Active', type: 'boolean', label: 'Actif' },
    ],
    supportsLayout: true,
  },
  trustPoints: {
    tableId: 758,
    fields: [
      { key: 'title', baserowKey: 'Titre', type: 'text', label: 'Titre', required: true },
      { key: 'description', baserowKey: 'Description', type: 'textarea', label: 'Description' },
      { key: 'icon', baserowKey: 'Icone', type: 'text', label: 'Icône' },
      { key: 'badge', baserowKey: 'Badge', type: 'text', label: 'Badge' },
      { key: 'order', baserowKey: 'Ordre', type: 'number', label: 'Ordre' },
      { key: 'active', baserowKey: 'Is_Active', type: 'boolean', label: 'Actif' },
    ],
    supportsLayout: true,
  },
  legalDocs: {
    tableId: 753,
    fields: [
      { key: 'title', baserowKey: 'Titre', type: 'text', label: 'Titre', required: true },
      { key: 'slug', baserowKey: 'Slug', type: 'text', label: 'Slug URL', required: true },
      { key: 'content', baserowKey: 'Contenu', type: 'richtext', label: 'Contenu' },
      { key: 'lastUpdate', baserowKey: 'Date_Mise_a_jour', type: 'date', label: 'Dernière mise à jour' },
      { key: 'active', baserowKey: 'Is_Active', type: 'boolean', label: 'Actif' },
    ],
    supportsLayout: false,
  },
};

// GET - Liste les contenus d'un type
export async function GET(request: NextRequest) {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type');

    if (!contentType || !CONTENT_TABLES[contentType]) {
      return NextResponse.json(
        { error: 'Type de contenu invalide', validTypes: Object.keys(CONTENT_TABLES) },
        { status: 400 }
      );
    }

    const tableConfig = CONTENT_TABLES[contentType];
    
    // Ajouter les champs de layout si supportés
    const allFields = tableConfig.supportsLayout 
      ? [...tableConfig.fields, ...LAYOUT_FIELDS]
      : tableConfig.fields;

    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${tableConfig.tableId}/?user_field_names=true&size=200`,
      {
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Baserow error:', errorText);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des données' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Log pour debug
    console.log(`[Content API] Fetching ${contentType}, found ${data.results?.length || 0} rows`);
    
    const items = data.results.map((row: Record<string, unknown>) => {
      // Conserver les données brutes de Baserow pour le debug
      const item: Record<string, unknown> = { 
        id: row.id,
        order: row.order,
        // Champs bruts pour Portfolio
        Nom: row['Nom'],
        'Description courte': row['Description courte'],
        'Image de couverture': row['Image de couverture'],
        Statut: row['Statut'],
        // Champs bruts pour Gallery
        Titre: row['Titre'],
        Image: row['Image'],
      };
      
      for (const field of allFields) {
        const rawValue = row[field.baserowKey];
        
        if (field.type === 'image' && Array.isArray(rawValue) && rawValue.length > 0) {
          // Garder l'objet complet pour accès aux thumbnails
          const imageData = rawValue[0] as { url?: string; thumbnails?: { small?: { url: string } } };
          item[field.key] = imageData?.url || null;
          item[`${field.key}_thumbnails`] = imageData?.thumbnails || null;
          item[`${field.key}_full`] = rawValue; // Données complètes de l'image
        } else if (field.type === 'boolean') {
          item[field.key] = rawValue === true;
        } else if (field.type === 'number') {
          item[field.key] = rawValue ? Number(rawValue) : null;
        } else if (field.type === 'select' && typeof rawValue === 'object' && rawValue !== null) {
          // Gérer les single select Baserow - garder la valeur et l'objet complet
          const selectValue = rawValue as { id?: number; value?: string; color?: string };
          item[field.key] = selectValue?.value || null;
          item[`${field.key}_raw`] = selectValue; // Objet complet pour debug
        } else {
          item[field.key] = rawValue ?? null;
        }
      }
      
      // Log du premier item pour debug
      if (data.results.indexOf(row) === 0) {
        console.log(`[Content API] First ${contentType} item:`, JSON.stringify(item, null, 2));
      }
      
      return item;
    });

    return NextResponse.json({
      type: contentType,
      fields: allFields,
      items,
      count: items.length,
      supportsLayout: tableConfig.supportsLayout || false,
    });
  } catch (error) {
    console.error('Content GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau contenu
export async function POST(request: NextRequest) {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { type: contentType, data } = body;

    if (!contentType || !CONTENT_TABLES[contentType]) {
      return NextResponse.json({ error: 'Type de contenu invalide' }, { status: 400 });
    }

    const tableConfig = CONTENT_TABLES[contentType];
    const baserowData: Record<string, unknown> = {};
    
    for (const field of tableConfig.fields) {
      if (data[field.key] !== undefined) {
        if (field.type === 'image') {
          // Pour les images uploadées via Baserow, on utilise le nom du fichier
          const baserowImageName = data.baserowImageName;
          if (baserowImageName && typeof baserowImageName === 'string') {
            // Format attendu par Baserow pour un champ File
            baserowData[field.baserowKey] = [{ name: baserowImageName }];
          }
          // Note: les URLs externes ne peuvent pas être stockées dans un champ File Baserow
          continue;
        }
        if (field.type === 'number') {
          baserowData[field.baserowKey] = data[field.key] ? String(data[field.key]) : null;
        } else {
          baserowData[field.baserowKey] = data[field.key];
        }
      }
    }

    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${tableConfig.tableId}/?user_field_names=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(baserowData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Baserow create error:', errorText);
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: response.status });
    }

    const newRow = await response.json();

    return NextResponse.json({
      success: true,
      id: newRow.id,
      message: 'Contenu créé avec succès',
    });
  } catch (error) {
    console.error('Content POST error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour un contenu
export async function PUT(request: NextRequest) {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { type: contentType, id, data } = body;

    if (!contentType || !CONTENT_TABLES[contentType]) {
      return NextResponse.json({ error: 'Type de contenu invalide' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const tableConfig = CONTENT_TABLES[contentType];
    const baserowData: Record<string, unknown> = {};
    
    for (const field of tableConfig.fields) {
      if (data[field.key] !== undefined) {
        if (field.type === 'image') {
          // Pour les images uploadées via Baserow, on utilise le nom du fichier
          const baserowImageName = data.baserowImageName;
          if (baserowImageName && typeof baserowImageName === 'string') {
            // Format attendu par Baserow pour un champ File
            baserowData[field.baserowKey] = [{ name: baserowImageName }];
          } else if (data[field.key] === '' || data[field.key] === null) {
            // Permettre de supprimer l'image
            baserowData[field.baserowKey] = [];
          }
          continue;
        }
        if (field.type === 'number') {
          baserowData[field.baserowKey] = data[field.key] ? String(data[field.key]) : null;
        } else {
          baserowData[field.baserowKey] = data[field.key];
        }
      }
    }

    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${tableConfig.tableId}/${id}/?user_field_names=true`,
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
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Contenu mis à jour' });
  } catch (error) {
    console.error('Content PUT error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH - Mise à jour partielle d'un contenu (alias de PUT)
export async function PATCH(request: NextRequest) {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { type: contentType, id, data } = body;

    if (!contentType || !CONTENT_TABLES[contentType]) {
      return NextResponse.json({ error: 'Type de contenu invalide' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const tableConfig = CONTENT_TABLES[contentType];
    const baserowData: Record<string, unknown> = {};
    
    // Pour PATCH, on accepte les champs directement depuis data (format Baserow)
    // Cela permet une mise à jour plus flexible
    for (const field of tableConfig.fields) {
      const value = data[field.key] ?? data[field.baserowKey];
      if (value !== undefined) {
        if (field.type === 'image') {
          continue; // Les images sont gérées séparément
        }
        if (field.type === 'number') {
          baserowData[field.baserowKey] = value ? String(value) : null;
        } else {
          baserowData[field.baserowKey] = value;
        }
      }
    }

    console.log(`[Content PATCH] Updating ${contentType} #${id}:`, baserowData);

    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${tableConfig.tableId}/${id}/?user_field_names=true`,
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
      console.error('Baserow PATCH error:', errorText);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: response.status });
    }

    const updatedRow = await response.json();
    console.log(`[Content PATCH] Success for ${contentType} #${id}`);

    return NextResponse.json({ success: true, message: 'Contenu mis à jour', data: updatedRow });
  } catch (error) {
    console.error('Content PATCH error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un contenu
export async function DELETE(request: NextRequest) {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type');
    const id = searchParams.get('id');

    if (!contentType || !CONTENT_TABLES[contentType]) {
      return NextResponse.json({ error: 'Type de contenu invalide' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const tableConfig = CONTENT_TABLES[contentType];

    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${tableConfig.tableId}/${id}/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
        },
      }
    );

    if (!response.ok && response.status !== 204) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Contenu supprimé' });
  } catch (error) {
    console.error('Content DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

