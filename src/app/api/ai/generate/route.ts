// ============================================
// API Route: /api/ai/generate
// ============================================
// Génération de contenu via IA multi-provider
// Supporte: OpenAI, Anthropic, Replicate, Custom Webhook
// + Système de crédits via Baserow (Table 756)

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// CONFIGURATION BASEROW
// ============================================

const BASEROW_BASE_URL = 'https://baserow.mick-solutions.ch/api/database/rows/table';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const USERS_TABLE_ID = 756;

// ============================================
// TYPES
// ============================================

interface AIRequestBody {
  action: 'text' | 'image' | 'hero' | 'services' | 'faq' | 'testimonial';
  provider?: 'openai' | 'gemini' | 'replicate' | 'custom';
  model?: string;
  prompt: string;
  userId?: number; // ID utilisateur Baserow pour vérifier les crédits
  context?: {
    industry?: string;
    tone?: string;
    keywords?: string;
    targetAudience?: string;
    language?: string;
  };
  options?: {
    maxTokens?: number;
    temperature?: number;
    imageSize?: string;
    imageStyle?: string;
  };
  customApiKey?: string;
  webhookUrl?: string;
  saveToBaserow?: boolean; // Sauvegarder l'image dans Baserow
}

interface AIResponse {
  success: boolean;
  content?: string | string[];
  imageUrl?: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  creditsRemaining?: number;
  error?: string;
}

// ============================================
// FONCTIONS DE GESTION DES CRÉDITS
// ============================================

async function getUserCredits(userId: number): Promise<{ credits: number; rowId: number } | null> {
  if (!BASEROW_TOKEN) {
    console.error('[Credits] BASEROW_API_TOKEN manquant');
    return null;
  }

  try {
    const response = await fetch(
      `${BASEROW_BASE_URL}/${USERS_TABLE_ID}/${userId}/?user_field_names=true`,
      {
        headers: { 'Authorization': `Token ${BASEROW_TOKEN}` },
      }
    );

    if (!response.ok) {
      console.error('[Credits] Utilisateur non trouvé:', userId);
      return null;
    }

    const user = await response.json();
    const credits = parseInt(user.credits || '0', 10);
    
    return { credits, rowId: user.id };
  } catch (error) {
    console.error('[Credits] Erreur fetch:', error);
    return null;
  }
}

async function decrementCredits(userId: number, currentCredits: number): Promise<boolean> {
  if (!BASEROW_TOKEN) return false;

  try {
    const response = await fetch(
      `${BASEROW_BASE_URL}/${USERS_TABLE_ID}/${userId}/?user_field_names=true`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits: String(currentCredits - 1) }),
      }
    );

    if (!response.ok) {
      console.error('[Credits] Erreur décrémentation');
      return false;
    }

    console.log(`[Credits] Utilisateur ${userId}: ${currentCredits} -> ${currentCredits - 1}`);
    return true;
  } catch (error) {
    console.error('[Credits] Erreur update:', error);
    return false;
  }
}

// ============================================
// CONFIGURATION API KEYS
// ============================================

const API_KEYS: Record<string, string> = {
  openai: process.env.OPENAI_API_KEY || '',
  gemini: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '',
  replicate: process.env.REPLICATE_API_TOKEN || '',
  custom: '',
};

const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
  replicate: 'flux-schnell',
  custom: 'custom',
};

// ============================================
// PROMPTS PRÉ-CONFIGURÉS
// ============================================

const SYSTEM_PROMPTS: Record<string, string> = {
  hero: `Tu es un expert en copywriting pour sites web. Génère du contenu pour une section Hero (accueil).
Retourne un JSON avec: { "badge": "...", "title": "...", "subtitle": "...", "cta1": "...", "cta2": "..." }
Le titre doit être accrocheur et en 2-3 lignes. Le sous-titre explique la proposition de valeur.`,

  services: `Tu es un expert en rédaction de services professionnels.
Génère 3 services au format JSON: [{ "title": "...", "description": "...", "icon": "...", "keyPoints": ["...", "..."] }]
Les icônes doivent être des noms Lucide React valides (ex: "Zap", "Shield", "Code2").`,

  faq: `Tu es un expert en FAQ pour sites web.
Génère 5 questions/réponses pertinentes au format JSON: [{ "question": "...", "answer": "..." }]
Les questions doivent être celles que les clients posent vraiment.`,

  testimonial: `Tu es un générateur de témoignages clients réalistes.
Génère un témoignage au format JSON: { "name": "...", "position": "...", "message": "...", "rating": 5 }
Le témoignage doit sembler authentique et spécifique.`,

  text: `Tu es un assistant de rédaction professionnel. Écris du contenu clair, engageant et adapté au web.`,

  image: `Génère une description d'image professionnelle adaptée au contexte fourni.`,
};

