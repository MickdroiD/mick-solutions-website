// ============================================
// Health Check Endpoint - Factory V2
// ============================================
// URL: /api/health
// Used by Docker healthcheck and monitoring

import { NextResponse } from 'next/server';
import { isFactoryV2Configured } from '@/lib/factory-client';
import { BASEROW_API_URL, BASEROW_TOKEN, TABLE_IDS } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  const GLOBAL_TABLE_ID = TABLE_IDS.CONFIG_GLOBAL;
  const SECTIONS_TABLE_ID = TABLE_IDS.SECTIONS;
  
  const status = {
    status: 'ok' as 'ok' | 'degraded' | 'error',
    timestamp: new Date().toISOString(),
    version: 'factory-v2',
    environment: process.env.NODE_ENV,
    responseTimeMs: 0,
    checks: {
      factoryConfigured: isFactoryV2Configured(),
      baserowToken: !!BASEROW_TOKEN,
      globalTableId: !!GLOBAL_TABLE_ID,
      sectionsTableId: !!SECTIONS_TABLE_ID,
      adminPassword: !!process.env.ADMIN_PASSWORD,
      baserowConnection: 'untested' as string,
    },
  };

  // Quick Baserow connection test
  if (BASEROW_TOKEN && GLOBAL_TABLE_ID) {
    try {
      const response = await fetch(
        `${BASEROW_API_URL}/database/rows/table/${GLOBAL_TABLE_ID}/?user_field_names=true&size=1`,
        {
          headers: {
            'Authorization': `Token ${BASEROW_TOKEN}`,
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000), // 5s timeout
        }
      );

      if (response.ok) {
        status.checks.baserowConnection = 'ok';
      } else {
        status.checks.baserowConnection = `http_${response.status}`;
        status.status = 'degraded';
      }
    } catch (error) {
      status.checks.baserowConnection = error instanceof Error ? error.message : 'error';
      status.status = 'degraded';
    }
  } else {
    status.checks.baserowConnection = 'skipped';
    if (!status.checks.factoryConfigured) {
      status.status = 'error';
    }
  }

  // Calculate response time
  status.responseTimeMs = Date.now() - startTime;

  // Determine HTTP status code
  const httpStatus = status.status === 'error' ? 503 : 200;

  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
