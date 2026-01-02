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

  // Helper to access footer config safely (handling flat vs nested structure)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conf = config as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footerConf = (conf.footer || conf) as any; // Fallback to root if footer is merged

  // 🆕 Custom Colors & Styles
  const bgColor = footerConf.footerBgColor || conf.footerBgColor || '#0a0a0f';
  const textColor = footerConf.footerTextColor || conf.footerTextColor || '#ffffff';
  const borderColor = footerConf.footerBorderColor || conf.footerBorderColor || 'rgba(255,255,255,0.1)';

  // 🆕 Logo Configuration
  const logoUrl = footerConf.footerLogoUrl || conf.footerLogoUrl || conf.logoDarkUrl || conf.logoUrl;
  const logoSize = footerConf.footerLogoSize || conf.footerLogoSize || 40;
  const logoAnim = footerConf.footerLogoAnimation || conf.footerLogoAnimation || 'none';
  const initiales = conf.initialesLogo || (conf.nomSite ? conf.nomSite.split(' ').map((w: string) => w[0]).join('') : 'MS');

  // 🆕 Effects & Text Settings
  const footerEffects = footerConf.footerEffects || conf.branding?.footerEffects || {};
  const footerTextSettings = footerConf.footerTextSettings || conf.branding?.footerTextSettings || {};

  // 🆕 Navigation
  const navLinks = [
    conf.showAdvantages && { name: 'Avantages', href: '#avantages' },
    conf.showServices && { name: 'Services', href: '#services' },
    conf.showPortfolio && { name: 'Portfolio', href: '#portfolio' },
    conf.showContact && { name: 'Contact', href: '#contact' },
  ].filter((link): link is { name: string; href: string } => Boolean(link));

  // 🆕 Social Links
  const socialLinks = [
    { icon: Linkedin, url: conf.lienLinkedin, label: 'LinkedIn' },
    { icon: Instagram, url: conf.lienInstagram, label: 'Instagram' },
    { icon: Twitter, url: conf.lienTwitter, label: 'Twitter' },
  ].filter(s => s.url);

  // 🆕 Typography Styles
  const titleFont = footerTextSettings.titleFontFamily ? { fontFamily: footerTextSettings.titleFontFamily } : {};
  const bodyFont = footerTextSettings.bodyFontFamily ? { fontFamily: footerTextSettings.bodyFontFamily } : {};

  return (
    <footer
      className="border-t transition-colors duration-300 relative overflow-hidden"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
        ...bodyFont
      }}
    >
      {/* Background Image / Overlay from Effects */}
      {footerEffects.backgroundUrl && (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${footerEffects.backgroundUrl})` }}
          />
          <div className="absolute inset-0 z-0 bg-black/60" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Colonne 1 : À propos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="min-w-0" // Protect flex child
          >
            <div className="flex items-center gap-3 mb-4 group">
              {/* Unified Logo Frame approach */}
              <div
                className="relative flex items-center justify-center flex-shrink-0 aspect-square"
                style={{
                  width: logoSize,
                  height: logoSize
                }}
              >
                {logoUrl ? (
                  <FooterLogoWithAnimation
                    logoUrl={logoUrl}
                    nomSite={conf.nomSite}
                    animation={logoAnim}
                    size={logoSize}
                  />
                ) : (
                  <AnimatedLogoFrame initiales={initiales} size="md" variant={footerEffects.logoFrameShape || 'none'} />
                )}
              </div>

              <span className="font-semibold text-lg truncate" style={titleFont}>
                {conf.nomSite}
              </span>
            </div>
            <p className="text-sm opacity-70 mb-6 font-medium">
              {footerConf.customFooterText || conf.customFooterText || conf.slogan}
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
                             flex items-center justify-center opacity-70
                             hover:bg-primary-500 hover:border-primary-500 hover:text-white hover:opacity-100 transition-all"
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
            <h4 className="font-semibold mb-4" style={titleFont}>
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm opacity-70 hover:opacity-100 hover:text-primary-400 transition-colors"
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
            <h4 className="font-semibold mb-4" style={titleFont}>
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm opacity-70 hover:opacity-100 transition-opacity">
                <Mail className="w-4 h-4 text-primary-500" />
                <a href={`mailto:${conf.email}`}>
                  {conf.email}
                </a>
              </li>
              {conf.telephone && (
                <li className="flex items-center gap-3 text-sm opacity-70 hover:opacity-100 transition-opacity">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <a href={`tel:${conf.telephone}`}>
                    {conf.telephone}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-3 text-sm opacity-70">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5" />
                <span>{conf.adresse}</span>
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
            <h4 className="font-semibold mb-4" style={titleFont}>
              Légal
            </h4>
            {footerConf.showLegalLinks !== false && conf.showLegalLinks !== false && (
              <ul className="space-y-3">
                {legalDocs.filter(d => d.isActive).map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={`/legal/${doc.slug}`}
                      className="text-sm opacity-70 hover:opacity-100 hover:text-primary-400 transition-colors"
                    >
                      {doc.titre}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>

        {/* Barre du bas */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderColor: borderColor, borderTopWidth: '1px' }}
        >
          <p className="text-xs opacity-60">
            {footerConf.copyrightTexte || conf.copyrightTexte || `© ${currentYear} ${conf.nomSite}. Tous droits réservés.`}
          </p>
          <p className="text-xs opacity-60">
            {footerConf.paysHebergement || conf.paysHebergement}
          </p>
        </div>
      </div>
    </footer>
  );
}
