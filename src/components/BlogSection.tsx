'use client';

import { motion } from 'framer-motion';
import { BookOpen, Plus, FileText } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  publishedAt?: string;
  author?: string;
  category?: string;
}

type VariantType = 'Minimal' | 'Electric' | 'Corporate' | 'Bold';
type CardStyle = 'Flat' | 'Shadow' | 'Outlined' | 'Glass';
type HoverEffect = 'None' | 'Scale' | 'Glow' | 'Lift';

interface BlogSectionProps {
  posts: BlogPost[] | null;
  /** Mode admin/dev pour afficher les placeholders */
  isDevMode?: boolean;
  variant?: VariantType;
  cardStyle?: CardStyle;
  hoverEffect?: HoverEffect;
  title?: string;
  subtitle?: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function BlogSection({ 
  posts, 
  isDevMode = false,
  variant = 'Electric',
  cardStyle = 'Shadow',
  hoverEffect = 'Glow',
  title = 'Nos derniers articles',
  subtitle = 'Découvrez nos conseils, actualités et retours d\'expérience.',
}: BlogSectionProps) {
  const hasPosts = posts && posts.length > 0;

  // Card style classes
  const getCardStyleClasses = () => {
    switch (cardStyle) {
      case 'Flat': return 'bg-white/5';
      case 'Outlined': return 'bg-white/5 border-2 border-white/20';
      case 'Glass': return 'bg-white/10 backdrop-blur-md border border-white/20';
      case 'Shadow':
      default: return 'bg-white/5 border border-white/10 shadow-lg';
    }
  };

  // Hover effect classes
  const getHoverEffectClasses = () => {
    switch (hoverEffect) {
      case 'None': return '';
      case 'Scale': return 'hover:scale-[1.02]';
      case 'Lift': return 'hover:-translate-y-2 hover:shadow-xl';
      case 'Glow':
      default: return 'hover:shadow-primary-500/20 hover:border-primary-500/30';
    }
  };

  // Si pas d'articles et pas en mode dev, ne rien afficher
  if (!hasPosts && !isDevMode) {
    return null;
  }

  return (
    <section id="blog" className="py-20 md:py-28 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Blog
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Contenu conditionnel */}
        {hasPosts ? (
          /* Grille d'articles */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group rounded-2xl overflow-hidden transition-all duration-300 ${getCardStyleClasses()} ${getHoverEffectClasses()}`}
              >
                {/* Image de couverture */}
                {post.coverImage && (
                  <div className="aspect-video overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                
                {/* Contenu */}
                <div className="p-6">
                  {post.category && (
                    <span className="text-xs text-primary-400 font-medium uppercase tracking-wider">
                      {post.category}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-white mt-2 mb-3 group-hover:text-primary-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    {post.author && <span>{post.author}</span>}
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          /* Placeholder pour section vide (mode Admin/Dev) */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              {/* Icône illustrative */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-dashed border-primary-500/30 flex items-center justify-center">
                <FileText className="w-10 h-10 text-primary-400/50" />
              </div>
              
              {/* Texte explicatif */}
              <h3 className="text-xl font-semibold text-white/80 mb-3">
                Vos futurs articles apparaîtront ici
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                La section Blog est activée mais aucun article n&apos;a encore été publié. 
                Ajoutez votre premier article dans le panneau d&apos;administration.
              </p>
              
              {/* Bouton d'action (visible uniquement en dev) */}
              {isDevMode && (
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500/20 border border-primary-500/30 text-primary-400 text-sm font-medium hover:bg-primary-500/30 transition-all">
                  <Plus className="w-4 h-4" />
                  Ajouter un article
                </button>
              )}
              
              {/* Exemples de cards vides (skeleton) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 opacity-30">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] rounded-xl bg-white/5 border border-white/10 border-dashed"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

