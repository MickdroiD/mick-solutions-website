// ============================================
// HOOK: useAIGeneration
// ============================================
// Hook React pour la génération de contenu IA

import { useState, useCallback } from 'react';

// ============================================
// TYPES
// ============================================

export interface AIGenerationOptions {
  provider?: 'openai' | 'anthropic' | 'replicate' | 'custom';
  model?: string;
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
}

export interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  cta1: string;
  cta2: string;
}

export interface ServiceContent {
  title: string;
  description: string;
  icon: string;
  keyPoints: string[];
}

export interface FAQContent {
  question: string;
  answer: string;
}

export interface TestimonialContent {
  name: string;
  position: string;
  message: string;
  rating: number;
}

export interface AIGenerationResult<T> {
  success: boolean;
  data?: T;
  imageUrl?: string;
  error?: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export interface UseAIGenerationReturn {
  isLoading: boolean;
  error: string | null;
  generateText: (prompt: string, opts?: AIGenerationOptions) => Promise<string | null>;
  generateHero: (businessDescription: string, opts?: AIGenerationOptions) => Promise<HeroContent | null>;
  generateServices: (businessDescription: string, count?: number, opts?: AIGenerationOptions) => Promise<ServiceContent[] | null>;
  generateFAQ: (businessDescription: string, count?: number, opts?: AIGenerationOptions) => Promise<FAQContent[] | null>;
  generateTestimonial: (businessDescription: string, opts?: AIGenerationOptions) => Promise<TestimonialContent | null>;
  generateImage: (prompt: string, opts?: AIGenerationOptions) => Promise<string | null>;
  providers: {
    openai: boolean;
    anthropic: boolean;
    replicate: boolean;
  };
}

// ============================================
// HOOK
// ============================================

export function useAIGeneration(): UseAIGenerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers] = useState({
    openai: true,
    anthropic: true,
    replicate: true,
  });

  // ============================================
  // APPEL API GÉNÉRIQUE
  // ============================================

  const callAI = useCallback(async <T>(
    action: 'text' | 'image' | 'hero' | 'services' | 'faq' | 'testimonial',
    prompt: string,
    options?: AIGenerationOptions
  ): Promise<AIGenerationResult<T>> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          prompt,
          provider: options?.provider || 'openai',
          model: options?.model,
          context: options?.context,
          options: options?.options,
          customApiKey: options?.customApiKey,
          webhookUrl: options?.webhookUrl,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Erreur de génération');
        return {
          success: false,
          error: data.error,
          provider: data.provider || 'unknown',
          model: data.model || '',
        };
      }

      return {
        success: true,
        data: data.content as T,
        imageUrl: data.imageUrl,
        provider: data.provider,
        model: data.model,
        tokensUsed: data.tokensUsed,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        provider: 'unknown',
        model: '',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // MÉTHODES SPÉCIALISÉES
  // ============================================

  const generateText = useCallback(
    async (prompt: string, opts?: AIGenerationOptions): Promise<string | null> => {
      const result = await callAI<string>('text', prompt, opts);
      return result.success ? result.data || null : null;
    },
    [callAI]
  );

  const generateHero = useCallback(
    async (businessDescription: string, opts?: AIGenerationOptions): Promise<HeroContent | null> => {
      const prompt = `Génère le contenu Hero pour une entreprise: "${businessDescription}".
Le badge doit être accrocheur (ex: "Nouveau", "🚀 Lancement").
Le titre doit être percutant, en 2-3 phrases courtes.
Le sous-titre explique la proposition de valeur unique.
Les CTA doivent inciter à l'action.`;

      const result = await callAI<HeroContent>('hero', prompt, opts);
      return result.success ? result.data || null : null;
    },
    [callAI]
  );

  const generateServices = useCallback(
    async (
      businessDescription: string,
      count: number = 3,
      opts?: AIGenerationOptions
    ): Promise<ServiceContent[] | null> => {
      const prompt = `Génère ${count} services pour une entreprise: "${businessDescription}".
Chaque service doit avoir:
- Un titre clair et professionnel
- Une description engageante (2-3 phrases)
- Une icône Lucide React pertinente (ex: "Zap", "Shield", "Code2", "Bot", "Server", "Smartphone")
- 3-4 points clés sous forme de liste`;

      const result = await callAI<ServiceContent[]>('services', prompt, opts);
      return result.success && Array.isArray(result.data) ? result.data : null;
    },
    [callAI]
  );

  const generateFAQ = useCallback(
    async (
      businessDescription: string,
      count: number = 5,
      opts?: AIGenerationOptions
    ): Promise<FAQContent[] | null> => {
      const prompt = `Génère ${count} questions/réponses FAQ pour une entreprise: "${businessDescription}".
Les questions doivent être celles que les clients posent vraiment.
Les réponses doivent être claires, rassurantes et professionnelles.`;

      const result = await callAI<FAQContent[]>('faq', prompt, opts);
      return result.success && Array.isArray(result.data) ? result.data : null;
    },
    [callAI]
  );

  const generateTestimonial = useCallback(
    async (businessDescription: string, opts?: AIGenerationOptions): Promise<TestimonialContent | null> => {
      const prompt = `Génère un témoignage client réaliste pour une entreprise: "${businessDescription}".
Le témoignage doit sembler authentique et spécifique à l'expérience client.
Utilise un nom, prénom et poste crédibles pour la Suisse francophone.`;

      const result = await callAI<TestimonialContent>('testimonial', prompt, opts);
      return result.success ? result.data || null : null;
    },
    [callAI]
  );

  const generateImage = useCallback(
    async (prompt: string, opts?: AIGenerationOptions): Promise<string | null> => {
      const imageOpts = {
        ...opts,
        provider: 'replicate' as const,
      };
      const result = await callAI<never>('image', prompt, imageOpts);
      return result.success ? result.imageUrl || null : null;
    },
    [callAI]
  );

  return {
    isLoading,
    error,
    generateText,
    generateHero,
    generateServices,
    generateFAQ,
    generateTestimonial,
    generateImage,
    providers,
  };
}

export default useAIGeneration;

