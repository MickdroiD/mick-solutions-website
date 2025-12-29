'use client';

import { motion, Transition, TargetAndTransition } from 'framer-motion';
import { Mail, Phone, MapPin, Linkedin, Instagram, Twitter } from 'lucide-react';
import Image from 'next/image';
import type { FooterModuleProps } from '../types';
import type { LogoAnimation } from '@/lib/types/global-settings';
import AnimatedLogoFrame from '../../AnimatedLogoFrame';
import { CSSProperties } from 'react';

// ============================================
// LOGO WITH ANIMATION
// ============================================
interface AnimationVariants {
  animate: TargetAndTransition;
  transition: Transition;
  style?: CSSProperties;
}

function FooterLogoWithAnimation({ 
  logoUrl, 
  nomSite, 
  animation, 
  size = 40 
}: { 
  logoUrl: string; 
  nomSite: string; 
  animation?: LogoAnimation | null; 
  size?: number | null;
}) {
  const logoSize = size || 40;
  const normalizedAnimation = animation?.toLowerCase() || 'none';
  
  const getAnimationVariants = (): AnimationVariants => {
    switch (normalizedAnimation) {
      case 'spin-glow':
      case 'spin_glow':
        return {
          animate: { rotate: 360 },
          transition: { duration: 8, repeat: Infinity, ease: 'linear' as const },
          style: { filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))' }
        };
      case 'spin':
      case 'rotate':
        return {
          animate: { rotate: 360 },
          transition: { duration: 8, repeat: Infinity, ease: 'linear' as const }
        };
      case 'pulse':
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 2, repeat: Infinity }
        };
      case 'electric':
      case 'lightning_circle':
        return {
          animate: {},
          transition: {},
          style: { filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))' }
        };
      case 'none':
      default:
        return { animate: {}, transition: {} };
    }
  };

  const animProps = getAnimationVariants();

  return (
    <motion.div
      className="flex-shrink-0 relative"
      whileHover={{ scale: 1.05 }}
      animate={animProps.animate}
      transition={animProps.transition}
      style={animProps.style}
    >
      <Image
        src={logoUrl}
        alt={nomSite}
        width={logoSize}
        height={logoSize}
        className="object-contain"
        style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
        unoptimized
      />
    </motion.div>
  );
}

/**
 * FooterCorporate - Variante professionnelle multi-colonnes avec cohérence dark theme.
 * 
 * @description Footer structuré avec colonnes (Contact, Navigation, Légal),
 * newsletter, réseaux sociaux. Idéal pour entreprises B2B, institutions.
 */
export function FooterCorporate({ config, legalDocs = [] }: FooterModuleProps) {
  const currentYear = new Date().getFullYear();
  
  // Initiales du logo
  const initiales = config.initialesLogo || config.nomSite.split(' ').map(w => w[0]).join('');

  // Navigation dynamique basée sur les modules activés dans la config
  const navLinks = [
    config.showAdvantages && { name: 'Avantages', href: '#avantages' },
    config.showServices && { name: 'Services', href: '#services' },
    config.showPortfolio && { name: 'Portfolio', href: '#portfolio' },
    config.showContact && { name: 'Contact', href: '#contact' },
  ].filter((link): link is { name: string; href: string } => Boolean(link));

  const socialLinks = [
    { icon: Linkedin, url: config.lienLinkedin, label: 'LinkedIn' },
    { icon: Instagram, url: config.lienInstagram, label: 'Instagram' },
    { icon: Twitter, url: config.lienTwitter, label: 'Twitter' },
  ].filter(s => s.url);

  return (
    <footer className="border-t border-white/10" style={{ backgroundColor: 'rgba(10, 10, 15, 0.8)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Colonne 1 : À propos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              {(config.logoDarkUrl || config.logoUrl) ? (
                <FooterLogoWithAnimation 
                  logoUrl={config.logoDarkUrl || config.logoUrl || ''}
                  nomSite={config.nomSite}
                  animation={config.footerLogoAnimation}
                  size={config.footerLogoSize}
                />
              ) : (
                <AnimatedLogoFrame initiales={initiales} size="md" variant={config.logoFrameStyle} />
              )}
              <span className="font-semibold text-lg text-foreground">
                {config.nomSite}
              </span>
            </div>
            <p className="text-sm text-primary-400 mb-6">
              {config.slogan}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10
                             flex items-center justify-center text-primary-400
                             hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Colonne 2 : Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold text-foreground mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Colonne 3 : Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-foreground mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-primary-400">
                <Mail className="w-4 h-4 text-primary-500" />
                <a href={`mailto:${config.email}`} className="hover:text-primary-300 transition-colors">
                  {config.email}
                </a>
              </li>
              {config.telephone && (
                <li className="flex items-center gap-3 text-sm text-primary-400">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <a href={`tel:${config.telephone}`} className="hover:text-primary-300 transition-colors">
                    {config.telephone}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-3 text-sm text-primary-400">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5" />
                <span>{config.adresse}</span>
              </li>
            </ul>
          </motion.div>

          {/* Colonne 4 : Légal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-foreground mb-4">
              Légal
            </h4>
            <ul className="space-y-3">
              {legalDocs.filter(d => d.isActive).map((doc) => (
                <li key={doc.id}>
                  <a
                    href={`/legal/${doc.slug}`}
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    {doc.titre}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Barre du bas */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-500">
            © {currentYear} {config.nomSite}. Tous droits réservés.
          </p>
          <p className="text-xs text-primary-500">
            {config.paysHebergement}
          </p>
        </div>
      </div>
    </footer>
  );
}

