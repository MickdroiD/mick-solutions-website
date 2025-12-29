'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Mail,
  Database,
  ShieldCheck,
  FileText,
  Users,
  BarChart3,
  Server,
  Bot,
  Code2,
  Zap,
  Globe,
  Settings,
  Cpu,
  Cloud,
  Lock,
  Workflow,
  HelpCircle,
  X,
  Check,
  Calendar,
  CreditCard,
} from 'lucide-react';
import type { Service, BaserowTag, BaserowSelectOption } from '@/lib/baserow';

// ============================================
// ICON MAPPING - Lucide Icons
// ============================================
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Noms standards (lowercase)
  mail: Mail,
  database: Database,
  shield: ShieldCheck,
  shieldcheck: ShieldCheck,
  file: FileText,
  filetext: FileText,
  users: Users,
  chart: BarChart3,
  barchart3: BarChart3,
  server: Server,
  bot: Bot,
  code: Code2,
  code2: Code2,
  zap: Zap,
  globe: Globe,
  settings: Settings,
  cpu: Cpu,
  cloud: Cloud,
  lock: Lock,
  workflow: Workflow,
  calendar: Calendar,
  creditcard: CreditCard,
};

// Fonction pour obtenir l'icône par nom
function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  if (!iconName) return HelpCircle;
  const normalizedName = iconName.toLowerCase().replace(/[-_\s]/g, '').trim();
  return iconMap[normalizedName] || HelpCircle;
}

// ============================================
// TYPES LOCAUX
// ============================================

interface ServiceCardProps {
  service: Service;
  index: number;
  isInView: boolean;
  onClick: () => void;
}

// ============================================
// DEFAULT SERVICES (Fallback)
// ============================================
const defaultServices: Service[] = [
  {
    id: 1,
    Titre: 'Secrétariat Virtuel Automatisé',
    Description: 'Traitement d\'emails, factures, RDV avec une automatisation intelligente qui travaille pour vous 24/7.',
    Icone: 'mail',
    Ordre: '1',
    Tagline: 'Traitement d\'emails, factures, RDV',
    tags: [],
    points_cle: 'Réponses automatiques personnalisées\nGestion des pièces jointes\nClassement intelligent\nNotifications en temps réel',
    type: { id: 1, value: 'Abonnement', color: 'blue' },
    tarif: 'Dès 49.- CHF/mois',
  },
  {
    id: 2,
    Titre: 'Centralisation de vos Données',
    Description: 'Fini les fichiers Excel perdus, tout est au même endroit, accessible et sécurisé.',
    Icone: 'database',
    Ordre: '2',
    Tagline: 'Fini les fichiers Excel perdus',
    tags: [],
    points_cle: 'Base de données centralisée\nAccès multi-utilisateurs\nRecherche instantanée\nExport vers Excel/PDF',
    type: { id: 2, value: 'Projet', color: 'green' },
    tarif: 'Sur devis',
  },
  {
    id: 3,
    Titre: 'Sérénité & Sécurité Suisse',
    Description: 'Sauvegardes automatiques, confidentialité totale, hébergement en Suisse.',
    Icone: 'shield',
    Ordre: '3',
    Tagline: 'Sauvegardes automatiques, confidentialité totale',
    tags: [],
    points_cle: 'Hébergement suisse\nSauvegardes quotidiennes\nChiffrement de bout en bout\nConformité RGPD',
    type: { id: 1, value: 'Abonnement', color: 'blue' },
    tarif: 'Inclus dans nos formules',
  },
];

