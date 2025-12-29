#!/usr/bin/env npx tsx
// ============================================
// FIX LEADS TABLE SCRIPT
// ============================================
// Script pour diagnostiquer et corriger la connexion à la table LEADS
// 
// Usage: npx tsx scripts/fix-leads-table.ts
// ============================================

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Configuration
const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://baserow.mick-solutions.ch/api';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const FACTORY_DATABASE_ID = process.env.BASEROW_FACTORY_DATABASE_ID;
const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

interface BaserowTable {
  id: number;
  name: string;
  order: number;
  database_id: number;
}

interface BaserowField {
  id: number;
  name: string;
  type: string;
  order: number;
  primary?: boolean;
}

// ============================================
// HELPERS
// ============================================

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

async function fetchBaserow<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASEROW_API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Token ${BASEROW_TOKEN}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Baserow API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// ============================================
// MAIN FUNCTIONS
// ============================================

async function listDatabaseTables(): Promise<BaserowTable[]> {
  log('🔍', 'Récupération des tables de la base Factory...');
  
  if (!FACTORY_DATABASE_ID) {
    throw new Error('BASEROW_FACTORY_DATABASE_ID non défini dans .env.local');
  }

  const response = await fetchBaserow<{ tables: BaserowTable[] }>(
    `/database/tables/database/${FACTORY_DATABASE_ID}/`
  );
  
  return response.tables || response as unknown as BaserowTable[];
}

async function findLeadsTable(tables: BaserowTable[]): Promise<BaserowTable | null> {
  log('🔎', 'Recherche de la table LEADS...');
  
  // Chercher une table nommée "LEADS" (case insensitive)
  const leadsTable = tables.find(t => 
    t.name.toUpperCase() === 'LEADS' || 
    t.name.toLowerCase() === 'leads'
  );
  
  return leadsTable || null;
}

async function createLeadsTable(): Promise<BaserowTable> {
  log('🏗️', 'Création de la table LEADS...');
  
  if (!FACTORY_DATABASE_ID) {
    throw new Error('BASEROW_FACTORY_DATABASE_ID non défini');
  }

  // Créer la table
  const newTable = await fetchBaserow<BaserowTable>(
    `/database/tables/database/${FACTORY_DATABASE_ID}/`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: 'LEADS',
      }),
    }
  );

  log('✅', `Table LEADS créée avec ID: ${newTable.id}`);

  // Ajouter les champs requis
  const fields = [
    { name: 'Name', type: 'text' },
    { name: 'Email', type: 'email' },
    { name: 'Phone', type: 'phone_number' },
    { name: 'Message', type: 'long_text' },
    { name: 'Status', type: 'single_select', select_options: [
      { value: 'New', color: 'blue' },
      { value: 'Contacted', color: 'yellow' },
      { value: 'Qualified', color: 'green' },
      { value: 'Closed', color: 'purple' },
      { value: 'Lost', color: 'red' },
    ]},
    { name: 'Source', type: 'text' },
    { name: 'Created_At', type: 'created_on' },
  ];

  log('📝', 'Ajout des champs à la table LEADS...');

  for (const field of fields) {
    try {
      await fetchBaserow<BaserowField>(
        `/database/fields/table/${newTable.id}/`,
        {
          method: 'POST',
          body: JSON.stringify(field),
        }
      );
      log('  ✓', `Champ "${field.name}" ajouté`);
    } catch (error) {
      log('  ⚠️', `Erreur pour "${field.name}": ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  return newTable;
}

function updateEnvFile(leadsTableId: number): void {
  log('📄', 'Mise à jour de .env.local...');

  let envContent = '';
  
  // Lire le fichier existant si présent
  if (fs.existsSync(ENV_FILE_PATH)) {
    envContent = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
  }

  // Vérifier si la variable existe déjà
  const envLines = envContent.split('\n');
  let found = false;
  
  const updatedLines = envLines.map(line => {
    if (line.startsWith('BASEROW_FACTORY_LEADS_ID=')) {
      found = true;
      return `BASEROW_FACTORY_LEADS_ID=${leadsTableId}`;
    }
    return line;
  });

  // Ajouter si pas trouvé
  if (!found) {
    updatedLines.push(`BASEROW_FACTORY_LEADS_ID=${leadsTableId}`);
  }

  // Écrire le fichier
  fs.writeFileSync(ENV_FILE_PATH, updatedLines.join('\n'));
  
  log('✅', `.env.local mis à jour avec BASEROW_FACTORY_LEADS_ID=${leadsTableId}`);
}

async function checkCurrentEnv(): Promise<void> {
  log('🔧', 'Vérification de la configuration actuelle...');
  
  console.log('');
  console.log('  BASEROW_API_URL:', BASEROW_API_URL);
  console.log('  BASEROW_API_TOKEN:', BASEROW_TOKEN ? '✓ Défini' : '✗ Manquant');
  console.log('  BASEROW_FACTORY_DATABASE_ID:', FACTORY_DATABASE_ID || '✗ Manquant');
  console.log('  BASEROW_FACTORY_LEADS_ID:', process.env.BASEROW_FACTORY_LEADS_ID || '✗ Manquant');
  console.log('');
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║       🔧 FIX LEADS TABLE - Factory V2              ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Étape 1: Vérifier la config actuelle
    await checkCurrentEnv();

    // Vérifier les prérequis
    if (!BASEROW_TOKEN) {
      log('❌', 'BASEROW_API_TOKEN manquant. Ajoutez-le dans .env.local');
      process.exit(1);
    }

    if (!FACTORY_DATABASE_ID) {
      log('❌', 'BASEROW_FACTORY_DATABASE_ID manquant. Ajoutez-le dans .env.local');
      process.exit(1);
    }

    // Étape 2: Lister les tables
    const tables = await listDatabaseTables();
    log('📊', `${tables.length} table(s) trouvée(s) dans la base Factory:`);
    tables.forEach(t => {
      console.log(`      - [${t.id}] ${t.name}`);
    });
    console.log('');

    // Étape 3: Chercher la table LEADS
    let leadsTable = await findLeadsTable(tables);

    if (leadsTable) {
      log('✅', `Table LEADS trouvée avec ID: ${leadsTable.id}`);
    } else {
      log('⚠️', 'Table LEADS non trouvée. Création en cours...');
      leadsTable = await createLeadsTable();
    }

    // Étape 4: Mettre à jour .env.local
    const currentLeadsId = process.env.BASEROW_FACTORY_LEADS_ID;
    
    if (currentLeadsId && parseInt(currentLeadsId) === leadsTable.id) {
      log('✅', 'BASEROW_FACTORY_LEADS_ID déjà correctement configuré');
    } else {
      updateEnvFile(leadsTable.id);
    }

    // Résumé final
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║                    ✅ TERMINÉ                        ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  📋 Table LEADS ID: ${leadsTable.id}`);
    console.log(`  📄 Fichier .env.local mis à jour`);
    console.log('');
    console.log('  ⚠️  N\'oubliez pas de redémarrer le serveur Next.js !');
    console.log('');

  } catch (error) {
    console.log('');
    log('❌', `Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.log('');
    process.exit(1);
  }
}

main();

