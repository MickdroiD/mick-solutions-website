'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mail, Database, ShieldCheck, FileText, Users, BarChart3 } from 'lucide-react';

interface Service {
  id: number;
  Titre: string;
  Description: string;
  Icone: string;
  Ordre: string | null;
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  mail: Mail,
  database: Database,
  shield: ShieldCheck,
  file: FileText,
  users: Users,
  chart: BarChart3,
};

// Default services if Baserow is empty
const defaultServices: Service[] = [
  {
    id: 1,
    Titre: "Secrétariat Virtuel Automatisé",
    Description: "Traitement d'emails, factures, RDV",
    Icone: "mail",
    Ordre: "1"
  },
  {
    id: 2,
    Titre: "Centralisation de vos Données",
    Description: "Fini les fichiers Excel perdus, tout est au même endroit",
    Icone: "database",
    Ordre: "2"
  },
  {
    id: 3,
    Titre: "Sérénité & Sécurité Suisse",
    Description: "Sauvegardes automatiques, confidentialité totale",
    Icone: "shield",
    Ordre: "3"
  }
];

// Get icon component
function getIcon(iconName: string) {
  const normalizedName = iconName?.toLowerCase().trim() || '';
  return iconMap[normalizedName] || FileText;
}

// Map order to icon for services without explicit icon
function getIconByOrder(order: string | null) {
  const orderIcons = ['mail', 'database', 'shield', 'file', 'users', 'chart'];
  const index = order ? parseInt(order) - 1 : 0;
  return iconMap[orderIcons[index] || 'file'] || FileText;
}

export default function ServicesSection({ services }: { services?: Service[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const displayServices = services && services.length > 0 ? services : defaultServices;

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
            Nos <span className="text-gradient">services</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Des solutions concrètes qui s&apos;adaptent à votre façon de travailler,
            <br className="hidden sm:block" />
            pas l&apos;inverse.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((service, index) => {
            const IconComponent = service.Icone ? getIcon(service.Icone) : getIconByOrder(service.Ordre);
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-full p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent-500/30 transition-all duration-500 overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-500/0 to-primary-500/0 group-hover:from-accent-500/5 group-hover:to-primary-500/5 transition-all duration-500" />
                  
                  {/* Decorative line */}
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500/20 to-primary-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-accent-400" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gradient transition-all duration-300">
                      {service.Titre}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {service.Description}
                    </p>

                    {/* Learn more link */}
                    <div className="mt-6 flex items-center gap-2 text-sm text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>En savoir plus</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-slate-500 mb-4">Vous avez un besoin spécifique ?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Parlons-en ensemble
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

