#!/usr/bin/env python3
"""
==============================================
CHECK CONFIG - Diagnostic Baserow Table 751
==============================================
Vérifie la connexion et la structure des données Global_Infos.
Adapté pour le nouveau format "File" des champs images.

Usage:
    export BASEROW_API_TOKEN="votre_token"
    python scripts/check_config.py
"""

import os
import sys
import requests
import re
from typing import Any, Optional

# Configuration
BASEROW_API_TOKEN = os.getenv("BASEROW_API_TOKEN")
BASEROW_BASE_URL = "https://baserow.mick-solutions.ch/api/database/rows/table"
TABLE_ID = 751  # SITEWEB Global_Infos

# Couleurs ANSI pour le terminal
class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    END = "\033[0m"


def ok(msg: str) -> str:
    return f"{Colors.GREEN}✅ {msg}{Colors.END}"


def error(msg: str) -> str:
    return f"{Colors.RED}❌ {msg}{Colors.END}"


def warn(msg: str) -> str:
    return f"{Colors.YELLOW}⚠️  {msg}{Colors.END}"


def info(msg: str) -> str:
    return f"{Colors.CYAN}ℹ️  {msg}{Colors.END}"


def header(msg: str) -> str:
    return f"\n{Colors.BOLD}{Colors.CYAN}{'='*50}\n{msg}\n{'='*50}{Colors.END}\n"


def extract_file_url(field_value: Any, field_name: str) -> Optional[str]:
    """
    Extrait l'URL d'un champ File Baserow.
    
    Baserow File field format:
    - Si le champ est vide: [] ou None
    - Si le champ contient des fichiers: [{"url": "...", "name": "...", ...}, ...]
    
    Returns:
        L'URL du premier fichier si présent, sinon None
    """
    # Cas 1: Champ vide ou null
    if field_value is None:
        return None
    
    # Cas 2: String vide (ancien format texte)
    if isinstance(field_value, str):
        if field_value.strip() == "":
            return None
        # C'est probablement l'ancien format texte, retourner tel quel
        print(warn(f"  {field_name}: Format STRING détecté (ancien format)"))
        return field_value
    
    # Cas 3: Array de fichiers (nouveau format)
    if isinstance(field_value, list):
        if len(field_value) == 0:
            return None
        
        # Prendre le premier fichier
        first_file = field_value[0]
        if isinstance(first_file, dict) and "url" in first_file:
            return first_file["url"]
        
        print(error(f"  {field_name}: Format Array invalide - pas de clé 'url'"))
        return None
    
    print(error(f"  {field_name}: Format inconnu: {type(field_value)}"))
    return None


def is_valid_hex_color(color: str) -> bool:
    """Vérifie si une string est un code couleur hex valide (#RRGGBB ou #RGB)."""
    if not color:
        return False
    pattern = r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
    return bool(re.match(pattern, color))


def is_valid_url(url: str) -> bool:
    """Vérifie si une string est une URL valide."""
    if not url:
        return False
    return url.startswith("http://") or url.startswith("https://") or url.startswith("/")


