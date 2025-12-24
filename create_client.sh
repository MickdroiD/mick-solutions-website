#!/bin/bash

# ==========================================
# 🏭 MICK SOLUTIONS - USINE À SITES V3.4
# Script de déploiement client automatisé
# ==========================================

# Couleurs pour la beauté du geste
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}   CRÉATION D'UN NOUVEAU CLIENT WHITE LABEL   ${NC}"
echo -e "${BLUE}==============================================${NC}"

# 1. Collecte des informations
echo -e "\n📝 Configuration du client :"
read -p "Nom du client (sans espace, ex: garage-michel) : " CLIENT_NAME
read -p "Nom de domaine principal (ex: garage-michel.ch) : " DOMAIN_NAME
read -p "ID de la Base de Données Baserow (ex: 42) : " DB_ID
read -p "Token API Baserow (Le token spécifique à ce client) : " API_TOKEN

# Vérification basique
if [ -z "$CLIENT_NAME" ] || [ -z "$DOMAIN_NAME" ] || [ -z "$DB_ID" ] || [ -z "$API_TOKEN" ]; then
    echo -e "${RED}❌ Erreur : Toutes les informations sont obligatoires.${NC}"
    exit 1
fi

# Nettoyage du nom du conteneur (minuscules, pas d'espaces)
CONTAINER_NAME="client-${CLIENT_NAME,,}"
CONTAINER_NAME=${CONTAINER_NAME// /-}

echo -e "\n🚀 Préparation du déploiement pour : ${GREEN}$CLIENT_NAME${NC}"
echo -e "   Domaine : ${GREEN}$DOMAIN_NAME${NC}"
echo -e "   Conteneur : $CONTAINER_NAME"
echo -e "   Base ID : $DB_ID"

# Confirmation
read -p "❓ Tout est correct ? (o/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${RED}Annulation.${NC}"
    exit 1
fi

# 2. Gestion des conteneurs existants
if [ "$(docker ps -aq -f name=^/${CONTAINER_NAME}$)" ]; then
    echo -e "${RED}⚠️  Un conteneur nommé '$CONTAINER_NAME' existe déjà.${NC}"
    read -p "Voulez-vous le supprimer et le recréer ? (o/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        docker stop $CONTAINER_NAME >/dev/null 2>&1
        docker rm $CONTAINER_NAME >/dev/null 2>&1
        echo -e "🗑️  Ancien conteneur supprimé."
    else
        echo -e "${RED}Arrêt du script.${NC}"
        exit 1
    fi
fi

# 3. Lancement du Docker
# Note : On utilise le réseau 'web' pour Traefik.
# On gère le domaine principal ET le sous-domaine www automatiquement.

echo -e "\n🏗️  Lancement du conteneur..."

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --network web \
  -e BASEROW_API_TOKEN="$API_TOKEN" \
  -e NEXT_PUBLIC_BASEROW_DATABASE_ID="$DB_ID" \
  \
  --label "traefik.enable=true" \
  --label "traefik.docker.network=web" \
  --label "traefik.http.routers.${CONTAINER_NAME}.rule=Host(\`${DOMAIN_NAME}\`) || Host(\`www.${DOMAIN_NAME}\`)" \
  --label "traefik.http.routers.${CONTAINER_NAME}.entrypoints=websecure" \
  --label "traefik.http.routers.${CONTAINER_NAME}.tls.certresolver=myresolver" \
  \
  mick-solutions-website:latest

# 4. Vérification
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ SUCCÈS ! Le site est en ligne.${NC}"
    echo -e "🌍 URLs accessibles (après propagation DNS) :"
    echo -e "   👉 https://$DOMAIN_NAME"
    echo -e "   👉 https://www.$DOMAIN_NAME"
    echo -e "\n💡 N'oublie pas de configurer les DNS du client (Type A vers ton IP)."
else
    echo -e "\n${RED}❌ ERREUR lors du lancement Docker.${NC}"
fi

