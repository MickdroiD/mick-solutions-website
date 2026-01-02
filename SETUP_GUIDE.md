# 🚀 Guide de Configuration - Déploiement Continu (CD)

Ce guide explique comment configurer le déploiement automatique vers ton VPS Infomaniak via GitHub Actions.

---

## 📦 Workflows disponibles

| Workflow | Fichier | Trigger | Description |
|----------|---------|---------|-------------|
| **CI/CD Pipeline** | `ci.yml` | Push main/develop | Pipeline complet: lint → build → test → docker → deploy |
| **Manual Deploy** | `deploy-manual.yml` | Manuel | Déploiement via ghcr.io avec choix du tag |
| **Fast Deploy** | `deploy.yml` | Manuel | Déploiement rapide: git pull → docker build local |

### Quand utiliser quel workflow ?

- **Développement normal** → Laisse `ci.yml` faire son travail automatiquement
- **Hotfix urgent** → Utilise `deploy.yml` (Fast Deploy) pour bypasser les tests
- **Rollback** → Utilise `deploy-manual.yml` avec un tag spécifique

---

## 📋 Prérequis

- Un dépôt GitHub avec ce projet
- Accès SSH à ton VPS (IP: `83.228.218.6`)
- Utilisateur: `mickadmin`

---

## 🔐 Étape 1: Générer une clé SSH dédiée

> ⚠️ **Important**: Crée une **nouvelle clé SSH dédiée** pour GitHub Actions.  
> Ne réutilise pas ta clé personnelle pour des raisons de sécurité.

### Sur ton ordinateur local (ou directement sur le VPS):

```bash
# Générer une nouvelle clé ED25519 (recommandé - plus sécurisé et plus court)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy -N ""

# OU si ED25519 n'est pas supporté, utiliser RSA
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy -N ""
```

