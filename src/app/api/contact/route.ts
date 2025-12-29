// ============================================
// API Route: /api/contact
// ============================================
// Public API for contact form submissions.
// - Saves lead to LEADS table in Baserow
// - Triggers n8n webhook if configured
// - Returns success/error response

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getGlobalConfig } from '@/lib/factory-client';

// ============================================
// CONFIGURATION
// ============================================

const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://baserow.mick-solutions.ch/api';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const LEADS_TABLE_ID = process.env.BASEROW_FACTORY_LEADS_ID;

// ============================================
// TYPES
// ============================================

interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string;
}

// ============================================
// POST HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as LeadPayload;

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get global config for webhook URL
    const config = await getGlobalConfig();
    const webhookUrl = config.contact?.n8nWebhookUrl;

    // Prepare lead data
    const leadData = {
      Name: body.name.trim(),
      Email: body.email.trim().toLowerCase(),
      Phone: body.phone?.trim() || null,
      Message: body.message?.trim() || '',
      Status: 'New',
      Source: body.source || 'Website Contact Form',
    };

    // ========== 1. SAVE TO BASEROW ==========
    let savedLeadId: number | null = null;

    if (BASEROW_TOKEN && LEADS_TABLE_ID) {
      try {
        const response = await fetch(
          `${BASEROW_API_URL}/database/rows/table/${LEADS_TABLE_ID}/?user_field_names=true`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Token ${BASEROW_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
          }
        );

        if (response.ok) {
          const result = await response.json();
          savedLeadId = result.id;
          console.log(`✅ Lead saved to Baserow with ID: ${savedLeadId}`);
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to save lead to Baserow:', errorText);
        }
      } catch (dbError) {
        console.error('❌ Baserow save error:', dbError);
      }
    } else {
      console.warn('⚠️ LEADS table not configured - skipping database save');
    }

    // ========== 2. TRIGGER WEBHOOK ==========
    if (webhookUrl) {
      try {
        const webhookPayload = {
          ...leadData,
          leadId: savedLeadId,
          timestamp: new Date().toISOString(),
          source: 'factory-v2-contact-api',
        };

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        if (webhookResponse.ok) {
          console.log('✅ Webhook triggered successfully');
        } else {
          console.error('⚠️ Webhook returned non-OK status:', webhookResponse.status);
        }
      } catch (webhookError) {
        console.error('❌ Webhook trigger error:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

    // ========== 3. RETURN SUCCESS ==========
    return NextResponse.json({
      success: true,
      message: 'Message received successfully',
      leadId: savedLeadId,
    });

  } catch (error) {
    console.error('❌ Contact API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// OPTIONS HANDLER (CORS)
// ============================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

