#!/usr/bin/env python3
"""
============================================
BASEROW FIELD CREATOR - White Label Factory
============================================
Crée tous les champs pour l'architecture modulaire.
"""

import sys
import time
import requests

BASEROW_URL = "https://baserow.mick-solutions.ch"
TABLE_ID = 751

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def log_success(msg): print(f"{Colors.GREEN}✅ {msg}{Colors.RESET}")
def log_warning(msg): print(f"{Colors.YELLOW}⚠️  {msg}{Colors.RESET}")
def log_error(msg): print(f"{Colors.RED}❌ {msg}{Colors.RESET}")
def log_category(msg): print(f"\n{Colors.CYAN}{Colors.BOLD}=== {msg} ==={Colors.RESET}")

class BaserowFieldCreator:
    def __init__(self, email, password):
        self.email = email
        self.password = password
        self.session = requests.Session()
        self.existing_fields = set()
        
    def authenticate(self):
        print(f"🔐 Authentification avec {self.email}...")
        response = self.session.post(
            f"{BASEROW_URL}/api/user/token-auth/",
            json={"email": self.email, "password": self.password}
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token") or data.get("token")
            self.session.headers.update({"Authorization": f"JWT {token}"})
            log_success("Authentification réussie!")
            return True
        else:
            log_error(f"Erreur d'authentification: {response.text}")
            return False
    
    def load_existing_fields(self):
        response = self.session.get(f"{BASEROW_URL}/api/database/fields/table/{TABLE_ID}/")
        if response.status_code == 200:
            self.existing_fields = {f["name"] for f in response.json()}
            print(f"📋 {len(self.existing_fields)} champs existants trouvés")
        return self.existing_fields
    
    def create_field(self, name, field_type, options=None):
        if name in self.existing_fields:
            log_warning(f"'{name}' existe déjà")
            return None
        
        payload = {"name": name, "type": field_type}
        
        if field_type == "single_select" and options:
            payload["select_options"] = [{"value": opt, "color": "light-gray"} for opt in options]
        elif field_type == "multiple_select" and options:
            payload["select_options"] = [{"value": opt, "color": "light-blue"} for opt in options]
        elif field_type == "number":
            payload["number_decimal_places"] = 2
            payload["number_negative"] = False
        
        response = self.session.post(
            f"{BASEROW_URL}/api/database/fields/table/{TABLE_ID}/",
            json=payload
        )
        
        if response.status_code in [200, 201]:
            log_success(f"'{name}' créé")
            self.existing_fields.add(name)
            return response.json().get("id")
        else:
            log_error(f"'{name}': {response.text[:80]}")
            return None
    
    def create_all_fields(self):
        # ============================================
        # A. BOOLÉENS D'ACTIVATION (14)
        # ============================================
        log_category("A. BOOLÉENS D'ACTIVATION")
        for name in [
            "Show_Navbar", "Show_Hero", "Show_Advantages", "Show_Services",
            "Show_Gallery", "Show_Portfolio", "Show_Testimonials", "Show_Trust",
            "Show_FAQ", "Show_Blog", "Show_Contact", "Show_AI_Assistant",
            "Show_Cookie_Banner", "Show_Analytics"
        ]:
            self.create_field(name, "boolean")
            time.sleep(0.15)
        
        # ============================================
        # B. STYLES & THÈMES - Variantes (10)
        # ============================================
        log_category("B. STYLES & THÈMES (Variantes)")
        variants = [
            ("Theme_Global", ["Minimal", "Corporate", "Electric", "Bold", "Custom"]),
            ("Hero_Variant", ["Minimal", "Corporate", "Electric", "Bold", "AI"]),
            ("Navbar_Variant", ["Minimal", "Corporate", "Electric", "Bold"]),
            ("Services_Variant", ["Grid", "Accordion", "Cards", "Showcase"]),
            ("Gallery_Variant", ["Grid", "Slider", "Masonry", "AI"]),
            ("Testimonials_Variant", ["Minimal", "Carousel", "Cards", "Video"]),
            ("FAQ_Variant", ["Minimal", "Accordion", "Tabs", "Search"]),
            ("Contact_Variant", ["Minimal", "Form", "Calendar", "Chat"]),
            ("Footer_Variant", ["Minimal", "Corporate", "Electric", "Bold"]),
            ("AI_Assistant_Style", ["Chat", "Voice", "Banner", "Hidden"]),
        ]
        for name, opts in variants:
            self.create_field(name, "single_select", opts)
            time.sleep(0.15)
        
        # ============================================
        # C. IDENTITÉ & BRANDING (6)
        # ============================================
        log_category("C. IDENTITÉ & BRANDING")
        self.create_field("Couleur_Background", "text")
        self.create_field("Couleur_Text", "text")
        self.create_field("Font_Primary", "single_select", 
            ["Inter", "Poppins", "Space-Grotesk", "Outfit", "Montserrat", "DM-Sans", "Custom"])
        self.create_field("Font_Heading", "single_select",
            ["Inter", "Poppins", "Space-Grotesk", "Outfit", "Montserrat", "DM-Sans", "Custom"])
        self.create_field("Font_Custom_URL", "url")
        self.create_field("Border_Radius", "single_select", ["None", "Small", "Medium", "Large", "Full"])
        time.sleep(0.15)
        
        # ============================================
        # D. ASSETS VISUELS (3)
        # ============================================
        log_category("D. ASSETS VISUELS")
        self.create_field("Hero_Background_URL", "url")
        self.create_field("Hero_Video_URL", "url")
        self.create_field("Pattern_Background", "single_select", 
            ["None", "Grid", "Dots", "Circuit", "Gradient", "Custom"])
        time.sleep(0.15)
        
        # ============================================
        # E. SEO & MÉTADONNÉES (3)
        # ============================================
        log_category("E. SEO & MÉTADONNÉES")
        self.create_field("Locale", "text")
        self.create_field("Robots_Index", "boolean")
        self.create_field("Sitemap_Priority", "number")
        time.sleep(0.15)
        
        # ============================================
        # F. CONTACT & SOCIAL (8)
        # ============================================
        log_category("F. CONTACT & SOCIAL")
        for name in [
            "Telephone", "Adresse_Courte", "Lien_Instagram", "Lien_Twitter",
            "Lien_Youtube", "Lien_Github", "Lien_Calendly", "Lien_Whatsapp"
        ]:
            ftype = "text" if name in ["Telephone", "Adresse_Courte"] else "url"
            self.create_field(name, ftype)
            time.sleep(0.15)
        
        # ============================================
        # G. SECTION HERO (7)
        # ============================================
        log_category("G. SECTION HERO")
        self.create_field("CTA_Principal_URL", "url")
        self.create_field("CTA_Secondaire_URL", "url")
        self.create_field("Trust_Stat_2_Value", "text")
        self.create_field("Trust_Stat_2_Label", "text")
        self.create_field("Trust_Stat_3_Value", "text")
        self.create_field("Trust_Stat_3_Label", "text")
        self.create_field("Hero_AI_Prompt", "long_text")
        time.sleep(0.15)
        
        # ============================================
        # H. FOOTER & LEGAL (4)
        # ============================================
        log_category("H. FOOTER & LEGAL")
        self.create_field("Show_Legal_Links", "boolean")
        self.create_field("Custom_Footer_Text", "long_text")
        self.create_field("Footer_CTA_Text", "text")
        self.create_field("Footer_CTA_URL", "url")
        time.sleep(0.15)
        
        # ============================================
        # I. ANALYTICS & TRACKING (6)
        # ============================================
        log_category("I. ANALYTICS & TRACKING")
        for name in [
            "Umami_Site_ID", "Umami_Script_URL", "GA_Measurement_ID",
            "GTM_Container_ID", "Hotjar_Site_ID", "Facebook_Pixel_ID"
        ]:
            ftype = "url" if "URL" in name else "text"
            self.create_field(name, ftype)
            time.sleep(0.15)
        
        # ============================================
        # J. MODULES IA & WEBHOOKS (14)
        # ============================================
        log_category("J. MODULES IA & WEBHOOKS")
        self.create_field("AI_Mode", "single_select", ["Disabled", "Placeholder", "Live"])
        self.create_field("AI_Provider", "single_select", ["OpenAI", "Anthropic", "n8n", "Custom"])
        self.create_field("AI_API_Key", "text")
        self.create_field("AI_Model", "text")
        self.create_field("AI_System_Prompt", "long_text")
        self.create_field("AI_Webhook_URL", "url")
        self.create_field("AI_Image_Webhook", "url")
        self.create_field("AI_Max_Tokens", "number")
        self.create_field("AI_Temperature", "number")
        self.create_field("Chatbot_Welcome_Message", "long_text")
        self.create_field("Chatbot_Placeholder", "text")
        self.create_field("Chatbot_Avatar_URL", "url")
        self.create_field("Voice_Enabled", "boolean")
        self.create_field("Voice_Language", "single_select", ["fr-FR", "en-US", "de-DE", "it-IT"])
        time.sleep(0.15)
        
        # ============================================
        # K. INTÉGRATIONS EXTERNES (7)
        # ============================================
        log_category("K. INTÉGRATIONS EXTERNES")
        self.create_field("N8N_Webhook_Contact", "url")
        self.create_field("N8N_Webhook_Newsletter", "url")
        self.create_field("Stripe_Public_Key", "text")
        self.create_field("Mailchimp_List_ID", "text")
        self.create_field("Sendgrid_API_Key", "text")
        self.create_field("Notion_Database_ID", "text")
        self.create_field("Airtable_Base_ID", "text")
        time.sleep(0.15)
        
        # ============================================
        # L. SECTION PREMIUM (7)
        # ============================================
        log_category("L. SECTION PREMIUM")
        self.create_field("Is_Premium", "boolean")
        self.create_field("Premium_Until", "date")
        self.create_field("Custom_Domain", "url")
        self.create_field("Custom_CSS", "long_text")
        self.create_field("Custom_JS", "long_text")
        self.create_field("Feature_Flags", "multiple_select", 
            ["Blog", "Shop", "Booking", "Chat", "Multi-lang", "API", "Analytics"])
        self.create_field("Rate_Limit_API", "number")
        
        # ============================================
        # M. TAILLES & DIMENSIONS (Nouveau!)
        # ============================================
        log_category("M. TAILLES & DIMENSIONS")
        self.create_field("Logo_Size", "single_select", ["Small", "Medium", "Large", "XLarge"])
        self.create_field("Hero_Height", "single_select", ["Short", "Medium", "Tall", "FullScreen"])
        self.create_field("Section_Spacing", "single_select", ["Compact", "Normal", "Spacious", "Ultra"])
        self.create_field("Card_Style", "single_select", ["Flat", "Shadow", "Border", "Glassmorphism"])
        time.sleep(0.15)
        
        # ============================================
        # N. ANIMATIONS & EFFETS (Nouveau!)
        # ============================================
        log_category("N. ANIMATIONS & EFFETS")
        self.create_field("Enable_Animations", "boolean")
        self.create_field("Animation_Speed", "single_select", ["Slow", "Normal", "Fast", "Instant"])
        self.create_field("Scroll_Effect", "single_select", ["None", "Fade", "Slide", "Zoom", "Parallax"])
        self.create_field("Hover_Effect", "single_select", ["None", "Scale", "Glow", "Lift", "Shake"])
        self.create_field("Loading_Style", "single_select", ["None", "Skeleton", "Spinner", "Progress"])
        time.sleep(0.15)
        
        # ============================================
        # O. PHOTOS & MEDIAS (Nouveau!)
        # ============================================
        log_category("O. PHOTOS & MÉDIAS")
        self.create_field("Image_Style", "single_select", ["Square", "Rounded", "Circle", "Custom"])
        self.create_field("Image_Filter", "single_select", ["None", "Grayscale", "Sepia", "Contrast", "Blur"])
        self.create_field("Gallery_Columns", "single_select", ["2", "3", "4", "Auto"])
        self.create_field("Video_Autoplay", "boolean")
        self.create_field("Lazy_Loading", "boolean")
        time.sleep(0.15)
        
        # ============================================
        # P. MODULE IA AVANCÉ (Nouveau!)
        # ============================================
        log_category("P. MODULE IA AVANCÉ")
        self.create_field("AI_Generate_Hero", "boolean")
        self.create_field("AI_Generate_Services", "boolean")
        self.create_field("AI_Generate_FAQ", "boolean")
        self.create_field("AI_Tone", "single_select", ["Professional", "Friendly", "Casual", "Formal"])
        self.create_field("AI_Industry", "single_select", 
            ["Tech", "Finance", "Health", "Retail", "Services", "Other"])
        self.create_field("AI_Target_Audience", "text")
        self.create_field("AI_Keywords", "long_text")
        self.create_field("AI_Last_Generation", "date")
        
        log_success("\n🎉 CRÉATION TERMINÉE!")


def main():
    email = sys.argv[1] if len(sys.argv) > 1 else None
    password = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not email or not password:
        print("Usage: python3 create-baserow-fields.py email password")
        sys.exit(1)
    
    print(f"""
{Colors.CYAN}{Colors.BOLD}
============================================
🏭 WHITE LABEL FACTORY - BASEROW SETUP
============================================{Colors.RESET}
Table ID: {TABLE_ID}
""")
    
    creator = BaserowFieldCreator(email, password)
    
    if creator.authenticate():
        creator.load_existing_fields()
        creator.create_all_fields()

if __name__ == "__main__":
    main()