// ============================================
// FONCTIONS PAR PROVIDER
// ============================================

async function callOpenAI(
  prompt: string,
  systemPrompt: string,
  model: string,
  options: { maxTokens?: number; temperature?: number },
  apiKey: string
): Promise<{ content: string; tokensUsed: number }> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || '',
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

async function callGemini(
  prompt: string,
  systemPrompt: string,
  model: string,
  options: { maxTokens?: number; temperature?: number },
  apiKey: string
): Promise<{ content: string; tokensUsed: number }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\n${prompt}` }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return {
    content,
    tokensUsed: data.usageMetadata?.totalTokenCount || 0,
  };
}

async function callReplicate(
  prompt: string,
  model: string,
  options: { imageSize?: string; imageStyle?: string },
  apiKey: string
): Promise<{ imageUrl: string }> {
  console.log('[Replicate] Démarrage génération image');
  console.log('[Replicate] Modèle demandé:', model);
  console.log('[Replicate] Prompt:', prompt.substring(0, 100) + '...');
  console.log('[Replicate] API Key présente:', !!apiKey);

  // Vérifier la clé API
  if (!apiKey || apiKey.length < 10) {
    throw new Error('REPLICATE_API_TOKEN manquant ou invalide. Vérifiez votre fichier .env');
  }

  // Déterminer le modèle complet (owner/name)
  const modelMap: Record<string, string> = {
    'flux-schnell': 'black-forest-labs/flux-schnell',
    'flux-dev': 'black-forest-labs/flux-dev',
    'flux-1.1-pro': 'black-forest-labs/flux-1.1-pro',
    'flux-pro': 'black-forest-labs/flux-pro',
    'ideogram-v2': 'ideogram-ai/ideogram-v2',
    'imagen-4': 'google-deepmind/imagen-4',
  };
  const fullModel = modelMap[model] || model;
  console.log('[Replicate] Modèle résolu:', fullModel);
  
  // Nouveau endpoint pour les modèles officiels
  const endpoint = fullModel.includes('/') 
    ? `https://api.replicate.com/v1/models/${fullModel}/predictions`
    : 'https://api.replicate.com/v1/predictions';
  
  console.log('[Replicate] Endpoint:', endpoint);

  // Construire le payload selon le modèle FLUX
  const requestBody: Record<string, unknown> = {
    input: {
      prompt: prompt,
      // FLUX schnell supporte ces paramètres
      num_outputs: 1,
      output_format: 'webp',
      output_quality: 90,
    },
  };

  // Ajouter aspect_ratio pour les modèles qui le supportent
  if (fullModel.includes('flux')) {
    (requestBody.input as Record<string, unknown>).aspect_ratio = options.imageSize === 'square' ? '1:1' : '16:9';
  }

  console.log('[Replicate] Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const startResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, // IMPORTANT: Bearer au lieu de Token pour API v1
        'Prefer': 'wait', // Attendre le résultat directement si possible
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await startResponse.text();
    console.log('[Replicate] Response status:', startResponse.status);
    console.log('[Replicate] Response:', responseText.substring(0, 500));

    if (!startResponse.ok) {
      // Parser l'erreur pour plus de détails
      try {
        const errorJson = JSON.parse(responseText);
        throw new Error(`Replicate API (${startResponse.status}): ${errorJson.detail || errorJson.error || responseText}`);
      } catch {
        throw new Error(`Replicate API (${startResponse.status}): ${responseText}`);
      }
    }

    const prediction = JSON.parse(responseText);
    console.log('[Replicate] Prediction ID:', prediction.id);
    console.log('[Replicate] Status initial:', prediction.status);

    // Si la réponse contient déjà le résultat (mode synchrone)
    if (prediction.status === 'succeeded' && prediction.output) {
      const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      console.log('[Replicate] ✅ Résultat immédiat:', output);
      return { imageUrl: output };
    }

    // Sinon, polling pour attendre le résultat
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 120; // 120 secondes max pour les images

    while (result.status !== 'succeeded' && result.status !== 'failed' && result.status !== 'canceled' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      
      if (!pollResponse.ok) {
        console.error('[Replicate] Erreur polling:', pollResponse.status);
        continue;
      }
      
      result = await pollResponse.json();
      attempts++;
      
      if (attempts % 10 === 0) {
        console.log(`[Replicate] Polling... ${attempts}s - Status: ${result.status}`);
      }
    }

    console.log('[Replicate] Status final:', result.status);

    if (result.status === 'failed') {
      console.error('[Replicate] ❌ Échec:', result.error);
      throw new Error(`Génération échouée: ${result.error || 'Erreur inconnue'}`);
    }

    if (result.status === 'canceled') {
      throw new Error('Génération annulée');
    }

    if (attempts >= maxAttempts) {
      throw new Error('Timeout: la génération a pris trop de temps (>2min)');
    }

    // FLUX retourne un array ou une string selon le modèle
    const output = Array.isArray(result.output) ? result.output[0] : result.output;
    
    if (!output) {
      throw new Error('Aucune image générée dans la réponse');
    }

    console.log('[Replicate] ✅ Image générée:', output);
    return { imageUrl: output };
    
  } catch (error) {
    console.error('[Replicate] ❌ Erreur complète:', error);
    throw error;
  }
}

