# 🏭 GUIDE COMPLET - Création d'un Nouveau Client White Label

> **Version** : 1.0 | **Auteur** : Mick Solutions | **Date** : Décembre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#-vue-densemble)
2. [Ce que le client doit fournir](#-ce-que-le-client-doit-fournir)
3. [Ce à quoi le client aura accès](#-ce-à-quoi-le-client-aura-accès)
4. [Procédure de création pas à pas](#-procédure-de-création-pas-à-pas)
5. [Configuration des tables Baserow](#-configuration-des-tables-baserow)
6. [Déploiement Docker](#-déploiement-docker)
7. [Maintenance et mises à jour](#-maintenance-et-mises-à-jour)

---

## 🎯 VUE D'ENSEMBLE

### Concept
Un seul code source Next.js → Plusieurs sites clients différents.
Chaque client a sa propre base de données Baserow qui contrôle **100% du contenu**.

### Architecture
```
┌─────────────────────────┐
│   Code Next.js (GitHub) │
│   (identique pour tous) │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌─────────┐
│ Baserow │   │ Baserow │
│ Client A│   │ Client B│
└────┬────┘   └────┬────┘
     │             │
     ▼             ▼
┌─────────┐   ┌─────────┐
│ site-a  │   │ site-b  │
│  .ch    │   │  .ch    │
└─────────┘   └─────────┘
```

---

## 📦 CE QUE LE CLIENT DOIT FOURNIR

### ✅ OBLIGATOIRE

| Élément | Description | Exemple |
|---------|-------------|---------|
| **Nom de l'entreprise** | Nom officiel | "Tech Solutions SA" |
| **Slogan** | Phrase d'accroche (max 100 car.) | "L'innovation au service de votre succès" |
| **Email de contact** | Email principal | contact@tech-solutions.ch |
| **Adresse** | Ville/Région | "Lausanne, Suisse" |
| **Nom de domaine** | Domaine acheté | tech-solutions.ch |
| **Titre Hero** | Titre principal du site | "Transformez votre entreprise" |
| **Sous-titre Hero** | Description sous le titre | "Solutions digitales sur-mesure..." |
| **Texte CTA principal** | Bouton principal | "Demander un devis" |
| **Lien CTA** | URL du bouton (Calendly, etc.) | https://calendly.com/... |

### 📝 RECOMMANDÉ

| Élément | Description | Format |
|---------|-------------|--------|
| **Logo** | Logo en PNG/SVG | 200x60px min |
| **Favicon** | Icône navigateur | 32x32px .ico/.png |
| **Couleur primaire** | Couleur de marque | #HEX (ex: #3B82F6) |
| **Couleur accent** | Couleur secondaire | #HEX (ex: #8B5CF6) |
| **LinkedIn** | Profil entreprise | URL complète |
| **Téléphone** | Numéro de contact | +41 XX XXX XX XX |

### 📄 CONTENU À RÉDIGER

| Section | Nombre | Longueur |
|---------|--------|----------|
| **Services** | 3-6 | Titre (50 car.) + Description (200 car.) |
| **Avantages** | 3-4 | Badge (20 car.) + Titre + Description |
| **Points de confiance** | 3-4 | Badge + Titre + Description |
| **FAQ** | 3-10 | Question + Réponse |
| **Témoignages** | 1-5 | Nom + Poste + Message + Note (1-5) |
| **Projets/Portfolio** | 0-10 | Nom + Description + Image + URL |

### ⚖️ DOCUMENTS LÉGAUX (Obligatoires)

| Document | Responsabilité |
|----------|----------------|
| **Mentions légales** | Client fournit les infos, tu rédiges |
| **Politique de confidentialité** | Client fournit les infos, tu rédiges |
| **CGV** | Client fournit ou tu proposes un template |

---

## 🔓 CE À QUOI LE CLIENT AURA ACCÈS

### ✅ ACCÈS COMPLET (Baserow)

Le client reçoit un accès à sa base Baserow avec les tables suivantes :

| Table | Contrôle | Exemple de modification |
|-------|----------|-------------------------|
| **Global_Infos** | Identité du site | Changer le titre, email, couleurs |
| **Services** | Liste des services | Ajouter/modifier/supprimer des services |
| **Projets** | Portfolio | Ajouter de nouveaux projets réalisés |
| **Témoignages** | Avis clients | Ajouter des témoignages |
| **FAQ** | Questions fréquentes | Modifier les Q&R |
| **Legal_Docs** | Pages légales | Mettre à jour les mentions |
| **Avantages** | Section "Pourquoi nous" | Personnaliser les arguments |
| **Trust_Points** | Points de confiance | Modifier les garanties |

### 🔄 MISE À JOUR AUTOMATIQUE

```
Client modifie Baserow → ≤60 secondes → Site mis à jour
```

**Aucune intervention technique requise !**

### ❌ CE QUE LE CLIENT NE PEUT PAS FAIRE

| Action | Raison |
|--------|--------|
| Modifier le code | Pas d'accès au code source |
| Changer la structure | Design fixe (personnalisable via couleurs) |
| Ajouter des pages | Architecture définie |
| Installer des plugins | Pas de CMS traditionnel |

---

## 🚀 PROCÉDURE DE CRÉATION PAS À PAS

### ÉTAPE 1 : Préparation (15 min)

1. **Collecter les informations client** (voir liste ci-dessus)
2. **Acheter/configurer le domaine** (ou demander au client)
3. **Préparer les assets** (logo, favicon, images)

### ÉTAPE 2 : Duplication Baserow (10 min)

```
1. Ouvrir Baserow → Base "Mick Solutions"
2. Cliquer ⋮ → "Duplicate database"
3. Nommer : "CLIENT_[NOM]_SITEWEB"
4. Noter les IDs des tables créées
```

**Tables à dupliquer :**
- SITEWEB Global_Infos → Noter l'ID
- SITEWEB services → Noter l'ID
- SITEWEB projets → Noter l'ID
- SITEWEB Temoignages → Noter l'ID
- SITEWEB FAQ → Noter l'ID
- SITEWEB Legal_Docs → Noter l'ID
- SITEWEB Avantages → Noter l'ID
- SITEWEB Trust_Points → Noter l'ID

### ÉTAPE 3 : Création du Token API (5 min)

```
1. Baserow → Settings → API tokens
2. Cliquer "Create token"
3. Nommer : "API_[NOM_CLIENT]"
4. Permissions : Read + Create + Update sur les tables du client
5. Copier le token (IMPORTANT : ne sera plus visible après)
```

### ÉTAPE 4 : Configuration des données (30-60 min)

Remplir chaque table avec les données du client :

#### Table Global_Infos (ID: XXX)

| Champ | Valeur à remplir |
|-------|------------------|
| Email | [email client] |
| Titre Hero | [titre fourni] |
| Sous-titre Hero | [sous-titre fourni] |
| Lien Bouton Appel | [URL Calendly/Cal.com] |
| Lien Linkedin | [URL LinkedIn] |
| Nom Site | [nom entreprise] |
| Slogan | [slogan] |
| Adresse | [ville, pays] |
| Meta Titre | [titre SEO] |
| Meta Description | [description SEO ~160 car.] |
| Site URL | https://[domaine-client].ch |
| Couleur Primaire | [#HEX] |
| Couleur Accent | [#HEX] |
| Copyright Texte | © 2025 [Nom]. Tous droits réservés. |

#### Table Services (ID: XXX)

| # | Titre | Description | Icône | Ordre |
|---|-------|-------------|-------|-------|
| 1 | [Service 1] | [Description] | [lucide-icon] | 1 |
| 2 | [Service 2] | [Description] | [lucide-icon] | 2 |
| 3 | [Service 3] | [Description] | [lucide-icon] | 3 |

**Icônes disponibles** : `bot`, `database`, `lineChart`, `mail`, `calendar`, `shield`, `zap`, `settings`, `users`, `globe`

#### Table Avantages (ID: XXX)

| Badge | Titre | Description | Icône | Ordre |
|-------|-------|-------------|-------|-------|
| [badge court] | [titre] | [description ~100 car.] | piggyBank | 1 |
| ... | ... | ... | target | 2 |

**Icônes** : `piggyBank`, `target`, `sparkles`, `settings`, `clock`, `shield`

#### Table Trust_Points (ID: XXX)

| Badge | Titre | Description | Icône | Ordre |
|-------|-------|-------------|-------|-------|
| [badge] | [titre] | [description] | mapPin | 1 |
| ... | ... | ... | building2 | 2 |

**Icônes** : `mapPin`, `building2`, `shieldCheck`, `lock`, `award`

#### Table Legal_Docs (ID: XXX)

| Titre | Slug | Contenu | Is_Active |
|-------|------|---------|-----------|
| Mentions Légales | mentions-legales | [contenu Markdown] | ✅ |
| Politique de Confidentialité | confidentialite | [contenu Markdown] | ✅ |
| CGV | cgv | [contenu Markdown] | ✅ |

### ÉTAPE 5 : Déploiement Docker (15 min)

#### Option A : Nouveau conteneur sur le même VPS

```bash
# Créer le dossier du client
mkdir -p /home/mickadmin/docker/clients/[nom-client]
cd /home/mickadmin/docker/clients/[nom-client]

# Créer le fichier .env
cat > .env << 'EOF'
BASEROW_API_TOKEN=[TOKEN_DU_CLIENT]
NEXT_PUBLIC_BASEROW_API_URL=https://baserow.mick-solutions.ch
EOF

# Créer docker-compose.yml
cat > docker-compose.yml << 'EOF'
services:
  website:
    image: mick-solutions-website:latest
    container_name: client-[nom]-web
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "[PORT]:3000"  # Ex: 3004, 3005, etc.
    networks:
      - traefik-network

networks:
  traefik-network:
    external: true
EOF

# Lancer le conteneur
docker compose up -d
```

#### Option B : VPS dédié du client

```bash
# Sur le VPS du client
git clone https://github.com/MickdroiD/mick-solutions-website.git
cd mick-solutions-website

# Créer .env
echo "BASEROW_API_TOKEN=[TOKEN_CLIENT]" > .env

# Build et lancer
docker compose up -d --build
```

### ÉTAPE 6 : Configuration DNS et SSL (10 min)

1. **DNS** : Ajouter un enregistrement A pointant vers l'IP du VPS
2. **Traefik** : Ajouter le nouveau domaine dans la config
3. **SSL** : Traefik génère automatiquement le certificat Let's Encrypt

### ÉTAPE 7 : Tests finaux (10 min)

- [ ] Site accessible sur le domaine
- [ ] Toutes les sections affichent les bonnes données
- [ ] Formulaire de contact fonctionne
- [ ] Pages légales accessibles
- [ ] SSL actif (cadenas vert)
- [ ] Mobile responsive

---

## 📊 CONFIGURATION DES TABLES BASEROW

### IDs des Tables (Template Mick Solutions)

| Table | ID Original | À noter pour le client |
|-------|-------------|------------------------|
| Global_Infos | 751 | _____ |
| Services | 748 | _____ |
| Projets | 749 | _____ |
| Témoignages | 750 | _____ |
| FAQ | 752 | _____ |
| Legal_Docs | 753 | _____ |
| Avantages | 757 | _____ |
| Trust_Points | 758 | _____ |

### Modifier les IDs dans le code (si différents)

Si les IDs des tables du client sont différents, modifier `/src/lib/baserow.ts` :

```typescript
const TABLE_IDS = {
  SERVICES: [ID_CLIENT],
  PORTFOLIO: [ID_CLIENT],
  REVIEWS: [ID_CLIENT],
  GLOBAL: [ID_CLIENT],
  FAQ: [ID_CLIENT],
  LEGAL_DOCS: [ID_CLIENT],
  ADVANTAGES: [ID_CLIENT],
  TRUST_POINTS: [ID_CLIENT],
} as const;
```

**⚠️ Pour éviter de modifier le code**, utiliser la même structure de base Baserow !

---

## 🔧 MAINTENANCE ET MISES À JOUR

### Mises à jour du code

```bash
# Sur le VPS
cd /home/mickadmin/docker/website
git pull origin main
docker compose build
docker compose down && docker compose up -d
```

### Monitoring

```bash
# Vérifier le statut
docker compose ps

# Voir les logs
docker logs [container-name] --tail 100

# Redémarrer si nécessaire
docker compose restart
```

### Sauvegarde

```bash
# Exporter les données Baserow (via l'interface)
Baserow → Base du client → Export
```

---

## 💰 TARIFICATION SUGGÉRÉE

| Élément | Prix |
|---------|------|
| **Setup initial** | 500-1000 CHF |
| **Hébergement/mois** | 50-100 CHF |
| **Modifications mineures** | Inclus (client fait lui-même) |
| **Modifications majeures** | Sur devis |

---

## 📞 CHECKLIST DE LIVRAISON CLIENT

À fournir au client après la création :

- [ ] URL du site : https://[domaine].ch
- [ ] Accès Baserow (email + mot de passe)
- [ ] Guide d'utilisation Baserow (PDF)
- [ ] Liste des tables et leur utilisation
- [ ] Contact support : [ton email]

---

## 🆘 DÉPANNAGE

| Problème | Solution |
|----------|----------|
| Site affiche erreur | Vérifier le token API Baserow |
| Données ne se mettent pas à jour | Attendre 60 sec ou redémarrer Docker |
| Images ne s'affichent pas | Vérifier les URLs dans Baserow |
| SSL non actif | Vérifier config Traefik + DNS |

---

**Document créé par Mick Solutions - Décembre 2025**