def main():
    print(header("🔍 DIAGNOSTIC BASEROW - Table 751 (Global_Infos)"))
    
    # ==========================================
    # 1. Vérification du Token
    # ==========================================
    print(header("1. VÉRIFICATION TOKEN API"))
    
    if not BASEROW_API_TOKEN:
        print(error("BASEROW_API_TOKEN non défini !"))
        print(info("Utilisez: export BASEROW_API_TOKEN='votre_token'"))
        sys.exit(1)
    
    print(ok(f"Token présent: {BASEROW_API_TOKEN[:20]}..."))
    
    # ==========================================
    # 2. Connexion à Baserow
    # ==========================================
    print(header("2. CONNEXION BASEROW"))
    
    try:
        url = f"{BASEROW_BASE_URL}/{TABLE_ID}/"
        params = {"user_field_names": "true", "size": 1}
        headers = {"Authorization": f"Token {BASEROW_API_TOKEN}"}
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(error(f"Erreur HTTP: {response.status_code}"))
            print(info(f"Réponse: {response.text[:200]}..."))
            sys.exit(1)
        
        data = response.json()
        print(ok(f"Connexion réussie ! {data['count']} row(s) trouvée(s)"))
        
    except requests.exceptions.RequestException as e:
        print(error(f"Erreur de connexion: {e}"))
        sys.exit(1)
    
    # ==========================================
    # 3. Analyse de la structure
    # ==========================================
    print(header("3. ANALYSE DES CHAMPS FICHIERS (File Fields)"))
    
    if not data["results"]:
        print(warn("Aucune donnée dans la table !"))
        sys.exit(0)
    
    row = data["results"][0]
    
    # Liste des champs qui sont maintenant des File fields
    file_fields = [
        "Logo URL",
        "Logo Dark URL",
        "Favicon URL",
        "OG Image URL",
        "Hero_Background_URL",
        "Hero_Video_URL",
        "Chatbot_Avatar_URL",
    ]
    
    print(f"\n{Colors.BOLD}Champs Image/Fichier:{Colors.END}")
    
    for field in file_fields:
        raw_value = row.get(field)
        extracted_url = extract_file_url(raw_value, field)
        
        # Déterminer le type de champ
        if raw_value is None:
            field_type = "NULL"
        elif isinstance(raw_value, list):
            field_type = f"FILE_ARRAY[{len(raw_value)}]"
        elif isinstance(raw_value, str):
            field_type = "STRING" if raw_value else "EMPTY_STRING"
        else:
            field_type = str(type(raw_value).__name__)
        
        if extracted_url:
            print(ok(f"  {field}: {field_type}"))
            # Afficher l'URL tronquée
            display_url = extracted_url[:60] + "..." if len(extracted_url) > 60 else extracted_url
            print(f"       → {display_url}")
        else:
            print(warn(f"  {field}: {field_type} (vide/non défini)"))
    
    # ==========================================
    # 4. Vérification des couleurs
    # ==========================================
    print(header("4. VÉRIFICATION DES COULEURS"))
    
    color_fields = {
        "Couleur Primaire": row.get("Couleur Primaire"),
        "Couleur Accent": row.get("Couleur Accent"),
        "Couleur_Background": row.get("Couleur_Background"),
        "Couleur_Text": row.get("Couleur_Text"),
    }
    
    for name, value in color_fields.items():
        if value and is_valid_hex_color(value):
            print(ok(f"  {name}: {value}"))
        elif value:
            print(warn(f"  {name}: '{value}' (format invalide, attendu: #RRGGBB)"))
        else:
            print(warn(f"  {name}: Non défini"))
    
    # ==========================================
    # 5. Vérification des champs critiques
    # ==========================================
    print(header("5. CHAMPS CRITIQUES"))
    
    critical_fields = {
        "Nom Site": row.get("Nom Site"),
        "Email": row.get("Email"),
        "Titre Hero": row.get("Titre Hero"),
        "Meta Titre": row.get("Meta Titre"),
        "Meta Description": row.get("Meta Description"),
    }
    
    for name, value in critical_fields.items():
        if value and len(str(value).strip()) > 0:
            display_value = str(value)[:50] + "..." if len(str(value)) > 50 else str(value)
            print(ok(f"  {name}: {display_value}"))
        else:
            print(error(f"  {name}: MANQUANT !"))
    
    # ==========================================
    # 6. Vérification des animations logo
    # ==========================================
    print(header("6. ANIMATIONS LOGO (par zone)"))
    
    logo_animation_fields = {
        "header_logo_animation": row.get("header_logo_animation"),
        "hero_logo_animation": row.get("hero_logo_animation"),
        "footer_logo_animation": row.get("footer_logo_animation"),
    }
    
    for name, value in logo_animation_fields.items():
        if value:
            if isinstance(value, dict):
                anim_value = value.get("value", "?")
                print(ok(f"  {name}: {anim_value} (Select ID: {value.get('id')})"))
            else:
                print(ok(f"  {name}: {value}"))
        else:
            print(warn(f"  {name}: Non défini (fallback 'none')"))
    
    # ==========================================
    # RÉSUMÉ
    # ==========================================
    print(header("📊 RÉSUMÉ"))
    
    # Compter les champs fichiers configurés
    configured_files = sum(1 for f in file_fields if extract_file_url(row.get(f), f))
    total_files = len(file_fields)
    
    # Compter les couleurs valides
    valid_colors = sum(1 for v in color_fields.values() if v and is_valid_hex_color(v))
    total_colors = len(color_fields)
    
    # Compter les champs critiques remplis
    filled_critical = sum(1 for v in critical_fields.values() if v and len(str(v).strip()) > 0)
    total_critical = len(critical_fields)
    
    print(f"  Fichiers configurés:  {configured_files}/{total_files}")
    print(f"  Couleurs valides:     {valid_colors}/{total_colors}")
    print(f"  Champs critiques:     {filled_critical}/{total_critical}")
    
    # Score global
    score = (configured_files + valid_colors + filled_critical) / (total_files + total_colors + total_critical) * 100
    
    if score >= 80:
        print(ok(f"\n  Score global: {score:.0f}% - Configuration excellente !"))
    elif score >= 50:
        print(warn(f"\n  Score global: {score:.0f}% - Configuration partielle"))
    else:
        print(error(f"\n  Score global: {score:.0f}% - Configuration incomplète"))
    
    print(f"\n{Colors.CYAN}{'='*50}{Colors.END}")
    print(info("Pour mettre à jour les données, utilisez l'interface Baserow"))
    print(info("ou le MCP Baserow intégré à Cursor."))


if __name__ == "__main__":
    main()

