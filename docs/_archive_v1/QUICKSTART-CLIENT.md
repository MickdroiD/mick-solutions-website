# ⚡ Guide Rapide - Nouveau Client White Label

> Temps estimé : **30 minutes**

---

## 1️⃣ Dupliquer la base Baserow

```
Baserow → Base "Mick Solutions" → ⋮ → Duplicate database
Nom : "CLIENT_[NOM]_SITEWEB"
```

**Noter les IDs des tables :**
- [ ] Global_Infos : ____
- [ ] services : ____
- [ ] Legal_Docs : ____

---

## 2️⃣ Remplir la table Global_Infos

### Champs obligatoires

| Champ | Valeur client |
|-------|---------------|
| `Email` | |
| `Titre Hero` | |
| `Sous-titre Hero` | |
| `Lien Bouton Appel` | (Calendly/Cal.com) |
| `Lien Linkedin` | |

### Champs recommandés

| Champ | Valeur client |
|-------|---------------|
| `Nom Site` | |
| `Slogan` | |
| `Adresse` | |
| `Meta Titre` | |
| `Meta Description` | |
| `Site URL` | https://www. |
| `Copyright Texte` | © 2025 [Nom]. Tous droits réservés. |

---

## 3️⃣ Créer les services (table services)

Minimum **3 services** avec :
- Titre
- Description
- Icone (voir liste ci-dessous)
- Ordre (1, 2, 3...)

**Icônes disponibles :**
```
mail, database, shield, filetext, users, barchart3, 
server, bot, code2, zap, globe, settings, workflow
```

---

## 4️⃣ Créer les documents légaux (table Legal_Docs)

| Slug | Titre | Is_Active |
|------|-------|-----------|
| `mentions-legales` | Mentions légales | ✅ |
| `politique-confidentialite` | Politique de confidentialité | ✅ |
| `cgv` | Conditions générales de vente | ✅ |

---

## 5️⃣ Générer le token API

```
Baserow → Settings → API Tokens → Create
Permissions : Read sur toutes les tables
```

**Token :** ____________________________

---

## 6️⃣ Déployer

### Option A : Docker (recommandé)

```bash
# Sur le serveur
docker run -d \
  --name client-website \
  -p 3000:3000 \
  -e BASEROW_API_TOKEN="TOKEN_ICI" \
  ghcr.io/mick-solutions/website:latest
```

### Option B : Vercel

1. Fork le repository
2. Ajouter la variable `BASEROW_API_TOKEN`
3. Deploy

---

## 7️⃣ Vérifier

- [ ] Page d'accueil charge correctement
- [ ] Hero affiche les bons textes
- [ ] Services s'affichent
- [ ] Footer a les bonnes infos contact
- [ ] Pages légales accessibles

---

## 🆘 Problème ?

Voir `WHITE-LABEL-TEMPLATE.md` pour le guide complet.

---

*Template Mick Solutions v1.0*

