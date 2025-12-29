# 🏭 Factory V2 - White Label Website Platform

> Architecture modulaire pour déployer des sites clients rapidement.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Baserow](https://img.shields.io/badge/Baserow-CMS-green)](https://baserow.io/)

---

## 🎯 Concept

Un seul code source → Plusieurs sites clients différents.

Chaque client a sa propre base de données **Baserow** qui contrôle 100% du contenu.

```
┌─────────────────────────────────────┐
│        CODE SOURCE (GitHub)         │
│      Next.js 14 + Tailwind CSS      │
└─────────────────┬───────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
  ┌───────┐   ┌───────┐   ┌───────┐
  │Baserow│   │Baserow│   │Baserow│
  │Client A│  │Client B│  │Client C│
  └───┬───┘   └───┬───┘   └───┬───┘
      │           │           │
      ▼           ▼           ▼
  site-a.ch   site-b.ch   site-c.ch
```

---

## ⚡ Démarrage rapide

### Prérequis

- Node.js 18+
- Accès à Baserow

### Installation

```bash
# Cloner le repository
git clone https://github.com/mick-solutions/factory-v2.git
cd factory-v2

# Installer les dépendances
npm install

# Copier le template d'environnement
cp env.template .env.local

# Remplir les variables (voir section Configuration)
nano .env.local

# Lancer en développement
npm run dev
```

Ouvrir http://localhost:3004

### Panneau d'administration

```
http://localhost:3004/admin/v2
```

PIN par défaut: celui défini dans `ADMIN_PASSWORD`

---

## 🔧 Configuration

### Variables d'environnement

```bash
# Baserow (obligatoire)
BASEROW_API_TOKEN=votre_token
BASEROW_API_URL=https://baserow.mick-solutions.ch/api
BASEROW_FACTORY_GLOBAL_ID=808
BASEROW_FACTORY_SECTIONS_ID=809
BASEROW_FACTORY_LEADS_ID=810

# Authentification
ADMIN_PASSWORD=123456
JWT_SECRET=secret_jwt_securise

# Site
SITE_NAME=Mon Site
NEXT_PUBLIC_SITE_URL=https://mon-site.ch
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README_FACTORY.md](./README_FACTORY.md) | Guide administrateur complet |
| [docs/ADMIN-GUIDE-V2.md](./docs/ADMIN-GUIDE-V2.md) | Création/Suppression clients |
| [docs/USER-GUIDE-V2.md](./docs/USER-GUIDE-V2.md) | Guide pour les utilisateurs finaux |

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── page.tsx              # Page principale (rendu sections)
│   ├── admin/v2/page.tsx     # Panneau d'administration V2
│   └── api/admin/            # Routes API admin
│
├── components/
│   ├── admin/v2/             # Composants admin V2
│   │   ├── forms/            # Formulaires par type de section
│   │   └── ui/               # Composants UI réutilisables
│   │
│   └── modules/              # Sections du site
│       ├── Hero/
│       ├── Services/
│       ├── Gallery/
│       └── ...
│
└── lib/
    ├── factory-client.ts     # Client API Baserow
    ├── schemas/factory.ts    # Schémas Zod
    └── admin-session.ts      # Gestion JWT
```

---

## 🐳 Déploiement Docker

```bash
# Build l'image
docker build -t factory-v2:latest .

# Lancer avec docker-compose
docker compose -f docker-compose.prod.yml up -d
```

Voir [docs/ADMIN-GUIDE-V2.md](./docs/ADMIN-GUIDE-V2.md) pour le guide complet.

---

## 📦 Scripts disponibles

```bash
npm run dev           # Développement (port 3004)
npm run build         # Build production
npm run start         # Lancer en production
npm run lint          # Vérifier le code
npm run client:new    # Créer un nouveau client
```

---

## 📞 Support

- **Email**: support@mick-solutions.ch
- **Documentation**: https://docs.mick-solutions.ch

---

*Factory V2 © 2025 Mick Solutions*