// ============================================
// TYPE BADGE COMPONENT
// ============================================
function TypeBadge({ type }: { type: BaserowSelectOption | null }) {
  if (!type) return null;

  const isAbonnement = type.value.toLowerCase().includes('abonnement');
  
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        ${isAbonnement 
          ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' 
          : 'bg-accent-500/20 text-accent-300 border border-accent-500/30'
        }
      `}
    >
      {isAbonnement ? <Calendar className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
      {type.value}
    </span>
  );
}

// ============================================
// TAG BADGE COMPONENT
// ============================================
function TagBadge({ tag }: { tag: BaserowTag }) {
  // Mapping couleurs Baserow vers Tailwind
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    gray: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    'light-blue': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    'light-green': 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    'light-red': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'light-yellow': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'light-orange': 'bg-orange-400/20 text-orange-200 border-orange-400/30',
    'light-purple': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    'light-pink': 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    'light-cyan': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    'light-gray': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  };

  const colorClasses = colorMap[tag.color] || colorMap.gray;

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}>
      {tag.value}
    </span>
  );
}

// ============================================
// SERVICE CARD COMPONENT
// ============================================
function ServiceCard({ service, index, isInView, onClick }: ServiceCardProps) {
  const IconComponent = getIcon(service.Icone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-full p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent-500/30 transition-all duration-500 overflow-hidden hover:scale-[1.02] active:scale-[0.98]">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/0 to-primary-500/0 group-hover:from-accent-500/5 group-hover:to-primary-500/5 transition-all duration-500" />
        
        {/* Decorative line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          {/* Header: Icon + Type Badge */}
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500/20 to-primary-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <IconComponent className="w-8 h-8 text-accent-400" />
            </div>
            <TypeBadge type={service.type} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-gradient transition-all duration-300">
            {service.Titre}
          </h3>

          {/* Tagline */}
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
            {service.Tagline || service.Description}
          </p>

          {/* Click indicator */}
          <div className="mt-6 flex items-center gap-2 text-sm text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Voir les détails</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// SERVICE MODAL COMPONENT
// ============================================
function ServiceModal({
  service,
  isOpen,
  onClose,
}: {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!service) return null;

  const IconComponent = getIcon(service.Icone);
  
  // Parse les points clés (séparés par des retours à la ligne)
  const keyPoints = service.points_cle
    ? service.points_cle.split('\n').filter((point) => point.trim() !== '')
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] overflow-auto"
          >
            <div className="relative bg-slate-900/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500/20 to-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-8 h-8 text-accent-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="text-2xl font-bold text-white">{service.Titre}</h3>
                    <TypeBadge type={service.type} />
                  </div>
                  {service.tarif && (
                    <p className="text-lg font-semibold text-gradient">{service.tarif}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-slate-300 leading-relaxed">{service.Description}</p>
              </div>

              {/* Points clés */}
              {keyPoints.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Points clés
                  </h4>
                  <ul className="space-y-2">
                    {keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-accent-400" />
                        </div>
                        <span className="text-slate-300">{point.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {service.tags && service.tags.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <TagBadge key={tag.id} tag={tag} />
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button - Le texte est hardcodé ici car le modal n'a pas accès aux labels */}
              {/* TODO: Passer les labels via Context si besoin de dynamisation */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <a
                  href="#contact"
                  onClick={onClose}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-primary-500 text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Demander un devis
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// SECTION LABELS (White Label Ready)
// ============================================
// Ces labels peuvent être surchargés via les props
// pour une personnalisation complète par client
interface SectionLabels {
  sectionTitle: string;
  sectionTitleHighlight: string;
  sectionSubtitle: string;
  ctaQuestion: string;
  ctaLink: string;
  modalCtaText: string;
}

const DEFAULT_LABELS: SectionLabels = {
  sectionTitle: 'Nos',
  sectionTitleHighlight: 'services',
  sectionSubtitle: 'Des solutions concrètes qui s\'adaptent à votre façon de travailler, pas l\'inverse.',
  ctaQuestion: 'Vous avez un besoin spécifique ?',
  ctaLink: 'Parlons-en ensemble',
  modalCtaText: 'Demander un devis',
};

// ============================================
// MAIN COMPONENT
// ============================================
interface ServicesSectionProps {
  services?: Service[];
  labels?: Partial<SectionLabels>;
}

export default function ServicesSection({ services, labels }: ServicesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fusionner les labels par défaut avec les labels personnalisés
  const sectionLabels = { ...DEFAULT_LABELS, ...labels };
  
  const displayServices = services && services.length > 0 ? services : defaultServices;

  const openModal = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Réactiver le scroll du body
    document.body.style.overflow = 'unset';
  };

  return (
    <section id="services" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-950/50 to-background" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-500/5 rounded-full blur-[150px]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {sectionLabels.sectionTitle} <span className="text-gradient">{sectionLabels.sectionTitleHighlight}</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {sectionLabels.sectionSubtitle}
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              isInView={isInView}
              onClick={() => openModal(service)}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-slate-500 mb-4">{sectionLabels.ctaQuestion}</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            {sectionLabels.ctaLink}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>

      {/* Modal */}
      <ServiceModal service={selectedService} isOpen={isModalOpen} onClose={closeModal} />
    </section>
  );
}
