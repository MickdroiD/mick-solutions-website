#!/bin/bash

# ============================================
# RESTART CONTAINER SCRIPT
# ============================================
# Script pour redémarrer automatiquement le conteneur
# Utilisé après le changement de PIN admin

set -e

CONTAINER_NAME="${1:-mick-web}"
LOG_FILE="/tmp/container-restart.log"

echo "$(date): Redémarrage du conteneur $CONTAINER_NAME demandé" >> "$LOG_FILE"

# Attendre 2 secondes pour que la requête API se termine
sleep 2

# Redémarrer le conteneur
if docker restart "$CONTAINER_NAME" >> "$LOG_FILE" 2>&1; then
  echo "$(date): Conteneur $CONTAINER_NAME redémarré avec succès" >> "$LOG_FILE"
  exit 0
else
  echo "$(date): Échec du redémarrage du conteneur $CONTAINER_NAME" >> "$LOG_FILE"
  exit 1
fi

