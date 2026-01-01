'use client';

import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { Project } from '@/lib/baserow';

// ============================================
// VARIANT TYPES
// ============================================
type VariantType = 'Electric' | 'Minimal' | 'Corporate' | 'Bold';
type CardStyle = 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism';
type HoverEffect = 'None' | 'Scale' | 'Glow' | 'Lift';
type LayoutType = 'Grid' | 'Masonry' | 'Carousel';

import type { SectionEffectsProps } from '@/lib/types/section-props';
import { getFontFamilyStyle } from '@/lib/helpers/effects-renderer';

interface PortfolioSectionProps extends SectionEffectsProps {
  projects?: Project[];
  variant?: VariantType;
  cardStyle?: CardStyle;
  hoverEffect?: HoverEffect;
  layout?: LayoutType;
  title?: string;
  subtitle?: string;
}

// Default pedagogical projects
const defaultProjects: Project[] = [
  {
    id: 1,
    Nom: '[Nom du projet 1]',
    Slug: 'projet-1',
    Tags: [{ id: 1, value: 'Catégorie', color: 'blue' }],
    DescriptionCourte: 'Décrivez ce projet : objectifs, technologies utilisées et résultats obtenus pour le client.',
    ImageCouverture: [],
    LienSite: '',
    Statut: { id: 3068, value: 'Publié', color: 'green' },
    Ordre: '1',
  },
  {
    id: 2,
    Nom: '[Nom du projet 2]',
    Slug: 'projet-2',
    Tags: [{ id: 2, value: 'Web', color: 'green' }],
    DescriptionCourte: 'Expliquez les défis rencontrés et comment vous les avez résolus.',
    ImageCouverture: [],
    LienSite: '',
    Statut: { id: 3068, value: 'Publié', color: 'green' },
    Ordre: '2',
  },
  {
    id: 3,
    Nom: '[Nom du projet 3]',
    Slug: 'projet-3',
    Tags: [{ id: 3, value: 'Design', color: 'purple' }],
    DescriptionCourte: 'Présentez les bénéfices concrets pour votre client et les métriques de succès.',
    ImageCouverture: [],
    LienSite: '',
    Statut: { id: 3068, value: 'Publié', color: 'green' },
    Ordre: '3',
  },
];

// Couleurs des tags
const tagColors: Record<string, string> = {
  'n8n': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Web': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Design': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'SEO': 'bg-green-500/20 text-green-300 border-green-500/30',
};

export default function PortfolioSection({ 
  projects,
  variant: _variant = 'Electric', // eslint-disable-line @typescript-eslint/no-unused-vars
  cardStyle = 'Shadow',
  hoverEffect = 'Scale',
  layout = 'Grid',
  title = 'Nos projets',
  subtitle = 'Découvrez quelques-unes de nos réalisations.',
  effects,
  textSettings,
}: PortfolioSectionProps) {
  const displayProjects = projects && projects.length > 0 ? projects : defaultProjects;
  
  // ========== EFFECTS ==========
  const bgUrl = effects?.backgroundUrl;
  const bgOpacity = effects?.backgroundOpacity !== undefined ? effects.backgroundOpacity / 100 : 1;
  const showBlobs = effects?.showBlobs !== false;
  
  // Card style classes
  const getCardStyleClasses = () => {
    switch (cardStyle) {
      case 'Flat': return 'bg-slate-900/30';
      case 'Border': return 'bg-slate-900/50 border-2 border-primary-200';
      case 'Glassmorphism': return 'bg-white/10 backdrop-blur-md border border-white/20';
      case 'Shadow':
      default: return 'bg-slate-900/50 border border-white/5 hover:border-primary-500/30 shadow-lg';
    }
  };
  
  // Hover effect classes
  const getHoverEffectClasses = () => {
    switch (hoverEffect) {
      case 'None': return '';
      case 'Glow': return 'hover:shadow-xl hover:shadow-primary-500/20';
      case 'Lift': return 'hover:-translate-y-2';
      case 'Scale':
      default: return 'hover:scale-[1.02]';
    }
  };
  
  // Grid classes based on layout
  const getGridClasses = () => {
    switch (layout) {
      case 'Masonry': return 'columns-1 md:columns-2 lg:columns-3 gap-6';
      case 'Carousel': return 'flex overflow-x-auto gap-6 snap-x snap-mandatory pb-4';
      case 'Grid':
      default: return 'grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8';
    }
  };

  // Si aucun projet, ne pas afficher la section
  if (!displayProjects || displayProjects.length === 0) {
    return null;
  }

  return (
    <section id="portfolio" className="relative py-24 overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {bgUrl ? (
          <Image
            src={bgUrl}
            alt=""
            fill
            className="object-cover"
            style={{ opacity: bgOpacity }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-900/50 to-background" />
        )}
        {showBlobs && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-medium mb-4">
            Réalisations
          </span>
          <h2 
            className={`${textSettings?.titleFontSize || 'text-3xl sm:text-4xl lg:text-5xl'} ${textSettings?.titleFontWeight || 'font-bold'} ${textSettings?.titleColor || 'text-white'} mb-4`}
            style={getFontFamilyStyle(textSettings?.titleFontFamily)}
          >
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-gradient">{title.split(' ').slice(-1)}</span>
          </h2>
          <p 
            className={`${textSettings?.subtitleFontSize || 'text-lg'} ${textSettings?.subtitleColor || 'text-slate-400'} max-w-2xl mx-auto`}
            style={getFontFamilyStyle(textSettings?.subtitleFontFamily)}
          >
            {subtitle}
          </p>
        </motion.div>

        {/* Projects grid/layout */}
        <div className={layout === 'Grid' ? getGridClasses() : layout === 'Masonry' ? 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6' : 'flex overflow-x-auto gap-6 snap-x snap-mandatory pb-4'}>
          {displayProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative ${layout === 'Carousel' ? 'flex-shrink-0 w-80 snap-center' : layout === 'Masonry' ? 'break-inside-avoid mb-6' : ''}`}
            >
              <div className={`relative h-full rounded-2xl overflow-hidden transition-all duration-500 ${getCardStyleClasses()} ${getHoverEffectClasses()}`}>
                {/* Image de couverture */}
                <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                  {project.ImageCouverture && project.ImageCouverture.length > 0 ? (
                    <Image
                      src={project.ImageCouverture[0].url}
                      alt={project.Nom}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 
                                    flex items-center justify-center border border-white/10">
                        <span className="text-3xl font-bold text-gradient">
                          {project.Nom.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.Tags.map((tag) => (
                      <span
                        key={tag.id}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border
                                  ${tagColors[tag.value] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}
                      >
                        {tag.value}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {project.Nom}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {project.DescriptionCourte}
                  </p>

                  {/* Link */}
                  {project.LienSite && (
                    <a
                      href={project.LienSite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <span>Voir le projet</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-500/20 transition-all duration-500 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white
                     bg-gradient-to-r from-primary-500 to-accent-500
                     hover:from-primary-400 hover:to-accent-400
                     shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40
                     transition-all duration-300 hover:scale-105"
          >
            <span>Discuter de votre projet</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

