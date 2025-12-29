// ============================================
// API Route: /api/ai/chat
// ============================================
// Chat en temps réel avec l'assistant IA
// Supporte streaming pour une meilleure UX

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// TYPES
// ============================================

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  provider?: 'openai' | 'anthropic';
  model?: string;
  systemPrompt?: string;
  siteContext?: {
    siteName?: string;
    industry?: string;
    services?: string[];
  };
  customApiKey?: string;
  stream?: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

const API_KEYS = {
  openai: process.env.OPENAI_API_KEY || '',
  anthropic: process.env.ANTHROPIC_API_KEY || '',
};

const DEFAULT_SYSTEM_PROMPT = `Tu es un assistant virtuel professionnel pour un site web d'entreprise suisse.
Tu dois:
- Répondre de manière concise et utile
- Être poli et professionnel
- Aider les visiteurs à comprendre les services proposés
- Orienter vers le formulaire de contact pour les demandes complexes
- Répondre en français par défaut

Ne jamais:
- Donner de fausses informations
- Promettre des délais ou des prix sans vérification
- Partager d'informations confidentielles`;

// ============================================
// STREAMING RESPONSES
// ============================================

async function* streamOpenAI(
  messages: ChatMessage[],
  systemPrompt: string,
  model: string,
  apiKey: string
): AsyncGenerator<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No response body');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.replace('data: ', '');
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // Skip malformed JSON
      }
    }
  }
}

async function* streamAnthropic(
  messages: ChatMessage[],
  systemPrompt: string,
  model: string,
  apiKey: string
): AsyncGenerator<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages.filter((m) => m.role !== 'system'),
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No response body');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.replace('data: ', '');
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta') {
          const content = parsed.delta?.text;
          if (content) yield content;
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }
}

// ============================================
// NON-STREAMING RESPONSES
// ============================================

async function chatOpenAI(
  messages: ChatMessage[],
  systemPrompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function chatAnthropic(
  messages: ChatMessage[],
  systemPrompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages.filter((m) => m.role !== 'system'),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

// ============================================
// ROUTE HANDLER
// ============================================

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: ChatRequestBody = await request.json();
    const {
      messages,
      provider = 'openai',
      model,
      systemPrompt,
      siteContext,
      customApiKey,
      stream = false,
    } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 });
    }

    const apiKey = customApiKey || API_KEYS[provider];
    if (!apiKey) {
      return NextResponse.json(
        { error: `Clé API ${provider} non configurée` },
        { status: 400 }
      );
    }

    // Construire le system prompt
    let finalSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;
    if (siteContext) {
      finalSystemPrompt += `\n\nContexte du site:`;
      if (siteContext.siteName) finalSystemPrompt += `\n- Nom: ${siteContext.siteName}`;
      if (siteContext.industry) finalSystemPrompt += `\n- Secteur: ${siteContext.industry}`;
      if (siteContext.services?.length) {
        finalSystemPrompt += `\n- Services: ${siteContext.services.join(', ')}`;
      }
    }

    const selectedModel =
      model ||
      (provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-sonnet-20241022');

    // Mode streaming
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const generator =
              provider === 'openai'
                ? streamOpenAI(messages, finalSystemPrompt, selectedModel, apiKey)
                : streamAnthropic(messages, finalSystemPrompt, selectedModel, apiKey);

            for await (const chunk of generator) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur' })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Mode non-streaming
    const response =
      provider === 'openai'
        ? await chatOpenAI(messages, finalSystemPrompt, selectedModel, apiKey)
        : await chatAnthropic(messages, finalSystemPrompt, selectedModel, apiKey);

    return NextResponse.json({
      success: true,
      content: response,
      provider,
      model: selectedModel,
    });
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