async function callCustomWebhook(
  prompt: string,
  webhookUrl: string,
  context: Record<string, unknown>
): Promise<{ content: string }> {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context }),
  });

  if (!response.ok) {
    throw new Error(`Webhook error: ${response.status}`);
  }

  const data = await response.json();
  return { content: data.content || data.result || JSON.stringify(data) };
}

// ============================================
// ROUTE HANDLER
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse<AIResponse>> {
  try {
    const body: AIRequestBody = await request.json();
    const {
      action,
      provider: initialProvider = 'openai',
      model: initialModel,
      prompt,
      userId,
      context = {},
      options = {},
      customApiKey,
      webhookUrl,
    } = body;
    let provider = initialProvider;
    let model = initialModel;

    // ============================================
    // AUTO-SWITCH PROVIDER SELON LE MODÈLE
    // ============================================
    // Corrige les incohérences de config Baserow où AI_Provider peut être null
    // mais AI_Model est défini sur un modèle spécifique
    
    if (model) {
      const modelLower = model.toLowerCase();
      
      // Modèles Replicate (génération d'images)
      if (modelLower.includes('flux') || 
          modelLower.includes('sdxl') || 
          modelLower.includes('stable-diffusion') ||
          modelLower.includes('ideogram') ||
          modelLower.includes('imagen')) {
        provider = 'replicate';
        console.log(`[AI Generate] Auto-switch provider -> replicate (modèle: ${model})`);
      }
      // Modèles OpenAI
      else if (modelLower.includes('gpt') || modelLower.includes('o1') || modelLower.includes('davinci')) {
        provider = 'openai';
        console.log(`[AI Generate] Auto-switch provider -> openai (modèle: ${model})`);
      }
      // Modèles Google Gemini
      else if (modelLower.includes('gemini')) {
        provider = 'gemini';
        console.log(`[AI Generate] Auto-switch provider -> gemini (modèle: ${model})`);
      }
    }
    
    // Pour les actions d'image, forcer Replicate si pas de modèle spécifié
    if (action === 'image' && !model) {
      provider = 'replicate';
      model = 'flux-schnell';
      console.log(`[AI Generate] Action image sans modèle -> replicate/flux-schnell`);
    }

    console.log(`[AI Generate] Action: ${action}, Provider: ${provider}, Model: ${model || 'default'}`);

    // Validation
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt requis', provider, model: model || '' },
        { status: 400 }
      );
    }

    // ============================================
    // VÉRIFICATION DES CRÉDITS (si userId fourni)
    // ============================================
    let userCredits: { credits: number; rowId: number } | null = null;
    
    // Pour les générations d'images, vérifier les crédits
    if (action === 'image' && userId) {
      userCredits = await getUserCredits(userId);
      
      if (!userCredits) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Utilisateur non trouvé', 
            provider, 
            model: model || '' 
          },
          { status: 404 }
        );
      }

      if (userCredits.credits <= 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Crédits insuffisants. Veuillez recharger votre compte pour générer des images.',
            creditsRemaining: 0,
            provider, 
            model: model || '' 
          },
          { status: 402 } // Payment Required
        );
      }

      console.log(`[Credits] Utilisateur ${userId} a ${userCredits.credits} crédit(s)`);
    }

    // Construire le prompt contextuel
    let contextualPrompt = prompt;
    if (context.industry) contextualPrompt = `Secteur: ${context.industry}. ${contextualPrompt}`;
    if (context.tone) contextualPrompt = `Ton: ${context.tone}. ${contextualPrompt}`;
    if (context.targetAudience) contextualPrompt = `Cible: ${context.targetAudience}. ${contextualPrompt}`;
    if (context.keywords) contextualPrompt = `Mots-clés: ${context.keywords}. ${contextualPrompt}`;
    if (context.language) contextualPrompt = `Langue: ${context.language}. ${contextualPrompt}`;

    // Sélectionner le system prompt selon l'action
    const systemPrompt = SYSTEM_PROMPTS[action] || SYSTEM_PROMPTS.text;
    const selectedModel = model || DEFAULT_MODELS[provider] || DEFAULT_MODELS.openai;
    const apiKey = customApiKey || API_KEYS[provider];

    if (!apiKey && provider !== 'custom') {
      return NextResponse.json(
        { success: false, error: `Clé API ${provider} non configurée`, provider, model: selectedModel },
        { status: 400 }
      );
    }

    // Appeler le provider approprié
    let result: { content?: string; imageUrl?: string; tokensUsed?: number };

    switch (provider) {
      case 'openai':
        result = await callOpenAI(contextualPrompt, systemPrompt, selectedModel, options, apiKey);
        break;

      case 'gemini':
        result = await callGemini(contextualPrompt, systemPrompt, selectedModel, options, apiKey);
        break;

      case 'replicate':
        // Replicate pour les images
        result = await callReplicate(contextualPrompt, selectedModel, options, apiKey);
        break;

      case 'custom':
        if (!webhookUrl) {
          return NextResponse.json(
            { success: false, error: 'URL webhook requise pour provider custom', provider, model: '' },
            { status: 400 }
          );
        }
        result = await callCustomWebhook(contextualPrompt, webhookUrl, context);
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Provider inconnu: ${provider}`, provider, model: '' },
          { status: 400 }
        );
    }

    // Parser le contenu JSON si nécessaire
    let parsedContent = result.content;
    if (result.content && ['hero', 'services', 'faq', 'testimonial'].includes(action)) {
      try {
        // Extraire le JSON du texte (parfois l'IA ajoute du texte autour)
        const jsonMatch = result.content.match(/[\[{][\s\S]*[\]}]/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Garder le contenu brut si le parsing échoue
        console.warn('JSON parsing failed, returning raw content');
      }
    }

    // ============================================
    // DÉCRÉMENTER LES CRÉDITS SI GÉNÉRATION IMAGE RÉUSSIE
    // ============================================
    let creditsRemaining: number | undefined;
    
    if (action === 'image' && userId && userCredits && result.imageUrl) {
      const decremented = await decrementCredits(userId, userCredits.credits);
      if (decremented) {
        creditsRemaining = userCredits.credits - 1;
        console.log(`[Credits] ✅ Crédit déduit. Restant: ${creditsRemaining}`);
      } else {
        console.warn('[Credits] ⚠️ Impossible de décrémenter les crédits');
      }
    }

    return NextResponse.json({
      success: true,
      content: parsedContent,
      imageUrl: result.imageUrl,
      provider,
      model: selectedModel,
      tokensUsed: result.tokensUsed,
      creditsRemaining,
    });
  } catch (error) {
    console.error('[AI Generate] ❌ Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        provider: 'unknown',
        model: '',
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET - Info sur les providers disponibles
// ============================================

export async function GET(): Promise<NextResponse> {
  const providers = {
    openai: {
      available: !!API_KEYS.openai,
      models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
      actions: ['text', 'hero', 'services', 'faq', 'testimonial'],
    },
    gemini: {
      available: !!API_KEYS.gemini,
      models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
      actions: ['text', 'hero', 'services', 'faq', 'testimonial'],
    },
    replicate: {
      available: !!API_KEYS.replicate,
      models: ['stability-ai/sdxl', 'black-forest-labs/flux-schnell', 'black-forest-labs/flux-dev'],
      actions: ['image'],
    },
  };

  return NextResponse.json({ providers });
}

