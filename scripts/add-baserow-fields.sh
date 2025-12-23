#!/bin/bash
# ============================================
# Script d'ajout des champs White Label dans Baserow
# Table: SITEWEB Global_Infos (ID: 751)
# ============================================

BASEROW_URL="https://baserow.mick-solutions.ch"
BASEROW_TOKEN="aVAlJxDxagsd06VAu2qlQXrHl554cbFN"
TABLE_ID=751

# Fonction pour ajouter un champ
add_field() {
    local name="$1"
    local type="$2"
    local order="$3"
    
    echo "➕ Ajout du champ: $name ($type)..."
    
    response=$(curl -s -X POST "$BASEROW_URL/api/database/fields/table/$TABLE_ID/" \
        -H "Authorization: Token $BASEROW_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"$name\", \"type\": \"$type\"}")
    
    if echo "$response" | grep -q '"id"'; then
        echo "   ✅ Champ '$name' créé avec succès"
    else
        echo "   ⚠️  Erreur ou champ déjà existant: $name"
        echo "   $response" | head -c 100
        echo ""
    fi
}

echo "🚀 Début de l'ajout des champs White Label..."
echo "================================================"

# === IDENTITÉ ===
add_field "Nom Site" "text"
add_field "Slogan" "long_text"
add_field "Initiales Logo" "text"

# === ASSETS ===
add_field "Logo URL" "url"
add_field "Logo Dark URL" "url"
add_field "Favicon URL" "url"
add_field "OG Image URL" "url"

# === SEO ===
add_field "Meta Titre" "text"
add_field "Meta Description" "long_text"
add_field "Site URL" "url"
add_field "Mots Cles" "long_text"
add_field "Langue" "text"
add_field "Locale" "text"

# === BRANDING ===
add_field "Couleur Primaire" "text"
add_field "Couleur Accent" "text"

# === CONTACT (Adresse) ===
add_field "Adresse" "text"

# === HERO ===
add_field "Badge Hero" "text"
add_field "CTA Principal" "text"
add_field "CTA Secondaire" "text"

# === TRUST STATS ===
add_field "Trust Stat 1 Value" "text"
add_field "Trust Stat 1 Label" "text"
add_field "Trust Stat 2 Value" "text"
add_field "Trust Stat 2 Label" "text"
add_field "Trust Stat 3 Value" "text"
add_field "Trust Stat 3 Label" "text"

# === ANALYTICS ===
add_field "Umami Site ID" "text"
add_field "Umami Script URL" "url"

# === FOOTER ===
add_field "Copyright Texte" "text"
add_field "Pays Hebergement" "text"

echo ""
echo "================================================"
echo "✅ Terminé ! Tous les champs ont été traités."
echo ""
echo "📋 Prochaine étape: Remplir les valeurs dans Baserow"
echo "   URL: $BASEROW_URL"

