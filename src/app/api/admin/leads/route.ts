// ============================================
// API Route: /api/admin/leads
// ============================================
// Admin API for lead management (CRM Lite)
// 🔐 SÉCURISÉ: Nécessite une session admin valide

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';

// ============================================
// CONFIGURATION (via lib/config.ts centralisé)
// ============================================

import { BASEROW_API_URL, BASEROW_TOKEN, TABLE_IDS } from '@/lib/config';
const LEADS_TABLE_ID = TABLE_IDS.LEADS;

// ============================================
// TYPES
// ============================================
// 🔧 FIX: Aligné avec structure Baserow réelle (Audit 29/12/2025)

interface BaserowLeadRow {
  id: number;
  order: string;
  Name: string;
  Email: string;
  Phone: string | null;
  Message: string | null;
  Status: { id: number; value: string; color: string } | null;
  Source: string | null;
  Created_At: string | null;
  // Champs supplémentaires présents en DB (optionnels)
  Nom: string | null;
  Notes: string | null;
  Actif: boolean;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  source: string | null;
  createdAt: string | null;
}

// ============================================
// GET HANDLER - List all leads
// ============================================

export async function GET() {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!BASEROW_TOKEN || !LEADS_TABLE_ID) {
    return NextResponse.json(
      { error: 'LEADS table not configured' },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${LEADS_TABLE_ID}/?user_field_names=true&size=200`,
      {
        headers: { Authorization: `Token ${BASEROW_TOKEN}` },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Baserow fetch error:', errorText);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const data = await response.json();
    const rows = data.results as BaserowLeadRow[];

    // Transform to cleaner format
    const leads: Lead[] = rows.map((row) => ({
      id: row.id,
      name: row.Name || '',
      email: row.Email || '',
      phone: row.Phone,
      message: row.Message,
      status: row.Status?.value || 'New',
      source: row.Source,
      createdAt: row.Created_At,
    }));

    return NextResponse.json({ leads, total: leads.length });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// PATCH HANDLER - Update lead status
// ============================================

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!BASEROW_TOKEN || !LEADS_TABLE_ID) {
    return NextResponse.json(
      { error: 'LEADS table not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { leadId, status } = body as { leadId: number; status: string };

    if (!leadId || !status) {
      return NextResponse.json(
        { error: 'leadId and status are required' },
        { status: 400 }
      );
    }

    // Valid statuses
    const validStatuses = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${LEADS_TABLE_ID}/${leadId}/?user_field_names=true`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Status: status }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Baserow update error:', errorText);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Lead status updated' });
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// DELETE HANDLER - Delete a lead
// ============================================

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!BASEROW_TOKEN || !LEADS_TABLE_ID) {
    return NextResponse.json(
      { error: 'LEADS table not configured' },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${LEADS_TABLE_ID}/${leadId}/`,
      {
        method: 'DELETE',
        headers: { Authorization: `Token ${BASEROW_TOKEN}` },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Baserow delete error:', errorText);
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    console.error('Lead delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

