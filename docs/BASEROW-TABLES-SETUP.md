# 📊 Création des Tables Optionnelles Baserow

> Ces tables permettent de dynamiser les sections "Avantages" et "Confiance" du site.

---

## 🎯 Table 1 : SITEWEB Avantages

### Création dans Baserow

1. Ouvrir Baserow → Base de données
2. Cliquer **+ Add table**
3. Nommer : `SITEWEB Avantages`

### Champs à créer

| Nom du champ | Type | Options |
|--------------|------|---------|
| `Badge` | Text | - |
| `Titre` | Text | - |
| `Description` | Long text | - |
| `Icone` | Text | - |
| `Ordre` | Number | Decimal places: 0 |
| `Is_Active` | Boolean | Default: true |

### Données à insérer

| Badge | Titre | Description | Icone | Ordre |
|-------|-------|-------------|-------|-------|
| Jusqu'à 70% d'économies | Réduisez vos coûts | Pas de salaire à payer, pas de congés, pas d'erreurs humaines. Un investissement unique pour des économies durables. | `piggyBank` | 1 |
| Clé en main | Zéro complexité | Pas de jargon technique, pas de formation interminable. On s'occupe de tout, vous profitez des résultats. | `target` | 2 |
| Outils modernes | Technologies éprouvées | n8n, Make, Baserow, Airtable... On utilise les meilleurs outils no-code du marché. | `sparkles` | 3 |
| Sur-mesure | Adapté à VOS besoins | Chaque automatisation est conçue spécifiquement pour votre entreprise. Pas de solution générique. | `settings` | 4 |

---

## 🎯 Table 2 : SITEWEB Trust_Points

### Création dans Baserow

1. Ouvrir Baserow → Base de données
2. Cliquer **+ Add table**
3. Nommer : `SITEWEB Trust_Points`

### Champs à créer

| Nom du champ | Type | Options |
|--------------|------|---------|
| `Titre` | Text | - |
| `Description` | Long text | - |
| `Badge` | Text | - |
| `Icone` | Text | - |
| `Ordre` | Number | Decimal places: 0 |
| `Is_Active` | Boolean | Default: true |

### Données à insérer

| Titre | Description | Badge | Icone | Ordre |
|-------|-------------|-------|-------|-------|
| 100% hébergé en Suisse | Vos données ne quittent jamais le territoire suisse. Serveurs à Genève, conformité totale RGPD et LPD. | Genève, CH | `mapPin` | 1 |
| Entreprise suisse | Basée à Genève, inscrite au Registre du Commerce. Vous traitez avec un vrai interlocuteur local, pas une boîte postale offshore. | RC Genève | `building2` | 2 |
| Pas d'accès à vos comptes | Vos automatisations tournent de manière autonome sur vos propres systèmes. Aucun accès externe n'est nécessaire après la mise en place. | Autonomie totale | `shieldCheck` | 3 |

---

## 🔧 Mise à jour du code

Une fois les tables créées, noter leurs IDs et mettre à jour `src/lib/baserow.ts` :

```typescript
const TABLE_IDS = {
  GLOBAL_INFOS: 751,
  SERVICES: 748,
  PROJECTS: 749,
  TESTIMONIALS: 750,
  FAQ: 752,
  LEGAL_DOCS: 753,
  ADVANTAGES: XXX,      // ← Remplacer par l'ID de la table SITEWEB Avantages
  TRUST_POINTS: YYY,    // ← Remplacer par l'ID de la table SITEWEB Trust_Points
};
```

Puis décommenter les fonctions `getAdvantages()` et `getTrustPoints()` dans le fichier.

---

## 📝 Icônes disponibles (Lucide)

```
piggyBank, target, sparkles, settings, mapPin, building2, 
shieldCheck, shield, lock, key, server, database, cloud,
zap, rocket, star, heart, check, award, trophy
```

---

*Documentation créée le 23 Décembre 2025*

