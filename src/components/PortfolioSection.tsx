'use client';

import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { Project } from '@/lib/baserow';

interface PortfolioSectionProps {
  projects?: Project[];
}

// Mock data si pas de données Baserow
const mockProjects: Project[] = [
  {
    id: 1,
    Nom: 'Automatisation CRM',
    Slug: 'automatisation-crm',
    Tags: [{ id: 1, value: 'n8n', color: 'blue' }, { id: 2, value: 'Web', color: 'green' }],
    DescriptionCourte: 'Synchronisation automatique des contacts entre plusieurs outils métier.',
    ImageCouverture: [],
    LienSite: '',
    Statut: { id: 3068, value: 'Publié', color: 'green' },
    Ordre: '1',
  },
  {
    id: 2,
    Nom: 'Dashboard Analytics',
    Slug: 'dashboard-analytics',
    Tags: [{ id: 2, value: 'Web', color: 'green' }, { id: 3, value: 'Design', color: 'purple' }],
    DescriptionCourte: 'Tableau de bord temps réel pour le suivi des KPIs.',
    ImageCouverture: [],
    LienSite: '',
    Statut: { id: 3068, value: 'Publié', color: 'green' },
    Ordre: '2',
  },
  {
    id: 3,
    Nom: 'Facturation Automatisée',
    Slug: 'facturation-automatisee',
    Tags: [{ id: 1, value: 'n8n', color: 'blue' }],
    DescriptionCourte: 'Génération et envoi automatique des factures mensuelles.',
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

export default function PortfolioSection({ projects }: PortfolioSectionProps) {
  const displayProjects = projects && projects.length > 0 ? projects : mockProjects;

  // Si aucun projet, ne pas afficher la section
  if (!displayProjects || displayProjects.length === 0) {
    return null;
  }

  return (
    <section id="portfolio" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-900/50 to-background" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Nos <span className="text-gradient">projets</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Découvrez quelques-unes de nos réalisations pour des PME suisses.
          </p>
        </motion.div>

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden
                            hover:border-primary-500/30 transition-all duration-500
                            hover:shadow-xl hover:shadow-primary-500/10">
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

