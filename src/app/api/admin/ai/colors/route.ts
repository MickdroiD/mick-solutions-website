// ============================================
// API Route: /api/admin/ai/colors
// ============================================
// Magic Color Palette Generator using AI
// 🔐 SÉCURISÉ: Nécessite une session admin valide
//
// POST: { prompt: "Organic Bakery" }
// Returns: { primary, accent, background, text }

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { getGlobalConfig } from '@/lib/factory-client';

// ============================================
// TYPES
// ============================================

interface ColorPalette {
  primary: string;
  accent: string;
  background: string;
  text: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// ============================================
// POST HANDLER
// ============================================

export async function POST(request: NextRequest) {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt } = body as { prompt: string };

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Un prompt descriptif est requis (min 3 caractères)' },
        { status: 400 }
      );
    }

    // Priority: 1. Environment variable, 2. Baserow config, 3. Fallback
    let aiApiKey = process.env.OPENAI_API_KEY;
    
    // If no env var, try Baserow config
    if (!aiApiKey) {
      const config = await getGlobalConfig();
      aiApiKey = config.ai?.aiApiKey || undefined;
    }

    // Check for API key
    if (!aiApiKey) {
      // Fallback: Generate deterministic palette based on prompt
      console.log('⚠️ No AI API key configured, using fallback generation');
      const palette = generateFallbackPalette(prompt);
      return NextResponse.json({
        ...palette,
        source: 'fallback',
        message: 'Palette générée algorithmiquement',
      });
    }

    // Generate with OpenAI
    console.log('🤖 Generating palette with OpenAI...');
    const palette = await generateWithOpenAI(prompt, aiApiKey);
    return NextResponse.json({ ...palette, source: 'openai' });

  } catch (error) {
    console.error('❌ Magic Colors API error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la palette' },
      { status: 500 }
    );
  }
}

// ============================================
// OPENAI GENERATION
// ============================================

async function generateWithOpenAI(prompt: string, apiKey: string): Promise<ColorPalette> {
  const systemPrompt = `You are a professional UI/UX designer specializing in color theory and brand identity.
Generate a cohesive color palette for a website based on the user's business description.

Rules:
- Colors must be in HEX format (#RRGGBB)
- Background should be dark (for modern dark mode aesthetic)
- Text should have good contrast with background
- Primary and accent colors should complement each other
- Consider the emotional and psychological impact of colors for the business type

Respond ONLY with valid JSON in this exact format:
{
  "primary": "#XXXXXX",
  "accent": "#XXXXXX",
  "background": "#XXXXXX",
  "text": "#XXXXXX"
}`;

  const userPrompt = `Generate a color palette for: "${prompt}"

Consider the industry, target audience, and brand personality. Create colors that evoke the right emotions and professionalism for this type of business.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json() as OpenAIResponse;
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const palette = JSON.parse(jsonMatch[0]) as ColorPalette;

    // Validate hex colors
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (
      !hexRegex.test(palette.primary) ||
      !hexRegex.test(palette.accent) ||
      !hexRegex.test(palette.background) ||
      !hexRegex.test(palette.text)
    ) {
      throw new Error('Invalid color format in response');
    }

    console.log('✅ Generated palette with OpenAI:', palette);
    return palette;

  } catch (error) {
    console.error('OpenAI generation failed:', error);
    // Fallback on error
    return generateFallbackPalette(prompt);
  }
}

// ============================================
// FALLBACK GENERATION (Deterministic)
// ============================================

function generateFallbackPalette(prompt: string): ColorPalette {
  // Create a simple hash from the prompt
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Use hash to select from curated palettes
  const palettes: ColorPalette[] = [
    // Tech/Modern
    { primary: '#06b6d4', accent: '#a855f7', background: '#0a0a0f', text: '#ffffff' },
    // Nature/Organic
    { primary: '#22c55e', accent: '#84cc16', background: '#0c1a0f', text: '#f0fdf4' },
    // Professional/Corporate
    { primary: '#3b82f6', accent: '#6366f1', background: '#0f172a', text: '#f8fafc' },
    // Warm/Bakery
    { primary: '#f59e0b', accent: '#ef4444', background: '#1c1917', text: '#fef3c7' },
    // Luxury/Gold
    { primary: '#d4af37', accent: '#c084fc', background: '#0a0a0a', text: '#fafafa' },
    // Health/Medical
    { primary: '#14b8a6', accent: '#06b6d4', background: '#042f2e', text: '#f0fdfa' },
    // Creative/Bold
    { primary: '#ec4899', accent: '#f97316', background: '#18181b', text: '#fafafa' },
    // Minimalist
    { primary: '#64748b', accent: '#475569', background: '#f8fafc', text: '#0f172a' },
  ];

  // Keyword matching for better results
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('bakery') || promptLower.includes('food') || promptLower.includes('restaurant')) {
    return palettes[3];
  }
  if (promptLower.includes('nature') || promptLower.includes('organic') || promptLower.includes('eco')) {
    return palettes[1];
  }
  if (promptLower.includes('tech') || promptLower.includes('startup') || promptLower.includes('digital')) {
    return palettes[0];
  }
  if (promptLower.includes('luxury') || promptLower.includes('premium') || promptLower.includes('gold')) {
    return palettes[4];
  }
  if (promptLower.includes('health') || promptLower.includes('medical') || promptLower.includes('wellness')) {
    return palettes[5];
  }
  if (promptLower.includes('creative') || promptLower.includes('agency') || promptLower.includes('design')) {
    return palettes[6];
  }
  if (promptLower.includes('minimal') || promptLower.includes('clean') || promptLower.includes('simple')) {
    return palettes[7];
  }
  if (promptLower.includes('corporate') || promptLower.includes('business') || promptLower.includes('finance')) {
    return palettes[2];
  }

  // Use hash for random selection
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

