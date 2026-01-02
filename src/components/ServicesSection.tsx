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
  cardStyleClasses?: string;
  hoverClasses?: string;
  isShowcase?: boolean;
}

interface AccordionServiceCardProps {
  service: Service;
  index: number;
  isInView: boolean;
  isExpanded: boolean;
  onClick: () => void;
  cardStyleClasses?: string;
}

// ============================================
// DEFAULT SERVICES (Fallback) - Thème "Nouveau Client"
// ============================================
const defaultServices: Service[] = [
  {
    id: 1,
    Titre: 'Service Principal',
    Description: 'Décrivez ici votre service phare. Expliquez clairement ce que vous proposez et les bénéfices pour le client.',
    Icone: 'briefcase',
    Ordre: '1',
    Tagline: 'Votre service le plus important',
    tags: [],
    points_cle: 'Avantage clé 1\nAvantage clé 2\nAvantage clé 3\nAvantage clé 4',
    type: { id: 1, value: 'Sur devis', color: 'blue' },
    tarif: 'Sur devis',
  },
  {
    id: 2,
    Titre: 'Service Secondaire',
    Description: 'Un autre service important que vous proposez. Soyez précis et orienté bénéfice client.',
    Icone: 'settings',
    Ordre: '2',
    Tagline: 'Votre deuxième offre',
    tags: [],
    points_cle: 'Point fort 1\nPoint fort 2\nPoint fort 3',
    type: { id: 2, value: 'Sur devis', color: 'green' },
    tarif: 'Sur devis',
  },
  {
    id: 3,
    Titre: 'Service Complémentaire',
    Description: 'Un service additionnel ou une option qui vous différencie de la concurrence.',
    Icone: 'zap',
    Ordre: '3',
    Tagline: 'Ce qui vous différencie',
    tags: [],
    points_cle: 'Atout 1\nAtout 2\nAtout 3',
    type: { id: 1, value: 'Sur devis', color: 'blue' },
    tarif: 'Sur devis',
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
function ServiceCard({ 
  service, 
  index, 
  isInView, 
  onClick,
  cardStyleClasses = 'bg-white shadow-lg',
  hoverClasses = 'hover:scale-[1.02]',
  isShowcase = false,
}: ServiceCardProps) {
  const IconComponent = getIcon(service.Icone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className={`relative h-full p-8 rounded-2xl border border-primary-200 hover:border-primary-400 transition-all duration-500 overflow-hidden active:scale-[0.98] ${cardStyleClasses} ${hoverClasses}`}>
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/0 to-primary-500/0 group-hover:from-accent-500/5 group-hover:to-primary-500/5 transition-all duration-500" />
        
        {/* Decorative line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className={`relative z-10 ${isShowcase ? 'flex flex-col md:flex-row gap-6' : ''}`}>
          {/* Header: Icon + Type Badge */}
          <div className={`flex items-start justify-between mb-6 ${isShowcase ? 'md:flex-col md:items-center md:w-32 md:mb-0' : ''}`}>
            <div className={`rounded-2xl bg-gradient-to-br from-accent-500/20 to-primary-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${isShowcase ? 'w-20 h-20' : 'w-16 h-16'}`}>
              <IconComponent className={`text-accent-400 ${isShowcase ? 'w-10 h-10' : 'w-8 h-8'}`} />
            </div>
            {!isShowcase && <TypeBadge type={service.type} />}
          </div>

          <div className="flex-1">
            {/* Title */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`font-semibold text-primary-900 transition-all duration-300 ${isShowcase ? 'text-2xl' : 'text-xl'}`}>
                {service.Titre}
              </h3>
              {isShowcase && <TypeBadge type={service.type} />}
            </div>

            {/* Tagline / Description */}
            <p className={`text-primary-600 leading-relaxed ${isShowcase ? 'text-base' : 'text-sm line-clamp-2'}`}>
              {isShowcase ? service.Description : (service.Tagline || service.Description)}
            </p>

            {/* Click indicator */}
            <div className={`flex items-center gap-2 text-sm text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isShowcase ? 'mt-4' : 'mt-6'}`}>
              <span>Voir les détails</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// ACCORDION SERVICE CARD COMPONENT
// ============================================
function AccordionServiceCard({ 
  service, 
  index, 
  isInView, 
  isExpanded,
  onClick,
  cardStyleClasses = 'bg-white shadow-lg',
}: AccordionServiceCardProps) {
  const IconComponent = getIcon(service.Icone);
  const keyPoints = service.points_cle
    ? service.points_cle.split('\n').filter((point) => point.trim() !== '')
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <div className={`relative rounded-2xl border border-primary-200 transition-all duration-300 overflow-hidden ${cardStyleClasses} ${isExpanded ? 'border-primary-400' : ''}`}>
        {/* Header - Always visible */}
        <button
          onClick={onClick}
          className="w-full p-6 flex items-center gap-4 text-left hover:bg-primary-50/50 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-primary-500/20 flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-6 h-6 text-accent-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary-900">{service.Titre}</h3>
            {!isExpanded && (
              <p className="text-sm text-primary-600 line-clamp-1">{service.Tagline || service.Description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <TypeBadge type={service.type} />
            <motion.svg 
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="w-5 h-5 text-primary-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </div>
        </button>
        
        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-2 border-t border-primary-100">
                <p className="text-primary-700 mb-4">{service.Description}</p>
                
                {keyPoints.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-primary-600">
                        <Check className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                        <span>{point.trim()}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {service.tarif && (
                  <p className="text-lg font-semibold text-gradient">{service.tarif}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

// Labels par défaut - tous optionnels, peuvent être overridés par la configuration admin
const DEFAULT_LABELS: SectionLabels = {
  sectionTitle: '',
  sectionTitleHighlight: '',
  sectionSubtitle: '',
  ctaQuestion: '',
  ctaLink: '',
  modalCtaText: '',
};

// ============================================
// DESIGN OPTIONS
// ============================================
type ServiceVariant = 'Grid' | 'Accordion' | 'Cards' | 'Showcase';
type CardStyle = 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism';
type HoverEffect = 'None' | 'Scale' | 'Glow' | 'Lift' | 'Shake';

// ============================================
// MAIN COMPONENT
// ============================================
import type { SectionEffectsProps } from '@/lib/types/section-props';
import { getFontFamilyStyle } from '@/lib/helpers/effects-renderer';
import Image from 'next/image';

interface ServicesSectionProps extends SectionEffectsProps {
  services?: Service[];
  labels?: Partial<SectionLabels>;
  variant?: ServiceVariant;
  cardStyle?: CardStyle;
  hoverEffect?: HoverEffect;
}

export default function ServicesSection({ 
  services, 
  labels,
  variant = 'Grid',
  cardStyle = 'Shadow',
  hoverEffect = 'Scale',
  effects,
  textSettings,
}: ServicesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(null);

  // Fusionner les labels par défaut avec les labels personnalisés
  const sectionLabels = { ...DEFAULT_LABELS, ...labels };
  
  const displayServices = services && services.length > 0 ? services : defaultServices;
  
  // Card style classes
  const getCardStyleClasses = () => {
    switch (cardStyle) {
      case 'Flat': return 'bg-white';
      case 'Border': return 'bg-white border-2 border-primary-200';
      case 'Glassmorphism': return 'bg-white/60 backdrop-blur-md border border-white/20';
      case 'Shadow':
      default: return 'bg-white shadow-lg shadow-primary-500/10';
    }
  };
  
  // Hover effect classes
  const getHoverClasses = () => {
    switch (hoverEffect) {
      case 'None': return '';
      case 'Glow': return 'hover:shadow-xl hover:shadow-primary-500/30';
      case 'Lift': return 'hover:-translate-y-2 hover:shadow-xl';
      case 'Shake': return 'hover:animate-shake';
      case 'Scale':
      default: return 'hover:scale-[1.02]';
    }
  };
  
  // Grid classes based on variant
  const getGridClasses = () => {
    switch (variant) {
      case 'Showcase': return 'grid-cols-1 lg:grid-cols-2';
      case 'Accordion': return 'grid-cols-1 max-w-3xl mx-auto';
      case 'Cards':
      case 'Grid':
      default: return 'sm:grid-cols-2 lg:grid-cols-3';
    }
  };

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

  // ========== EFFECTS ==========
  const bgUrl = effects?.backgroundUrl;
  const bgOpacity = effects?.backgroundOpacity !== undefined ? effects.backgroundOpacity / 100 : 1;
  const showBlobs = effects?.showBlobs !== false;

  return (
    <section id="services" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Image background if configured */}
        {bgUrl ? (
          <Image
            src={bgUrl}
            alt=""
            fill
            className="object-cover"
            style={{ opacity: bgOpacity }}
          />
        ) : (
          /* Default gradient background */
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-blue-100/50 to-blue-50" />
        )}
        {/* Decorative blob */}
        {showBlobs && (
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-[150px]" />
        )}
      </div>

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            className={`${textSettings?.titleFontSize || 'text-3xl sm:text-4xl lg:text-5xl'} ${textSettings?.titleFontWeight || 'font-bold'} ${textSettings?.titleColor || 'text-primary-900'} mb-4`}
            style={getFontFamilyStyle(textSettings?.titleFontFamily)}
          >
            {sectionLabels.sectionTitle} <span className="text-gradient">{sectionLabels.sectionTitleHighlight}</span>
          </h2>
          <p 
            className={`${textSettings?.subtitleFontSize || 'text-lg'} ${textSettings?.subtitleColor || 'text-primary-700'} max-w-2xl mx-auto`}
            style={getFontFamilyStyle(textSettings?.subtitleFontFamily)}
          >
            {sectionLabels.sectionSubtitle}
          </p>
        </motion.div>

        {/* Services grid/list */}
        <div className={`grid ${getGridClasses()} gap-6`}>
          {displayServices.map((service, index) => (
            variant === 'Accordion' ? (
              <AccordionServiceCard
                key={service.id}
                service={service}
                index={index}
                isInView={isInView}
                isExpanded={expandedAccordion === index}
                onClick={() => setExpandedAccordion(expandedAccordion === index ? null : index)}
                cardStyleClasses={getCardStyleClasses()}
              />
            ) : (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                isInView={isInView}
                onClick={() => openModal(service)}
                cardStyleClasses={getCardStyleClasses()}
                hoverClasses={getHoverClasses()}
                isShowcase={variant === 'Showcase'}
              />
            )
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-primary-600 mb-4">{sectionLabels.ctaQuestion}</p>
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
