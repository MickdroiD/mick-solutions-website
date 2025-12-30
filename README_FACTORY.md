# 🏭 Factory V2 - Guide de Référence Technique

> Architecture White-Label complète pour déployer des sites clients rapidement.

**Dernière mise à jour**: 29 Décembre 2025 | **Version**: 2.0

---

## 📋 Table des matières

1. [Architecture Overview](#architecture-overview)
2. [Création d'un nouveau client](#création-dun-nouveau-client)
3. [Déploiement Docker](#déploiement-docker)
4. [Configuration Traefik](#configuration-traefik)
5. [Types de Sections disponibles](#types-de-sections-disponibles)
6. [Administration du site](#administration-du-site)
7. [Suppression d'un client](#suppression-dun-client)
8. [Troubleshooting](#troubleshooting)

## 📚 Documentation complémentaire

| Document | Description |
|----------|-------------|
| [ADMIN-GUIDE-V2.md](./docs/ADMIN-GUIDE-V2.md) | Guide complet création → suppression client |
| [USER-GUIDE-V2.md](./docs/USER-GUIDE-V2.md) | Guide pour les utilisateurs finaux |

---

## 🏗️ Architecture Overview

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 14 (App Router) |
| Database | Baserow (Self-hosted) |
| Auth | JWT + PIN (ENV-based) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Deployment | Docker + Traefik |

### Structure des données

```
FACTORY_V2 (Template Database)
├── CONFIG_GLOBAL     → Configuration globale (1 row)
│   ├── Identity      → Nom, slogan, logo
│   ├── Branding      → Couleurs, fonts, theme
│   ├── SEO           → Meta tags, sitemap
│   ├── Contact       → Email, téléphone, réseaux
│   ├── Integrations  → Analytics, webhooks
│   └── AI            → Chatbot, génération
│
└── SECTIONS          → Sections du site (N rows)
    ├── Type          → hero, services, faq, etc.
    ├── Content       → JSON (données de la section)
    ├── Design        → JSON (style de la section)
    ├── Order         → Ordre d'affichage
    └── Is_Active     → Visible ou non
```

---

## 🆕 Création d'un nouveau client

### Prérequis

- Node.js 18+
- Accès admin à Baserow (email/password)
- Variables d'environnement configurées:
  - `BASEROW_EMAIL`
  - `BASEROW_PASSWORD`
  - `BASEROW_API_TOKEN`

### Étape 1: Exécuter le script de provisioning

```bash
cd /home/mickadmin/docker/website

# Méthode 1: Avec npm
npm run client:new "Nom du Client"

# Méthode 2: Directement avec tsx
npx tsx scripts/create-client.ts "Boulangerie Patate"
```

### Étape 2: Récupérer les variables d'environnement

Le script affiche les variables à la fin:

```
🚀 CONFIGURATION POUR DOCKER:
───────────────────────────────────────
BASEROW_API_TOKEN=xxxxx
BASEROW_FACTORY_GLOBAL_ID=1234
BASEROW_FACTORY_SECTIONS_ID=1235
ADMIN_PASSWORD=847291
───────────────────────────────────────
```

> 💡 **Tip**: Répondez "o" à la question pour sauvegarder dans `.env.client-xxx`

### Étape 3: Personnaliser dans Baserow

1. Ouvrir Baserow → Workspace → `CLIENT - Nom du Client`
2. Aller dans `CONFIG_GLOBAL` → Modifier:
   - **Name**: JSON avec `nomSite`, `slogan`, `initialesLogo`
   - **Branding**: Couleurs primaires/accent
   - **Assets**: Logo URL, Favicon URL
3. Aller dans `SECTIONS` → Ajouter les sections souhaitées

---

## 🐳 Déploiement Docker

### Option A: Build local sur le VPS

```bash
# 1. Cloner ou sync le code sur le VPS
cd /opt/clients/nom-client

# 2. Créer le .env
cp env.template .env
nano .env  # Remplir les variables

# 3. Build l'image
docker build -t factory-client-nom:latest .

# 4. Lancer avec docker-compose
cp docker-compose.prod.yml docker-compose.yml
docker compose up -d
```

### Option B: Image pré-buildée

```bash
# 1. Build sur la machine de dev
docker build -t factory-v2:latest .
docker save factory-v2:latest | gzip > factory-v2.tar.gz

# 2. Transférer sur le VPS
scp factory-v2.tar.gz user@vps:/opt/images/

# 3. Charger sur le VPS
ssh user@vps
gunzip -c /opt/images/factory-v2.tar.gz | docker load

# 4. Démarrer le client
cd /opt/clients/nom-client
docker compose up -d
```

### Structure de déploiement recommandée

```
/opt/
├── images/
│   └── factory-v2.tar.gz      # Image Docker pré-buildée
│
└── clients/
    ├── client-a/
    │   ├── docker-compose.yml
    │   └── .env
    │
    ├── client-b/
    │   ├── docker-compose.yml
    │   └── .env
    │
    └── client-c/
        ├── docker-compose.yml
        └── .env
```

### Variables d'environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `BASEROW_API_TOKEN` | ✅ | Token API Baserow |
| `BASEROW_FACTORY_GLOBAL_ID` | ✅ | ID table CONFIG_GLOBAL |
| `BASEROW_FACTORY_SECTIONS_ID` | ✅ | ID table SECTIONS |
| `ADMIN_PASSWORD` | ✅ | PIN admin (6 chiffres) |
| `SITE_NAME` | ❌ | Nom affiché dans l'admin |
| `NEXT_PUBLIC_SITE_URL` | ❌ | URL pour SEO |
| `HOST_PORT` | ❌ | Port local (défaut: 3000) |
| `DOMAIN` | ❌ | Domaine pour Traefik |
| `JWT_SECRET` | ❌ | Clé JWT (auto-générée) |

---

## 🌐 Configuration Traefik

### Exemple docker-compose.yml minimal

```yaml
services:
  website-client:
    image: factory-v2:latest
    container_name: factory-client-patate
    restart: unless-stopped
    environment:
      - BASEROW_API_TOKEN=${BASEROW_API_TOKEN}
      - BASEROW_FACTORY_GLOBAL_ID=${BASEROW_FACTORY_GLOBAL_ID}
      - BASEROW_FACTORY_SECTIONS_ID=${BASEROW_FACTORY_SECTIONS_ID}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.patate.rule=Host(`boulangerie-patate.ch`)"
      - "traefik.http.routers.patate.entrypoints=websecure"
      - "traefik.http.routers.patate.tls.certresolver=myresolver"
      - "traefik.http.services.patate.loadbalancer.server.port=3000"

networks:
  proxy:
    external: true
```

### Avec redirection www

```yaml
labels:
  # Route principale
  - "traefik.http.routers.patate.rule=Host(`www.boulangerie-patate.ch`) || Host(`boulangerie-patate.ch`)"
  # Middleware de redirection
  - "traefik.http.middlewares.patate-www.redirectregex.regex=^https://boulangerie-patate\\.ch/(.*)"
  - "traefik.http.middlewares.patate-www.redirectregex.replacement=https://www.boulangerie-patate.ch/$${1}"
  - "traefik.http.middlewares.patate-www.redirectregex.permanent=true"
  - "traefik.http.routers.patate.middlewares=patate-www"
```

---

## 📦 Types de Sections disponibles

### 1. Hero (`hero`)
Section d'accueil principale avec titre, CTA et animations.

| Champ Content | Type | Description |
|---------------|------|-------------|
| `titre` | string | Titre principal |
| `sousTitre` | string | Sous-titre |
| `badge` | string | Badge au-dessus du titre |
| `ctaPrincipal` | {text, url} | Bouton principal |
| `ctaSecondaire` | {text, url} | Bouton secondaire |
| `trustStats` | array | Statistiques (value, label) |
| `backgroundUrl` | string | Image de fond |
| `videoUrl` | string | Vidéo de fond |

| Champ Design | Options |
|--------------|---------|
| `variant` | Minimal, Corporate, Electric, Bold, AI |
| `height` | Short, Medium, Tall, FullScreen |
| `logoAnimation` | none, spin, pulse, bounce, electric |
| `textAnimation` | None, Gradient, Typing, Fade |

---

### 2. Services (`services`)
Liste de services avec icônes et descriptions.

| Champ Content | Type | Description |
|---------------|------|-------------|
| `titre` | string | Titre de la section |
| `sousTitre` | string | Description |
| `items` | array | Liste des services |
| `items[].titre` | string | Nom du service |
| `items[].description` | string | Description |
| `items[].icone` | string | Nom de l'icône |
| `items[].tags` | array | Tags associés |

| Champ Design | Options |
|--------------|---------|
| `variant` | Grid, Accordion, Cards, Showcase |
| `columns` | 2, 3, 4 |

---

### 3. Avantages (`advantages`)
Points forts de votre offre avec badges.

| Champ Content | Type | Description |
|---------------|------|-------------|
| `titre` | string | Titre de la section |
| `items` | array | Liste des avantages |
| `items[].titre` | string | Titre de l'avantage |
| `items[].description` | string | Description |
| `items[].icone` | string | Icône Lucide |
| `items[].badge` | string | Badge (ex: "10h/semaine") |

---

### 4. Portfolio (`portfolio`)
Galerie de projets réalisés.

| Champ Content | Type | Description |
|---------------|------|-------------|
| `titre` | string | Titre de la section |
| `items` | array | Liste des projets |
| `items[].nom` | string | Nom du projet |
| `items[].description` | string | Description courte |
| `items[].imageUrl` | string | Image de couverture |
| `items[].lienSite` | string | Lien vers le projet |
| `items[].tags` | array | Technologies utilisées |

---

### 5. Témoignages (`testimonials`)
Avis et retours clients.

| Champ Content | Type | Description |
|---------------|------|-------------|
| `titre` | string | Titre de la section |
| `items` | array | Liste des témoignages |
| `items[].nomClient` | string | Nom du client |
| `items[].poste` | string | Poste / Entreprise |
| `items[].message` | string | Témoignage |
| `items[].note` | number | Note sur 5 |
| `items[].photoUrl` | string | Photo du client |

| Champ Design | Options |
|--------------|---------|
| `variant` | Minimal, Carousel, Cards, Video |

---

### 6. FAQ (`faq`)
Questions fréquentes en accordéon.

| Champ Content | Type | Description |
|---------------|------|-------------|
| `titre` | string | Titre de la section |
| `items` | array | Liste des Q&A |
| `items[].question` | string | Question |
| `items[].reponse` | string | Réponse (supporte Markdown) |

| Champ Design | Options |
|--------------|---------|
| `variant` | Minimal, Accordion, Tabs, Search |

---

### 7. Confiance (`trust`)
Éléments de réassurance (certifications, garanties).

| Champ Content | Type | Description |
|---------------|------|-------------|
| `titre` | string | Titre de la section |
| `items` | array | Points de confiance |
| `items[].titre` | string | Titre |
| `items[].description` | string | Description |
| `items[].icone` | string | Icône |
| `items[].badge` | string | Badge |

---

### 8. Galerie (`gallery`)
Galerie d'images avec lightbox.

| Champ Content | Type | Description |
|---------------|------|-------------|
| `titre` | string | Titre de la section |
| `sousTitre` | string | Description |
| `items` | array | Images |
| `items[].titre` | string | Titre de l'image |
| `items[].url` | string | URL de l'image |
| `items[].type` | string | Slider, Grille, Zoom |

| Champ Design | Options |
|--------------|---------|
| `variant` | Grid, Slider, Masonry |
| `columns` | 2, 3, 4, Auto |
| `animation` | None, Fade, Slide, Zoom, Flip |

---

### 9. Contact (`contact`)
Formulaire de contact avec webhooks.

| Champ Content | Type | Description |
|---------------|------|-------------|
| `titre` | string | Titre de la section |
| `sousTitre` | string | Description |
| `webhookUrl` | string | URL n8n pour les soumissions |

| Champ Design | Options |
|--------------|---------|
| `variant` | Minimal, Form, Calendar, Chat |

---

### 10. Blog (`blog`)
Section articles (si activé).

| Champ Design | Options |
|--------------|---------|
| `variant` | Grid, List, Featured |
| `postsPerPage` | number |

---

### 11. AI Assistant (`ai-assistant`)
Chatbot IA intégré.

| Champ Content | Type | Description |
|---------------|------|-------------|
| `welcomeMessage` | string | Message d'accueil |
| `placeholder` | string | Placeholder du champ |
| `systemPrompt` | string | Prompt système |

| Champ Design | Options |
|--------------|---------|
| `style` | Chat, Voice, Banner, Hidden |

---

## 🔧 Administration du site

### Accès à l'admin

```
https://domaine-client.ch/admin/v2
```

### Se connecter

1. Entrer le PIN à 6 chiffres (variable `ADMIN_PASSWORD`)
2. Accéder au dashboard

### Actions disponibles

| Action | Description |
|--------|-------------|
| **Configuration Globale** | Modifier identité, couleurs, SEO, contact |
| **Sections** | Ajouter, supprimer, réorganiser, activer/désactiver |
| **Aperçu** | Voir les changements en temps réel |

### Ajouter une section

1. Cliquer sur **"Ajouter une section"** dans la sidebar
2. Choisir le type de section
3. Configurer le contenu dans le formulaire
4. La section apparaît automatiquement

---

## 🗑️ Suppression d'un client

### Procédure complète

#### 1. Arrêter le container Docker

```bash
cd /opt/clients/nom-client
docker compose down
```

#### 2. Supprimer les fichiers Docker

```bash
rm -rf /opt/clients/nom-client
```

#### 3. Supprimer les données Baserow

1. Ouvrir https://baserow.mick-solutions.ch
2. Aller dans le Workspace du client
3. Supprimer la Database `FACTORY_V2`
4. Supprimer le Workspace

#### 4. Supprimer le Token API

1. Baserow → Settings → API Tokens
2. Delete le token du client

#### 5. DNS (si applicable)

Supprimer les enregistrements A du domaine.

> ⚠️ **ATTENTION**: Ces actions sont irréversibles. Faites une sauvegarde avant !

---

## 🔥 Troubleshooting

### Le site affiche "Configuration Requise"

**Cause**: Variables d'environnement manquantes.

**Solution**:
```bash
# Vérifier les variables
docker exec -it factory-client-xxx env | grep BASEROW

# S'assurer que toutes sont définies:
# - BASEROW_API_TOKEN
# - BASEROW_FACTORY_GLOBAL_ID
# - BASEROW_FACTORY_SECTIONS_ID
```

### Erreur 401 sur /admin

**Cause**: `ADMIN_PASSWORD` non défini ou incorrect.

**Solution**:
```bash
# Vérifier la variable
docker exec -it factory-client-xxx printenv ADMIN_PASSWORD
```

### Les images ne s'affichent pas

**Cause**: URLs Baserow non autorisées dans `next.config.mjs`.

**Solution**: Les images de `baserow.mick-solutions.ch` sont autorisées par défaut.
Pour d'autres domaines, modifier `next.config.mjs`.

### Container ne démarre pas

```bash
# Voir les logs
docker logs factory-client-xxx

# Vérifier le healthcheck
docker inspect factory-client-xxx | grep -A 20 Health
```

### Rebuild complet

```bash
# Arrêter et supprimer
docker compose down

# Rebuild sans cache
docker compose build --no-cache

# Redémarrer
docker compose up -d
```

---

## 📚 Commandes utiles

```bash
# === PROVISIONING ===
npm run client:new "Nom"           # Créer un nouveau client
npx tsx scripts/setup-factory-db.ts # Setup initial (une fois)

# === DOCKER ===
docker compose up -d               # Démarrer
docker compose down                # Arrêter
docker compose logs -f             # Voir les logs
docker compose restart             # Redémarrer

# === DEBUG ===
docker exec -it CONTAINER sh       # Shell dans le container
docker stats                       # Voir les ressources
```

---

## 📞 Support

Pour toute question technique, contacter l'équipe Mick Solutions:
- **Email**: support@mick-solutions.ch
- **Documentation**: https://docs.mick-solutions.ch/factory

---

*Factory V2 - White Label Architecture © 2025 Mick Solutions*

