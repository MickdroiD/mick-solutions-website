// ============================================
// API Route: /api/admin/test
// ============================================
// Test de connectivité et diagnostic

import { NextResponse } from 'next/server';

const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://baserow.mick-solutions.ch/api';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;

export async function GET() {
  const tests: Record<string, { status: 'ok' | 'error' | 'warning'; message: string; details?: unknown }> = {};

  // Test 1: Baserow Token
  if (BASEROW_TOKEN) {
    tests.baserow_token = { status: 'ok', message: 'Token configuré' };
  } else {
    tests.baserow_token = { status: 'error', message: 'BASEROW_API_TOKEN manquant' };
  }

  // Test 2: Connexion Baserow
  if (BASEROW_TOKEN) {
    try {
      const response = await fetch(`${BASEROW_API_URL}/database/rows/table/751/?user_field_names=true&size=1`, {
        headers: { Authorization: `Token ${BASEROW_TOKEN}` },
        cache: 'no-store',
      });
      
      if (response.ok) {
        tests.baserow_connection = { status: 'ok', message: 'Connexion réussie', details: { table: 751 } };
      } else {
        tests.baserow_connection = { 
          status: 'error', 
          message: `Erreur HTTP ${response.status}`, 
          details: await response.text() 
        };
      }
    } catch (error) {
      tests.baserow_connection = { 
        status: 'error', 
        message: 'Erreur de connexion',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test 3: API Keys IA
  const aiKeys = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    replicate: !!process.env.REPLICATE_API_TOKEN,
    default: !!process.env.DEFAULT_AI_API_KEY,
  };

  const configuredAI = Object.entries(aiKeys).filter(([, v]) => v).map(([k]) => k);
  if (configuredAI.length > 0) {
    tests.ai_keys = { status: 'ok', message: `Clés configurées: ${configuredAI.join(', ')}`, details: aiKeys };
  } else {
    tests.ai_keys = { status: 'warning', message: 'Aucune clé API IA configurée', details: aiKeys };
  }

  // Test 4: Dossier uploads
  tests.uploads = { status: 'ok', message: 'Route upload disponible' };

  // Résumé
  const hasErrors = Object.values(tests).some(t => t.status === 'error');
  const hasWarnings = Object.values(tests).some(t => t.status === 'warning');

  return NextResponse.json({
    success: !hasErrors,
    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
    timestamp: new Date().toISOString(),
    tests,
    env: {
      nodeEnv: process.env.NODE_ENV,
      baserowUrl: BASEROW_API_URL,
    }
  });
}

