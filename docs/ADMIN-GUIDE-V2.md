# 🏭 GUIDE ADMINISTRATEUR COMPLET - Factory V2

> **Version**: 2.0 | **Date**: Décembre 2025 | **Auteur**: Mick Solutions

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#-vue-densemble)
2. [Prérequis](#-prérequis)
3. [Création d'un nouveau client](#-création-dun-nouveau-client)
4. [Configuration du site](#-configuration-du-site)
5. [Déploiement](#-déploiement)
6. [Maintenance](#-maintenance)
7. [Suppression d'un client](#-suppression-dun-client)
8. [Troubleshooting](#-troubleshooting)

---

## 🎯 VUE D'ENSEMBLE

### Architecture Factory V2

```
┌─────────────────────────────────────────────────────────────┐
│                    CODE SOURCE (GitHub)                      │
│                 Next.js 14 + Tailwind + Framer               │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Baserow  │   │ Baserow  │   │ Baserow  │
    │ Client A │   │ Client B │   │ Client C │
    │ Database │   │ Database │   │ Database │
    └────┬─────┘   └────┬─────┘   └────┬─────┘
         │              │              │
         ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Docker   │   │ Docker   │   │ Docker   │
    │Container │   │Container │   │Container │
    └────┬─────┘   └────┬─────┘   └────┬─────┘
         │              │              │
         ▼              ▼              ▼
    site-a.ch      site-b.ch      site-c.ch
```

### Structure des données V2

Chaque client dispose de **3 tables Baserow**:

| Table | Contenu | Format |
|-------|---------|--------|
| **CONFIG_GLOBAL** | Configuration globale (1 row) | JSON dans chaque colonne |
| **SECTIONS** | Sections du site (N rows) | Type + Content JSON + Design JSON |
| **LEADS** | Contacts CRM (optionnel) | Formulaires reçus |

---

## ⚙️ PRÉREQUIS

### Outils nécessaires

- ✅ Node.js 18+ installé
- ✅ Docker + Docker Compose
- ✅ Accès SSH au VPS
- ✅ Accès admin à Baserow

### Variables d'environnement requises

```bash
# Baserow (obligatoire)
BASEROW_API_TOKEN=your_token
BASEROW_API_URL=https://baserow.mick-solutions.ch/api

# Authentification admin (obligatoire)
ADMIN_PASSWORD=123456  # PIN 6 chiffres

# IDs tables Factory V2 (générés par le script)
BASEROW_FACTORY_GLOBAL_ID=xxx
BASEROW_FACTORY_SECTIONS_ID=xxx
BASEROW_FACTORY_LEADS_ID=xxx

# Optionnel
SITE_NAME=Nom du Site
NEXT_PUBLIC_SITE_URL=https://example.ch
```

---

## 🆕 CRÉATION D'UN NOUVEAU CLIENT

### Méthode 1: Script automatique (Recommandé)

```bash
# 1. Se placer dans le dossier website
cd /home/mickadmin/docker/website

# 2. Exécuter le script de création
npm run client:new "Nom du Client"
# ou
npx tsx scripts/create-client.ts "Boulangerie Martin"
```

**Le script va:**
1. ✅ Créer un nouveau Workspace Baserow
2. ✅ Créer les 3 tables (CONFIG_GLOBAL, SECTIONS, LEADS)
3. ✅ Configurer les champs et types
4. ✅ Créer une section Hero par défaut
5. ✅ Générer le PIN admin
6. ✅ Afficher les variables d'environnement

**Output du script:**
```
🚀 CONFIGURATION POUR DOCKER:
───────────────────────────────────────
BASEROW_API_TOKEN=xxx
BASEROW_FACTORY_GLOBAL_ID=808
BASEROW_FACTORY_SECTIONS_ID=809
BASEROW_FACTORY_LEADS_ID=810
ADMIN_PASSWORD=847291
───────────────────────────────────────
```

### Méthode 2: Création manuelle

#### Étape 1: Créer le Workspace Baserow

1. Ouvrir https://baserow.mick-solutions.ch
2. Créer un nouveau Workspace: `CLIENT - Nom du Client`
3. Créer une Database: `FACTORY_V2`

#### Étape 2: Créer la table CONFIG_GLOBAL

| Champ | Type | Description |
|-------|------|-------------|
| Nom | Text | Nom du site |
| SEO_Metadata | Long Text | JSON SEO |
| Branding | Long Text | JSON couleurs/fonts |
| Contact | Long Text | JSON contact |
| Integrations | Long Text | JSON analytics/webhooks |
| Assets | Long Text | JSON logos/images |
| AI_Config | Long Text | JSON config IA |
| Animations | Long Text | JSON animations |
| Premium | Long Text | JSON features premium |
| Footer | Long Text | JSON footer |
| Actif | Boolean | Site actif |
| Notes | Long Text | Notes internes |

#### Étape 3: Créer la table SECTIONS

| Champ | Type | Options |
|-------|------|---------|
| Nom | Text | - |
| Type | Single Select | hero, services, advantages, gallery, portfolio, testimonials, trust, faq, contact, blog, ai-assistant, custom |
| Is_Active | Boolean | Default: true |
| Order | Number | Ordre d'affichage |
| Content | Long Text | JSON contenu |
| Design | Long Text | JSON design |
| Page | Text | Default: "home" |
| Notes | Long Text | - |
| Actif | Boolean | - |

#### Étape 4: Créer la table LEADS (optionnel)

| Champ | Type |
|-------|------|
| Name | Text |
| Email | Email |
| Phone | Text |
| Message | Long Text |
| Status | Single Select (New, Contacted, Qualified, Closed, Lost) |
| Source | Text |
| Created_At | Date |
| Notes | Long Text |

#### Étape 5: Créer le Token API

1. Baserow → Settings → API Tokens
2. Create token: `API_NomClient`
3. Permissions: Read + Create + Update + Delete sur les 3 tables
4. **Copier le token immédiatement** (ne sera plus visible)

---

## ⚙️ CONFIGURATION DU SITE

### Accéder à l'admin

```
https://domaine-client.ch/admin/v2
```

Entrer le PIN à 6 chiffres (ADMIN_PASSWORD).

### Configuration Globale

L'admin V2 permet de configurer:

| Section | Contenu |
|---------|---------|
| **Identité** | Nom, slogan, initiales logo |
| **SEO** | Meta titre, description, URL |
| **Branding** | Couleurs primaire/accent, fonts |
| **Contact** | Email, téléphone, réseaux sociaux |
| **Assets** | Logo, favicon, OG image |
| **Footer** | Copyright, liens |

### Gestion des Sections

#### Types de sections disponibles

| Type | Description | Formulaire admin |
|------|-------------|------------------|
| `hero` | Section d'accueil | HeroForm.tsx |
| `services` | Liste de services | ServicesForm.tsx |
| `advantages` | Points forts | AdvantagesForm.tsx |
| `gallery` | Galerie images | GalleryForm.tsx |
| `portfolio` | Projets réalisés | PortfolioForm.tsx |
| `testimonials` | Témoignages clients | TestimonialsForm.tsx |
| `trust` | Éléments de confiance | TrustForm.tsx |
| `faq` | Questions fréquentes | FAQForm.tsx |
| `contact` | Formulaire contact | ContactForm.tsx |
| `blog` | Articles (si activé) | BlogForm.tsx |
| `ai-assistant` | Chatbot IA | AIAssistantForm.tsx |
| `custom` | HTML personnalisé | CustomForm.tsx |

#### Ajouter une section

1. Dans l'admin V2, cliquer sur **"+ Ajouter"** sous SECTIONS
2. Choisir le type de section
3. Configurer le contenu et le design
4. La section est automatiquement sauvegardée

#### Réorganiser les sections

Les sections ont un champ `Order` qui définit leur position.
Modifier l'ordre dans le formulaire de chaque section.

#### Activer/Désactiver une section

Le toggle `Is_Active` permet de masquer une section sans la supprimer.

### Médiathèque

L'admin V2 inclut une **médiathèque** pour gérer les images:

1. Dans un champ image, cliquer sur **"📁 Médiathèque"**
2. Parcourir les images existantes
3. Uploader une nouvelle image
4. Sélectionner pour l'utiliser

**Dossiers disponibles:**
- `/uploads/branding/` - Logos, favicon
- `/uploads/hero/` - Images de fond hero
- `/uploads/gallery/` - Images galerie
- `/uploads/logos/` - Logos partenaires

---

## 🚀 DÉPLOIEMENT

### Option A: Docker sur VPS (Recommandé)

#### 1. Préparer le dossier client

```bash
# Créer le dossier
mkdir -p /opt/clients/nom-client
cd /opt/clients/nom-client

# Créer le fichier .env
cat > .env << 'EOF'
BASEROW_API_TOKEN=xxx
BASEROW_API_URL=https://baserow.mick-solutions.ch/api
BASEROW_FACTORY_GLOBAL_ID=808
BASEROW_FACTORY_SECTIONS_ID=809
BASEROW_FACTORY_LEADS_ID=810
ADMIN_PASSWORD=123456
SITE_NAME=Nom du Site
NEXT_PUBLIC_SITE_URL=https://nom-client.ch
EOF
```

#### 2. Créer docker-compose.yml

```yaml
services:
  website:
    image: factory-v2:latest
    container_name: client-nom-web
    restart: unless-stopped
    env_file:
      - .env
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nom-client.rule=Host(`nom-client.ch`) || Host(`www.nom-client.ch`)"
      - "traefik.http.routers.nom-client.entrypoints=websecure"
      - "traefik.http.routers.nom-client.tls.certresolver=myresolver"
      - "traefik.http.services.nom-client.loadbalancer.server.port=3000"

networks:
  proxy:
    external: true
```

#### 3. Lancer le container

```bash
docker compose up -d
```

### Configuration DNS

Ajouter les enregistrements DNS:

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | IP_DU_VPS |
| A | www | IP_DU_VPS |

---

## 🔧 MAINTENANCE

### Mises à jour du code

```bash
# Sur le VPS principal
cd /home/mickadmin/docker/website
git pull origin main
npm run build

# Rebuild l'image Docker
docker build -t factory-v2:latest .

# Redémarrer les clients
cd /opt/clients/nom-client
docker compose down
docker compose up -d
```

### Sauvegardes Baserow

```bash
# Export manuel via l'interface Baserow
Workspace → Export → JSON
```

### Monitoring

```bash
# Voir les logs
docker logs client-nom-web --tail 100 -f

# Statut des containers
docker ps

# Ressources utilisées
docker stats
```

---

## 🗑️ SUPPRESSION D'UN CLIENT

### ⚠️ ATTENTION: Actions irréversibles

La suppression d'un client implique:
1. Supprimer les données Baserow
2. Arrêter et supprimer le container Docker
3. Supprimer les fichiers de configuration
4. Libérer le domaine

### Procédure de suppression

#### Étape 1: Backup (recommandé)

```bash
# Exporter les données Baserow avant suppression
# Dans Baserow: Workspace → Export → JSON
```

#### Étape 2: Arrêter le container

```bash
cd /opt/clients/nom-client
docker compose down
```

#### Étape 3: Supprimer les fichiers Docker

```bash
rm -rf /opt/clients/nom-client
```

#### Étape 4: Supprimer les données Baserow

1. Ouvrir https://baserow.mick-solutions.ch
2. Aller dans le Workspace du client
3. Supprimer la Database `FACTORY_V2`
4. Supprimer le Workspace complet

#### Étape 5: Supprimer le Token API

1. Baserow → Settings → API Tokens
2. Trouver le token `API_NomClient`
3. Delete

#### Étape 6: Libérer le domaine

1. Supprimer les labels Traefik (déjà fait avec docker-compose down)
2. Supprimer les enregistrements DNS si nécessaire

### Script de suppression (à créer si besoin)

```bash
#!/bin/bash
# delete-client.sh

CLIENT_NAME=$1

echo "⚠️ Suppression du client: $CLIENT_NAME"
echo "Cette action est IRRÉVERSIBLE !"
read -p "Confirmez (oui/non): " confirm

if [ "$confirm" != "oui" ]; then
    echo "Annulé."
    exit 1
fi

# Arrêter le container
docker compose -f /opt/clients/$CLIENT_NAME/docker-compose.yml down

# Supprimer les fichiers
rm -rf /opt/clients/$CLIENT_NAME

echo "✅ Client $CLIENT_NAME supprimé (Docker uniquement)"
echo "⚠️ N'oubliez pas de supprimer manuellement:"
echo "   - Workspace Baserow"
echo "   - Token API"
echo "   - DNS"
```

---

## 🔥 TROUBLESHOOTING

### Le site affiche une erreur 500

**Causes possibles:**
- Variables d'environnement manquantes
- Token API invalide
- IDs de tables incorrects

**Solution:**
```bash
# Vérifier les variables
docker exec client-nom-web printenv | grep BASEROW
```

### L'admin affiche "Non autorisé"

**Cause:** `ADMIN_PASSWORD` non défini ou incorrect.

**Solution:**
```bash
docker exec client-nom-web printenv ADMIN_PASSWORD
```

### Les modifications ne s'affichent pas

**Cause:** Cache Next.js

**Solution:**
```bash
# Redémarrer le container
docker compose restart

# Ou forcer la revalidation dans l'admin
# (le bouton refresh dans l'aperçu)
```

### Container ne démarre pas

```bash
# Voir les logs
docker logs client-nom-web

# Vérifier les ressources
docker stats
df -h
```

### Erreur SSL/TLS

**Cause:** Certificat non généré par Traefik

**Solution:**
1. Vérifier la configuration DNS
2. Vérifier les labels Traefik
3. Attendre 2-3 minutes (génération Let's Encrypt)

---

## 📞 SUPPORT

- **Email**: support@mick-solutions.ch
- **Documentation**: https://docs.mick-solutions.ch/factory

---

*Factory V2 - Guide Administrateur © 2025 Mick Solutions*

