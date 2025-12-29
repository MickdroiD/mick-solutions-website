# 🏭 Template White Label - Mick Solutions

> **Version** : 1.0.0 | **Testé** : ✅ Build Production OK | **Date** : Décembre 2025

Ce document décrit la structure complète pour déployer un nouveau site client en **moins de 30 minutes**.

---

## 🎯 Concept

**Un code, des centaines de clients.**

Chaque client a sa propre base de données Baserow. Le même code Next.js se connecte à la base du client via une simple variable d'environnement.

```
┌─────────────────┐     ┌──────────────────┐
│   Code Next.js  │────▶│  Baserow Client A │  → site-client-a.ch
│   (identique)   │────▶│  Baserow Client B │  → site-client-b.ch
│                 │────▶│  Baserow Client C │  → site-client-c.ch
└─────────────────┘     └──────────────────┘
```

---

## 📊 Vue d'ensemble des Tables

| Table | ID Mick Solutions | Description | Obligatoire |
|-------|-------------------|-------------|-------------|
| **SITEWEB Global_Infos** | 751 | Configuration globale du site | ✅ Oui |
| **SITEWEB services** | 748 | Liste des services proposés | ✅ Oui |
| **SITEWEB projets** | 749 | Portfolio / réalisations | Optionnel |
| **SITEWEB Temoignages** | 750 | Avis clients | Optionnel |
| **SITEWEB FAQ** | 752 | Questions fréquentes | Optionnel |
| **SITEWEB Legal_Docs** | 753 | Documents légaux (CGV, etc.) | ✅ Oui |

> ⚠️ **Note** : Les IDs changent lors de la duplication. Adaptez les variables d'environnement.

---

## 📋 Table : SITEWEB Global_Infos

**Cette table contient UNE SEULE LIGNE avec toute la configuration du site.**

### Champs actuels (Mick Solutions - Table 751)

| Champ | Valeur actuelle | Description |
|-------|-----------------|-------------|
| **HERO** |||
| `Titre Hero` | `Gagnez du temps. Économisez de l'argent. Restez concentrés.` | Titre principal (3 phrases avec `.`) |
| `Sous-titre Hero` | `L'automatisation sur-mesure pour les PME suisses...` | Sous-titre descriptif |
| **CONTACT** |||
| `Email` | `contact@mick-solutions.ch` | Email principal |
| `Lien Linkedin` | `https://linkedin.com/in/michael-music` | Page LinkedIn |
| `Lien Bouton Appel` | `https://cal.com/music-michael/audit-gratuit` | Lien Calendly/Cal.com |

### Champs avec valeurs par défaut (code)

Ces champs utilisent des valeurs par défaut si non présents dans Baserow :

| Champ | Valeur par défaut | À créer dans Baserow ? |
|-------|-------------------|------------------------|
| `Nom Site` | `Mick Solutions` | Recommandé |
| `Slogan` | `Automatisation sur-mesure pour PME` | Recommandé |
| `Initiales Logo` | `MS` | Recommandé |
| `Meta Titre` | `Mick Solutions \| Automatisation sur-mesure...` | Recommandé |
| `Meta Description` | `Expert DevOps et automatisation...` | Recommandé |
| `Site URL` | `https://www.mick-solutions.ch` | ✅ Obligatoire |
| `Mots Cles` | `DevOps, automatisation, n8n, Suisse...` | Optionnel |
| `Langue` | `fr` | Optionnel |
| `Locale` | `fr_CH` | Optionnel |
| `Couleur Primaire` | `#0ea5e9` | Optionnel |
| `Couleur Accent` | `#8b5cf6` | Optionnel |
| `Adresse` | `Genève, Suisse` | Recommandé |
| `Badge Hero` | `Automatisation intelligente` | Optionnel |
| `CTA Principal` | `Demander un audit gratuit` | Optionnel |
| `CTA Secondaire` | `Découvrir nos services` | Optionnel |
| `Trust Stat 1 Value` | `100%` | Optionnel |
| `Trust Stat 1 Label` | `Données en Suisse` | Optionnel |
| `Trust Stat 2 Value` | `24/7` | Optionnel |
| `Trust Stat 2 Label` | `Automatisation` | Optionnel |
| `Trust Stat 3 Value` | `0` | Optionnel |
| `Trust Stat 3 Label` | `Coûts cachés` | Optionnel |
| `Copyright Texte` | `© 2025 Mick Solutions. Tous droits réservés.` | Recommandé |
| `Pays Hebergement` | `Suisse` | Optionnel |

