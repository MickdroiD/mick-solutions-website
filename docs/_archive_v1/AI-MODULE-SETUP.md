# 🤖 Configuration du Module IA - Mick Solutions Site Factory

## Vue d'ensemble

Le module IA permet :
- **Génération de contenu** : Hero, Services, FAQ, Témoignages
- **Assistant chatbot** : Intégré au site pour répondre aux visiteurs
- **Génération d'images** : Via Replicate/SDXL

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` ou `.env.local` :

```env
# OpenAI (GPT-4o, GPT-4o-mini)
OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic (Claude 3.5 Sonnet)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Replicate (Images SDXL)
REPLICATE_API_TOKEN=r8_your-replicate-token-here

# Clé par défaut pour les clients sans clé personnalisée
DEFAULT_AI_API_KEY=sk-your-default-key-here
```

## Obtenir les clés API

### OpenAI
1. Aller sur https://platform.openai.com/api-keys
2. Créer une nouvelle clé API
3. Copier la clé (format: `sk-...`)

### Anthropic
1. Aller sur https://console.anthropic.com/settings/keys
2. Créer une nouvelle clé API
3. Copier la clé (format: `sk-ant-...`)

### Replicate
1. Aller sur https://replicate.com/account/api-tokens
2. Créer un nouveau token
3. Copier le token (format: `r8_...`)

## Endpoints API

### POST `/api/ai/generate`
Génération de contenu (texte, images, structured content)

**Body:**
```json
{
  "action": "hero|services|faq|testimonial|text|image",
  "provider": "openai|anthropic|replicate|custom",
  "model": "gpt-4o-mini",
  "prompt": "Description de votre entreprise...",
  "context": {
    "industry": "Tech",
    "tone": "Professional",
    "keywords": "automatisation, PME, Suisse",
    "targetAudience": "PME suisses",
    "language": "fr"
  },
  "options": {
    "maxTokens": 2000,
    "temperature": 0.7
  }
}
```

**Actions disponibles:**
- `hero` : Génère badge, titre, sous-titre, CTAs
- `services` : Génère 3 services avec icônes
- `faq` : Génère 5 questions/réponses
- `testimonial` : Génère un témoignage client
- `text` : Texte libre
- `image` : Génération d'image (Replicate uniquement)

### POST `/api/ai/chat`
Chat en temps réel avec l'assistant IA

**Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Bonjour, quels sont vos services ?" }
  ],
  "provider": "openai|anthropic",
  "systemPrompt": "Tu es un assistant...",
  "siteContext": {
    "siteName": "Mick Solutions",
    "industry": "Tech",
    "services": ["Automatisation", "Hébergement"]
  },
  "stream": true
}
```

## Utilisation dans l'Admin

### Génération automatique depuis l'interface

1. Aller dans l'admin (`/admin`)
2. Section "Intelligence Artificielle" 🤖
3. Configurer le provider et le modèle
4. Dans chaque section (Hero, Services, FAQ), cliquer sur le style "AI"
5. Configurer le prompt et activer

### Hook React `useAIGeneration`

```tsx
import { useAIGeneration } from '@/lib/hooks/useAIGeneration';

function MyComponent() {
  const { 
    isLoading, 
    error, 
    generateHero, 
    generateServices 
  } = useAIGeneration();

  const handleGenerate = async () => {
    const hero = await generateHero(
      "Entreprise de consulting IT en Suisse",
      {
        provider: 'openai',
        context: { tone: 'Professional', industry: 'Tech' }
      }
    );
    
    if (hero) {
      console.log(hero.title, hero.subtitle);
    }
  };
}
```

## Composant Assistant IA

```tsx
import AIAssistant from '@/components/AIAssistant';

<AIAssistant
  siteName="Mick Solutions"
  industry="Tech"
  services={['Automatisation', 'Hébergement', 'Développement']}
  welcomeMessage="Bonjour ! Comment puis-je vous aider ?"
  primaryColor="#06b6d4"
  accentColor="#a855f7"
  provider="openai"
/>
```

## Modèles recommandés

| Provider | Modèle | Usage | Coût |
|----------|--------|-------|------|
| OpenAI | `gpt-4o-mini` | Génération rapide | $ |
| OpenAI | `gpt-4o` | Qualité maximale | $$$ |
| Anthropic | `claude-3-5-sonnet` | Équilibré | $$ |
| Replicate | `stability-ai/sdxl` | Images | $ |

## Sécurité

- Les clés API ne sont **jamais** exposées côté client
- Le client peut fournir sa propre clé (stockée chiffrée en DB)
- Si pas de clé client → utilisation de `DEFAULT_AI_API_KEY`
- Rate limiting recommandé : 100 req/jour par client

## Troubleshooting

### "Clé API non configurée"
→ Vérifiez que les variables sont dans `.env.local`
→ Redémarrez le serveur Next.js

### "Erreur de génération"
→ Vérifiez la validité de la clé API
→ Vérifiez les quotas/crédits du provider

### "Timeout"
→ Pour Replicate (images), le timeout est de 60s
→ Augmentez si nécessaire dans la config