**Explication des paramètres:**
- `-t ed25519`: Type de clé (plus moderne et sécurisé)
- `-C "github-actions-deploy"`: Commentaire pour identifier la clé
- `-f ~/.ssh/github_actions_deploy`: Chemin du fichier
- `-N ""`: Pas de passphrase (requis pour l'automatisation)

### Résultat:
```
~/.ssh/github_actions_deploy      # Clé PRIVÉE (à mettre dans GitHub Secrets)
~/.ssh/github_actions_deploy.pub  # Clé PUBLIQUE (à mettre sur le VPS)
```

---

## 🔑 Étape 2: Ajouter la clé publique sur le VPS

### Option A: Depuis ta machine locale vers le VPS

```bash
# Copier la clé publique vers le VPS
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub mickadmin@83.228.218.6

# OU manuellement si ssh-copy-id n'est pas disponible:
cat ~/.ssh/github_actions_deploy.pub | ssh mickadmin@83.228.218.6 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### Option B: Directement sur le VPS (si tu génères la clé là-bas)

```bash
# Si tu as généré la clé sur le VPS, ajoute-la aux authorized_keys
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys

# Vérifier les permissions (CRITIQUE pour SSH)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Tester la connexion SSH:

```bash
# Depuis ta machine locale, teste que la clé fonctionne
ssh -i ~/.ssh/github_actions_deploy mickadmin@83.228.218.6 "echo 'Connexion SSH OK!'"
```

---

## ⚙️ Étape 3: Configurer les Secrets GitHub

Va dans ton dépôt GitHub:
1. **Settings** → **Secrets and variables** → **Actions**
2. Clique sur **"New repository secret"**
3. Ajoute les secrets suivants:

| Nom du Secret | Valeur | Description |
|---------------|--------|-------------|
| `VPS_HOST` | `83.228.218.6` | IP de ton VPS Infomaniak |
| `VPS_USER` | `mickadmin` | Utilisateur SSH |
| `VPS_SSH_KEY` | *(contenu de la clé privée)* | Clé privée complète |
| `VPS_SSH_PORT` | `22` | Port SSH (optionnel, défaut: 22) |

### Pour obtenir la clé privée:

```bash
# Afficher la clé privée (COPIE TOUT le contenu incluant les lignes BEGIN/END)
cat ~/.ssh/github_actions_deploy
```

**Exemple de contenu à copier:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtz
c2gtZWQyNTUxOQAAACBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AAAAQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxgithub-acti
ons-deploy
-----END OPENSSH PRIVATE KEY-----
```

> ⚠️ **CRITIQUE**: Copie **TOUT** le contenu, y compris:
> - `-----BEGIN OPENSSH PRIVATE KEY-----`
> - `-----END OPENSSH PRIVATE KEY-----`

---

## 📁 Étape 4: Initialiser le dépôt Git sur le VPS

Si ce n'est pas déjà fait, initialise Git sur le VPS:

```bash
# Sur le VPS, dans le dossier du projet
cd /home/mickadmin/docker/website

# Si le dossier n'est pas encore un repo Git:
git init
git remote add origin git@github.com:TON_USERNAME/TON_REPO.git

# OU si tu clones depuis zéro:
cd /home/mickadmin/docker
git clone git@github.com:TON_USERNAME/TON_REPO.git website
```

### Configurer Git pour le déploiement:

```bash
# Sur le VPS - Permettre les pull automatiques
cd /home/mickadmin/docker/website
git config --local receive.denyCurrentBranch ignore
git config --local user.email "deploy@mick-solutions.ch"
git config --local user.name "GitHub Actions Deploy"
```

---

## ✅ Étape 5: Tester le déploiement

### Test manuel:

1. Fais un commit sur la branche `main` ou `master`
2. Push vers GitHub
3. Va dans **Actions** sur ton repo GitHub
4. Observe le workflow **"🚀 Deploy to VPS"**

### Déclencher manuellement:

Tu peux aussi déclencher le déploiement manuellement:
1. Va dans **Actions** → **🚀 Deploy to VPS**
2. Clique sur **"Run workflow"**
3. Sélectionne la branche et clique sur **"Run workflow"**

---

## 🔧 Dépannage

### Erreur: "Permission denied (publickey)"

```bash
# Vérifier que la clé est bien autorisée sur le VPS
ssh -i ~/.ssh/github_actions_deploy -v mickadmin@83.228.218.6

# Vérifier les permissions sur le VPS
ls -la ~/.ssh/
# authorized_keys doit être en 600
# Le dossier .ssh doit être en 700
```

### Erreur: "Host key verification failed"

Ajoute `StrictHostKeyChecking=no` dans le workflow (déjà géré par appleboy/ssh-action).

### Erreur: "docker: command not found"

```bash
# Vérifier que Docker est installé et accessible
docker --version
docker compose version
```

### Le conteneur ne démarre pas:

```bash
# Sur le VPS, vérifier les logs
cd /home/mickadmin/docker/website
docker compose logs -f
```

---

## 📊 Récapitulatif des Secrets GitHub

| Secret | Valeur |
|--------|--------|
| `VPS_HOST` | `83.228.218.6` |
| `VPS_USER` | `mickadmin` |
| `VPS_SSH_KEY` | *(contenu de ~/.ssh/github_actions_deploy)* |
| `VPS_SSH_PORT` | `22` *(optionnel)* |

---

## 🔒 Bonnes Pratiques de Sécurité

1. **Ne jamais committer** de clés SSH ou de secrets dans le code
2. **Utiliser des clés dédiées** pour le déploiement (pas ta clé personnelle)
3. **Limiter les permissions** de l'utilisateur de déploiement si possible
4. **Activer les logs** GitHub Actions pour auditer les déploiements
5. **Protéger la branche main** avec des règles de protection (reviews, etc.)

---

## 📞 Support

En cas de problème, vérifie:
1. Les logs GitHub Actions (onglet **Actions** de ton repo)
2. Les logs du serveur: `journalctl -u docker -f`
3. Les logs du conteneur: `docker compose logs -f`

---

*Guide créé le: Janvier 2026*
*Stack: Next.js 14 + Docker + Traefik sur VPS Infomaniak 🇨🇭*

