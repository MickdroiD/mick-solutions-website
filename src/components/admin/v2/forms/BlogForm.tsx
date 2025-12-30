'use client';

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Layout, Eye, Settings
} from 'lucide-react';
import { LocalInput } from '@/components/admin/ui/LocalInput';
import type { BlogSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface BlogFormProps {
  section: BlogSection & { _rowId?: number };
  onUpdate: (updates: Partial<BlogSection>) => void;
}

// ============================================
// OPTIONS
// ============================================

const VARIANT_OPTIONS = [
  { value: 'Minimal', label: 'Minimal', emoji: '🎯', description: 'Style épuré' },
  { value: 'Electric', label: 'Électrique', emoji: '⚡', description: 'Style dynamique' },
  { value: 'Corporate', label: 'Corporate', emoji: '🏢', description: 'Style professionnel' },
  { value: 'Bold', label: 'Bold', emoji: '💪', description: 'Style moderne' },
];

const CARD_STYLE_OPTIONS = [
  { value: 'Flat', label: 'Plat', description: 'Sans ombre' },
  { value: 'Shadow', label: 'Ombré', description: 'Avec ombres douces' },
  { value: 'Outlined', label: 'Bordure', description: 'Contour visible' },
  { value: 'Glass', label: 'Verre', description: 'Effet glassmorphism' },
];

const HOVER_EFFECT_OPTIONS = [
  { value: 'None', label: 'Aucun', description: 'Pas d\'effet' },
  { value: 'Scale', label: 'Agrandir', description: 'Zoom au survol' },
  { value: 'Glow', label: 'Lueur', description: 'Effet lumineux' },
  { value: 'Lift', label: 'Élever', description: 'Soulèvement' },
];

// ============================================
// BLOG FORM COMPONENT
// ============================================

function BlogFormComponent({ section, onUpdate }: BlogFormProps) {
  // ========== HANDLERS ==========
  const updateContent = useCallback((key: string, value: unknown) => {
    onUpdate({
      content: {
        ...section.content,
        [key]: value,
      },
    });
  }, [section.content, onUpdate]);

  const updateDesign = useCallback((key: string, value: unknown) => {
    onUpdate({
      design: {
        ...section.design,
        [key]: value,
      },
    });
  }, [section.design, onUpdate]);

  return (
    <div className="space-y-6">
      {/* ========== HEADER ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl p-6 border border-white/5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">Section Blog</h2>
            <p className="text-slate-400 text-sm">Gérez l&apos;affichage de vos articles</p>
          </div>
        </div>

        {/* Section Active Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
          <div>
            <h4 className="text-white font-medium">Section active</h4>
            <p className="text-slate-500 text-sm">Affiche la section blog sur votre site</p>
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ isActive: !section.isActive })}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              section.isActive 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500' 
                : 'bg-slate-700'
            }`}
          >
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
              section.isActive ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
      </motion.div>

      {/* ========== CONTENT ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 rounded-2xl p-6 border border-white/5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-400" />
          Contenu
        </h3>

        <div className="space-y-4">
          <LocalInput
            label="Titre de la section"
            value={section.content.titre}
            onChange={(v) => updateContent('titre', v)}
            placeholder="Blog"
          />

          <LocalInput
            label="Sous-titre"
            value={section.content.sousTitre || ''}
            onChange={(v) => updateContent('sousTitre', v || null)}
            placeholder="Nos dernières actualités"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-white font-medium text-sm">Articles par page</label>
              <input
                type="number"
                value={section.content.postsPerPage}
                onChange={(e) => updateContent('postsPerPage', parseInt(e.target.value) || 6)}
                min={1}
                max={24}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-8">
              <button
                type="button"
                onClick={() => updateContent('showCategories', !section.content.showCategories)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                  section.content.showCategories
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-white/10 text-slate-400'
                }`}
              >
                <Eye className="w-4 h-4" />
                Afficher les catégories
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========== DESIGN ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 rounded-2xl p-6 border border-white/5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Layout className="w-5 h-5 text-orange-400" />
          Design
        </h3>

        {/* Variant */}
        <div className="space-y-2 mb-6">
          <label className="text-white font-medium text-sm">Variante</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {VARIANT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('variant', opt.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  section.design.variant === opt.value
                    ? 'border-orange-500 bg-orange-500/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-xl block mb-1">{opt.emoji}</span>
                <span className={`font-medium text-sm block ${
                  section.design.variant === opt.value ? 'text-orange-400' : 'text-white'
                }`}>
                  {opt.label}
                </span>
                <span className="text-slate-500 text-xs">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Card Style */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm">Style des cartes</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CARD_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('cardStyle', opt.value)}
                className={`px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                  section.design.cardStyle === opt.value
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="block font-medium">{opt.label}</span>
                <span className="text-xs opacity-60">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hover Effect */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Effet au survol</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {HOVER_EFFECT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('hoverEffect', opt.value)}
                className={`px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                  section.design.hoverEffect === opt.value
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="block font-medium">{opt.label}</span>
                <span className="text-xs opacity-60">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-slate-800/30 border border-white/5 rounded-xl"
      >
        <p className="text-slate-400 text-sm">
          💡 Les articles de blog sont gérés séparément. Cette section configure uniquement l&apos;affichage de la liste des articles sur la page d&apos;accueil.
        </p>
      </motion.div>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const BlogForm = memo(BlogFormComponent);