### Champs Analytics (optionnels)

| Champ | Type | Description |
|-------|------|-------------|
| `Umami Site ID` | Text | ID du site Umami |
| `Umami Script URL` | URL | URL du script Umami |

---

## 📋 Table : SITEWEB services

| Champ | Type | Exemple | Obligatoire |
|-------|------|---------|-------------|
| `Titre` | Text | `Automatisation Email` | ✅ |
| `Description` | Long Text | `Triez, classez et répondez...` | ✅ |
| `Icone` | Text | `mail` | ✅ |
| `Ordre` | Number | `1` | ✅ |

### Icônes disponibles (Lucide)

```
mail, database, shield, filetext, users, barchart3, 
server, bot, code2, zap, globe, settings, cpu, cloud, 
lock, workflow, calendar, creditcard, briefcase, rocket
```

---

## 📋 Table : SITEWEB projets

| Champ | Type | Exemple | Obligatoire |
|-------|------|---------|-------------|
| `Nom` | Text | `Dashboard Analytics` | ✅ |
| `Slug` | Text | `dashboard-analytics` | ✅ |
| `Description courte` | Long Text | `Solution de monitoring...` | ✅ |
| `Image de couverture` | File | Image 16:9 | Recommandé |
| `Lien du site` | URL | `https://client.ch` | Optionnel |
| `Tags` | Multiple Select | `n8n`, `Web`, `Design` | Optionnel |
| `Statut` | Single Select | `Publié` / `Brouillon` | ✅ |
| `Ordre` | Number | `1` | ✅ |

---

## 📋 Table : SITEWEB Temoignages

| Champ | Type | Exemple | Obligatoire |
|-------|------|---------|-------------|
| `Nom du client` | Text | `Jean Dupont` | ✅ |
| `Poste / Entreprise` | Text | `CEO, Entreprise SA` | ✅ |
| `Message` | Long Text | `Excellent service...` | ✅ |
| `Note` | Number | `5` | ✅ |
| `Photo` | File | Image carrée | Optionnel |
| `Afficher` | Boolean | `true` | ✅ |

---

## 📋 Table : SITEWEB FAQ

| Champ | Type | Exemple | Obligatoire |
|-------|------|---------|-------------|
| `Question` | Text | `Combien coûte...` | ✅ |
| `Reponse` | Long Text | `Nos tarifs commencent...` | ✅ |
| `Ordre` | Number | `1` | ✅ |

---

## 📋 Table : SITEWEB Legal_Docs

| Champ | Type | Exemple | Obligatoire |
|-------|------|---------|-------------|
| `Titre` | Text | `Mentions légales` | ✅ |
| `Slug` | Text | `mentions-legales` | ✅ |
| `Contenu` | Long Text | Markdown | ✅ |
| `Date_Mise_a_jour` | Date | `2025-01-01` | ✅ |
| `Is_Active` | Boolean | `true` | ✅ |

### Documents recommandés

| Slug | Titre |
|------|-------|
| `mentions-legales` | Mentions légales |
| `politique-confidentialite` | Politique de confidentialité |
| `cgv` | Conditions générales de vente |

---

## 🚀 Guide de déploiement (Nouveau Client)

### Étape 1 : Dupliquer la base Baserow (5 min)

1. Ouvrir Baserow → Base "Mick Solutions"
2. Cliquer sur **⋮** → **Duplicate database**
3. Nommer : `CLIENT_NOM_SITEWEB`
4. **Noter les nouveaux IDs** des tables

### Étape 2 : Personnaliser les données (15 min)

```
□ Table Global_Infos : Modifier tous les champs
□ Table services : Adapter ou conserver
□ Table projets : Supprimer et recréer
□ Table Legal_Docs : Personnaliser avec infos client
□ Table Temoignages : Vider ou adapter
□ Table FAQ : Adapter
```

### Étape 3 : Générer un token API (2 min)

1. Baserow → **Settings** → **API Tokens**
2. **Create Token** avec les permissions :
   - ✅ Read sur toutes les tables SITEWEB
   - ✅ Write (optionnel, pour formulaire contact)

### Étape 4 : Configurer les variables (2 min)

Créer un fichier `.env.production` :

```bash
# Token API Baserow
BASEROW_API_TOKEN=le_token_du_client

# URLs
NEXT_PUBLIC_SITE_URL=https://www.client-site.ch

# (Optionnel) Analytics
NEXT_PUBLIC_UMAMI_SITE_ID=xxx
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://analytics.example.ch/script.js
```

### Étape 5 : Build et déploiement (5 min)

