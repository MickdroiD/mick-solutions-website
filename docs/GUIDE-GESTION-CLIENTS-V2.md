# 🏭 FACTORY V2 - Guide Complet de Gestion des Clients

> **Version** : 2.0 | **Auteur** : Mick Solutions | **Date** : Décembre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#-vue-densemble)
2. [Prérequis](#-prérequis)
3. [Création d'un client](#-création-dun-client)
4. [Déploiement Docker](#-déploiement-docker)
5. [Gestion quotidienne](#-gestion-quotidienne)
6. [Suppression d'un client](#-suppression-dun-client)
7. [Troubleshooting](#-troubleshooting)

---

## 🎯 VUE D'ENSEMBLE

### Architecture Factory V2

```
┌─────────────────────────────────────────────────────────────┐
│                    BASEROW (Source unique)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐    ┌───────────────────┐             │
│  │   FACTORY_V2      │    │  CLIENT - Patate  │             │
│  │   (Template)      │───▶│  (Dupliqué)       │             │
│  ├───────────────────┤    ├───────────────────┤             │
│  │ • CONFIG_GLOBAL   │    │ • CONFIG_GLOBAL   │  ← IDs      │
│  │ • SECTIONS        │    │ • SECTIONS        │    uniques  │
│  │ • LEADS           │    │ • LEADS           │             │
│  └───────────────────┘    └───────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOCKER (VPS)                            │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │ mick-web   │  │ client-svf │  │ demo-client│  ...        │
│  │ (principal)│  │            │  │            │             │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘             │
│        │               │               │                     │
│  mick-solutions.ch  s-vf.ch    demo.mick-solutions.ch       │
└─────────────────────────────────────────────────────────────┘
```

### Principe

1. **Un seul code** : L'image Docker `website-website:latest` est partagée par tous les clients
2. **Une DB par client** : Chaque client a sa propre database Baserow (dupliquée depuis FACTORY_V2)
3. **Config via .env** : Les IDs des tables et le PIN admin sont dans le fichier `.env` de chaque conteneur

---

## 📦 PRÉREQUIS

### Outils nécessaires

| Outil | Utilisation | Installation |
|-------|-------------|--------------|
| Node.js 18+ | Exécution des scripts | `nvm install 18` |
| Docker | Conteneurisation | Déjà installé |
| tsx | Exécution TypeScript | `npm install -g tsx` |

### Credentials Baserow

Pour créer un client, vous avez besoin de :

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `BASEROW_EMAIL` | Email admin Baserow | Votre compte Baserow |
| `BASEROW_PASSWORD` | Mot de passe admin | Votre compte Baserow |
| `BASEROW_API_TOKEN` | Token API (lecture) | Baserow → Settings → API Tokens |

### Fichier .env.local (optionnel)

Créez `/home/mickadmin/docker/website/.env.local` pour éviter de saisir les credentials :

```bash
BASEROW_EMAIL=votre@email.ch
BASEROW_PASSWORD=votre_mot_de_passe
BASEROW_API_TOKEN=DSRq9MrGe6l9hixef6f7uqJ7Pd2Y9PnO
```

---

## 🚀 CRÉATION D'UN CLIENT

### Méthode automatisée (RECOMMANDÉE)

Le script `create-client.ts` automatise tout le processus :

```bash
cd /home/mickadmin/docker/website
npx tsx scripts/create-client.ts "Nom du Client"
```

#### Exemple concret

```bash
# Créer un client "Boulangerie Patate"
cd /home/mickadmin/docker/website
npx tsx scripts/create-client.ts "Boulangerie Patate"
```

#### Ce que fait le script :

1. ✅ Demande vos credentials Baserow (ou utilise `.env.local`)
2. ✅ Trouve la database template `FACTORY_V2`
3. ✅ Duplique la database en `CLIENT - Boulangerie Patate`
4. ✅ Récupère les IDs des nouvelles tables
5. ✅ **Génère un PIN admin à 6 chiffres aléatoire**
6. ✅ Met à jour le nom du site dans CONFIG_GLOBAL
7. ✅ Affiche la configuration complète
8. ✅ Propose de sauvegarder dans `.env.client-boulangerie-patate`

#### Sortie du script :

```
┌────────────────────────────────────────────────────────────┐
│  ✅ CLIENT "Boulangerie Patate" CRÉÉ AVEC SUCCÈS!          
├────────────────────────────────────────────────────────────┤
│  Database ID: 123                                          │
│  CONFIG_GLOBAL ID: 456                                     │
│  SECTIONS ID: 457                                          │
│  ADMIN PIN: 847291                                         │
└────────────────────────────────────────────────────────────┘

🚀 CONFIGURATION POUR DOCKER:
───────────────────────────────────────
BASEROW_API_TOKEN=DSRq9MrGe6l9hixef6f7uqJ7Pd2Y9PnO
BASEROW_FACTORY_GLOBAL_ID=456
BASEROW_FACTORY_SECTIONS_ID=457
ADMIN_PASSWORD=847291
───────────────────────────────────────
```

### Commandes npm alternatives

```bash
# Via npm script (si configuré dans package.json)
npm run client:new "Nom du Client"

# Avec tsx directement
npx tsx scripts/create-client.ts
```

---

## 🐳 DÉPLOIEMENT DOCKER

Après avoir créé le client dans Baserow, déployez le conteneur Docker.

### Étape 1 : Créer le dossier client

```bash
# Créer le dossier
mkdir -p /home/mickadmin/docker/clients/boulangerie-patate
cd /home/mickadmin/docker/clients/boulangerie-patate
```

### Étape 2 : Créer le fichier .env

```bash
cat > .env << 'EOF'
# Configuration pour: Boulangerie Patate
# Database ID: 123

# === FACTORY V2 CONFIG ===
BASEROW_API_URL=https://baserow.mick-solutions.ch/api
BASEROW_API_TOKEN=DSRq9MrGe6l9hixef6f7uqJ7Pd2Y9PnO
BASEROW_FACTORY_GLOBAL_ID=456
BASEROW_FACTORY_SECTIONS_ID=457
BASEROW_FACTORY_LEADS_ID=458

# === ADMIN AUTH ===
ADMIN_PASSWORD=847291

# === SITE CONFIG ===
NODE_ENV=production
SITE_NAME=Boulangerie Patate
NEXT_PUBLIC_SITE_URL=https://boulangerie-patate.ch
EOF
```

### Étape 3 : Créer le docker-compose.yml

#### Option A : Sous-domaine .mick-solutions.ch

```yaml
services:
  website:
    image: website-website:latest
    container_name: client-boulangerie-web
    restart: unless-stopped
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.boulangerie.rule=Host(`boulangerie.mick-solutions.ch`)"
      - "traefik.http.routers.boulangerie.entrypoints=websecure"
      - "traefik.http.routers.boulangerie.tls.certresolver=myresolver"
      - "traefik.http.services.boulangerie.loadbalancer.server.port=3000"

networks:
  proxy:
    external: true
```

#### Option B : Domaine externe du client

```yaml
services:
  website:
    image: website-website:latest
    container_name: client-boulangerie-web
    restart: unless-stopped
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      # Domaine principal + www
      - "traefik.http.routers.boulangerie.rule=Host(`boulangerie-patate.ch`) || Host(`www.boulangerie-patate.ch`)"
      - "traefik.http.routers.boulangerie.entrypoints=websecure"
      - "traefik.http.routers.boulangerie.tls.certresolver=myresolver"
      - "traefik.http.services.boulangerie.loadbalancer.server.port=3000"

networks:
  proxy:
    external: true
```

### Étape 4 : Configuration DNS

Pour un domaine externe, le client doit configurer ses DNS :

```
Type    Nom     Valeur
────────────────────────────────
A       @       83.228.218.6
A       www     83.228.218.6
```

### Étape 5 : Lancer le conteneur

```bash
cd /home/mickadmin/docker/clients/boulangerie-patate
docker compose up -d
```

### Étape 6 : Vérifier le déploiement

```bash
# Attendre le healthcheck (30 secondes)
sleep 30

# Vérifier le statut
docker ps --filter name=client-boulangerie

# Tester l'accès (avec header Host si DNS pas encore configuré)
curl -k -sI -H "Host: boulangerie-patate.ch" https://localhost | head -10
```

---

## 🔧 GESTION QUOTIDIENNE

### Voir les sites actifs

```bash
# Lister tous les conteneurs clients
docker ps --filter "name=client-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Voir les routers Traefik (si API activée)
curl -s http://localhost:8080/api/http/routers | python3 -c "
import json,sys
routers=json.load(sys.stdin)
for r in routers:
    if '@docker' in r['name']:
        print(f\"{r['name']}: {r.get('rule','')}\")
"
```

### Redémarrer un site client

```bash
cd /home/mickadmin/docker/clients/nom-client
docker compose restart
```

### Voir les logs d'un client

```bash
docker logs client-nom-web --tail 100 -f
```

### Mettre à jour l'image de tous les clients

```bash
# 1. Rebuild l'image principale
cd /home/mickadmin/docker/website
docker compose build

# 2. Redémarrer chaque client
for client in /home/mickadmin/docker/clients/*/; do
    cd "$client"
    docker compose up -d
done
```

### Accéder à l'admin d'un client

```
https://[domaine-client]/admin/v2
```

Utiliser le PIN configuré dans le `.env` du client (`ADMIN_PASSWORD`).

---

## 🗑️ SUPPRESSION D'UN CLIENT

### Étape 1 : Arrêter et supprimer le conteneur

```bash
cd /home/mickadmin/docker/clients/nom-client
docker compose down
```

### Étape 2 : Supprimer les fichiers locaux

```bash
rm -rf /home/mickadmin/docker/clients/nom-client
```

### Étape 3 : Supprimer la database Baserow

1. Aller sur https://baserow.mick-solutions.ch
2. Trouver la database `CLIENT - Nom du Client`
3. Cliquer sur **⋮** → **Delete database**
4. Confirmer la suppression

### Étape 4 : (Optionnel) Supprimer le fichier .env.client

```bash
rm /home/mickadmin/docker/website/.env.client-nom-client
```

### Script de suppression complète

```bash
#!/bin/bash
# Usage: ./delete_client.sh nom-client

CLIENT_SLUG=$1

if [ -z "$CLIENT_SLUG" ]; then
    echo "Usage: $0 nom-client"
    exit 1
fi

echo "⚠️  ATTENTION: Suppression du client '$CLIENT_SLUG'"
read -p "Êtes-vous sûr ? (oui/non): " CONFIRM

if [ "$CONFIRM" != "oui" ]; then
    echo "Annulé."
    exit 0
fi

# Arrêter le conteneur
echo "🛑 Arrêt du conteneur..."
cd /home/mickadmin/docker/clients/$CLIENT_SLUG 2>/dev/null && docker compose down

# Supprimer les fichiers
echo "🗑️  Suppression des fichiers..."
rm -rf /home/mickadmin/docker/clients/$CLIENT_SLUG
rm -f /home/mickadmin/docker/website/.env.client-$CLIENT_SLUG

echo "✅ Client supprimé localement."
echo ""
echo "⚠️  N'oubliez pas de supprimer la database dans Baserow manuellement !"
echo "   https://baserow.mick-solutions.ch → CLIENT - $CLIENT_SLUG → Delete"
```

---

## 🆘 TROUBLESHOOTING

### Le script create-client.ts échoue

| Erreur | Solution |
|--------|----------|
| `Erreur d'authentification` | Vérifiez email/password Baserow |
| `Template non trouvé` | Vérifiez que FACTORY_V2 existe dans Baserow |
| `Timeout duplication` | La DB est grande, augmentez le timeout |

### Le site affiche une erreur 500

```bash
# Vérifier les logs
docker logs client-nom-web --tail 50

# Causes fréquentes:
# - BASEROW_API_TOKEN invalide
# - IDs de tables incorrects
# - Baserow inaccessible
```

### Le healthcheck échoue

```bash
# Tester manuellement
docker exec client-nom-web wget -qO- http://127.0.0.1:3000/api/health

# Si erreur IPv6, vérifier que le healthcheck utilise 127.0.0.1 et non localhost
```

### Certificat SSL non généré

```bash
# Vérifier les logs Traefik
docker logs traefik --tail 50 | grep -i "certificate\|acme"

# Causes fréquentes:
# - DNS pas encore propagé
# - Rate-limit Let's Encrypt atteint
# - Port 443 bloqué
```

### Le client n'apparaît pas dans Traefik

```bash
# Vérifier que le conteneur est "healthy"
docker ps --filter name=client-nom

# Si "unhealthy", le router n'est pas créé
# Vérifier le healthcheck et le port 3000
```

---

## 📚 SCRIPTS DISPONIBLES

| Script | Emplacement | Description |
|--------|-------------|-------------|
| `create-client.ts` | `/docker/website/scripts/` | Création automatisée d'un client |
| `setup-factory-db.ts` | `/docker/website/scripts/` | Initialisation de la DB template |
| `install_client.sh` | `/docker/` | Livraison client externe (clé USB) |

### Commandes npm

```json
{
  "client:new": "tsx scripts/create-client.ts",
  "factory:setup": "tsx scripts/setup-factory-db.ts"
}
```

---

## 📋 CHECKLIST NOUVEAU CLIENT

### Avant création

- [ ] Nom du client défini
- [ ] Domaine acheté (ou sous-domaine choisi)
- [ ] Credentials Baserow disponibles

### Création Baserow

- [ ] Script `create-client.ts` exécuté
- [ ] IDs des tables notés
- [ ] PIN admin noté

### Déploiement Docker

- [ ] Dossier client créé
- [ ] Fichier `.env` configuré
- [ ] Fichier `docker-compose.yml` créé
- [ ] DNS configuré (si domaine externe)
- [ ] Conteneur lancé et healthy

### Vérification finale

- [ ] Site accessible sur le domaine
- [ ] Certificat SSL valide
- [ ] Admin /admin/v2 accessible avec PIN
- [ ] Données de démo modifiables dans Baserow

---

## 💡 BONNES PRATIQUES

1. **Nommage cohérent** : Utilisez le même slug partout (dossier, conteneur, router)
2. **Backup** : Exportez régulièrement les databases Baserow
3. **Monitoring** : Utilisez Uptime Kuma pour surveiller chaque site
4. **Documentation** : Gardez une liste des clients avec leurs IDs et PINs

---

*Documentation créée le 29 Décembre 2025 - Factory V2*

