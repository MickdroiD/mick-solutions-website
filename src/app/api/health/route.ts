// Health check endpoint pour diagnostiquer la connexion Baserow
// URL: /api/health

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Pas de cache pour ce endpoint

export async function GET() {
  const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
  
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    baserow: {
      tokenConfigured: !!BASEROW_TOKEN,
      tokenLength: BASEROW_TOKEN?.length ?? 0,
      connection: 'untested' as string,
      data: null as unknown,
    },
  };

  // Test de connexion Baserow
  if (BASEROW_TOKEN) {
    try {
      const response = await fetch(
        'https://baserow.mick-solutions.ch/api/database/rows/table/751/?user_field_names=true&size=1',
        {
          headers: {
            'Authorization': `Token ${BASEROW_TOKEN}`,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        status.baserow.connection = 'success';
        status.baserow.data = {
          count: data.count,
          hasResults: data.results?.length > 0,
          firstRowFields: data.results?.[0] ? Object.keys(data.results[0]) : [],
        };
      } else {
        status.baserow.connection = `error: HTTP ${response.status}`;
      }
    } catch (error) {
      status.baserow.connection = `exception: ${error instanceof Error ? error.message : 'unknown'}`;
    }
  } else {
    status.baserow.connection = 'skipped: no token';
  }

  return NextResponse.json(status, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