```bash
# Build Docker
docker build -t client-website .

# Run avec les variables
docker run -d \
  --name client-website \
  -p 3000:3000 \
  -e BASEROW_API_TOKEN=$BASEROW_API_TOKEN \
  client-website
```

### Étape 6 : Configuration DNS

Configurer le domaine pour pointer vers le serveur.

---

## 🎨 Personnalisation des couleurs

### Via Baserow (recommandé)

Ajouter les champs dans la table Global_Infos :
- `Couleur Primaire` : `#0ea5e9`
- `Couleur Accent` : `#8b5cf6`

### Palettes recommandées

| Style | Primaire | Accent | Preview |
|-------|----------|--------|---------|
| **Cyan/Violet** (défaut) | `#0ea5e9` | `#8b5cf6` | 🔵🟣 |
| **Bleu/Orange** | `#3b82f6` | `#f97316` | 🔵🟠 |
| **Vert/Rose** | `#10b981` | `#ec4899` | 🟢🩷 |
| **Rouge/Jaune** | `#ef4444` | `#eab308` | 🔴🟡 |
| **Indigo/Teal** | `#6366f1` | `#14b8a6` | 🟣🩵 |
| **Noir/Or** | `#1f2937` | `#d97706` | ⚫🟡 |

---

## ✅ Checklist nouveau client

### Obligatoire

- [ ] Base Baserow dupliquée
- [ ] Token API généré
- [ ] Table Global_Infos : Email, Téléphone, Adresse
- [ ] Table Global_Infos : Titre Hero, Sous-titre Hero
- [ ] Table Global_Infos : Liens (LinkedIn, Cal.com)
- [ ] Table services : Au moins 3 services
- [ ] Table Legal_Docs : 3 documents (mentions, confidentialité, CGV)
- [ ] Variables d'environnement configurées
- [ ] Test local OK (`npm run build`)
- [ ] Déploiement production

### Recommandé

- [ ] Logo personnalisé uploadé
- [ ] Image OG (1200x630) créée
- [ ] Couleurs de marque définies
- [ ] Témoignages ajoutés
- [ ] Projets du portfolio
- [ ] FAQ personnalisée
- [ ] Analytics configuré (Umami)

---

## 🔧 Dépannage

### Le site affiche les valeurs par défaut

**Cause** : Les champs n'existent pas dans Baserow ou sont vides.

**Solution** : Vérifier que les champs sont créés ET remplis.

### Erreur "Cannot fetch data from Baserow"

**Cause** : Token API invalide ou permissions manquantes.

**Solution** : Vérifier le token et ses permissions (Read sur toutes les tables).

### Les couleurs ne changent pas

**Cause** : Les champs `Couleur Primaire` et `Couleur Accent` n'existent pas.

**Solution** : Créer les champs dans Baserow ou modifier `globals.css`.

### Images non affichées

**Cause** : Domaine non autorisé dans `next.config.mjs`.

**Solution** : Ajouter le domaine dans `images.remotePatterns`.

---

## 📁 Structure du projet

```
mick-solutions-website/
├── src/
│   ├── app/
│   │   ├── layout.tsx        ← Métadonnées dynamiques
│   │   ├── page.tsx          ← Page d'accueil
│   │   └── legal/[slug]/     ← Pages légales
│   ├── components/
│   │   ├── Header.tsx        ← Navigation dynamique
│   │   ├── Footer.tsx        ← Contact dynamique
│   │   ├── HeroSection.tsx   ← Hero dynamique
│   │   └── GlobalStyles.tsx  ← Injection CSS couleurs
│   └── lib/
│       ├── baserow.ts        ← Client API Baserow
│       └── types/
│           └── global-settings.ts
├── public/
│   ├── logo.svg
│   └── favicon.ico
├── next.config.mjs           ← output: 'standalone'
├── Dockerfile
└── docker-compose.yml
```

---

## 📈 Évolutions futures

- [ ] **Multi-langue** : Support i18n avec tables par langue
- [ ] **Thèmes** : Choix entre plusieurs designs
- [ ] **Blog** : Table SITEWEB Blog avec articles
- [ ] **E-commerce** : Intégration Stripe
- [ ] **Dashboard client** : Interface Baserow simplifiée

---

## 🆘 Support

Pour toute question sur ce template :
- **Email** : contact@mick-solutions.ch
- **Documentation** : Ce fichier
- **Code source** : Repository Git privé

---

*Dernière mise à jour : 23 Décembre 2025*
*Version testée : Next.js 14.2.35 + Baserow*
