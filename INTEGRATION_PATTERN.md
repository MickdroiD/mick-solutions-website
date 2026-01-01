// ============================================
// PATTERN D'INTÉGRATION POUR TOUS LES FORMULAIRES DE SECTION
// ============================================

// Étape 1: Ajouter les imports (après les imports existants)
import { SectionEffects, type EffectSettings } from '@/components/admin/v2/ui/SectionEffects';
import { SectionText, type TextSettings } from '@/components/admin/v2/ui/SectionText';

// Étape 2: Dans le return(), avant la fermeture du </div>, ajouter :

      {/* Effects & Animations */}
      <SectionEffects
        effects={(section.effects || {}) as EffectSettings}
        onChange={(updates) => onUpdate({ effects: { ...(section.effects || {}), ...updates } })}
        showLogoOptions={false}  // true si la section a un logo (Hero, Header, Footer)
        showBackgroundOptions={true}
      />

      {/* Text Styling */}
      <SectionText
        text={(section.textSettings || {}) as TextSettings}
        onChange={(updates) => onUpdate({ textSettings: { ...(section.textSettings || {}), ...updates } })}
        showTitleOptions={true}
        showSubtitleOptions={true}
        showBodyOptions={true}
      />

// ============================================
// FICHIERS À MODIFIER (dans l'ordre de priorité)
// ============================================

✅ COMPLÉTÉS:
- HeroForm.tsx
- ServicesForm.tsx

⏳ À FAIRE:
1. Contact Form (prioritaire - formulaire)
2. FAQForm (prioritaire - questions)
3. TestimonialsForm (prioritaire - témoignages)
4. AdvantagesForm (moyen)
5. GalleryForm (moyen)
6. PortfolioForm (moyen)
7. TrustForm (moyen)
8. BlogForm (moyen)
9. AIAssistantForm (bas)
10. CustomForm (bas)

📝 SPÉCIAUX (GlobalConfig):
- HeaderForm.tsx - modifier branding.headerEffects et branding.headerTextSettings
- FooterForm.tsx - modifier branding.footerEffects et branding.footerTextSettings

