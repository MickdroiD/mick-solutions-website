'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import type { NavbarModuleProps } from '../types';
import AnimatedLogoFrame from '../../AnimatedLogoFrame';

// Navigation items provenant de la configuration admin (headerMenuLinks)
// Si aucun lien configuré, tableau vide par défaut

/**
 * NavbarMinimal - Variante épurée mais cohérente avec le thème dark.
 * 
 * @description Navigation simple avec logo animé (AnimatedLogoFrame),
 * liens fins espacés, fond dark au scroll. Corrigé pour cohérence design.
 */
export function NavbarMinimal({ config, navItems: propNavItems }: NavbarModuleProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cast config to any to safely access potentially missing properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeConfig = config as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const branding = safeConfig.branding || ({} as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const identity = safeConfig.identity || ({} as any);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    requestAnimationFrame(() => {
      const element = document.getElementById(targetId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const handleLogoClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Initiales du logo (fallback si pas d'image)
  const initiales = identity.initialesLogo || safeConfig.initialesLogo || (safeConfig.nomSite ? safeConfig.nomSite.split(' ').map((w: string) => w[0]).join('') : 'MS');

  // 🆕 Logo image URL (priorité: headerLogoUrl > logoUrl)
  const logoImageUrl = branding.headerLogoUrl || safeConfig.headerLogoUrl || safeConfig.logoUrl;

  // Résoudre les liens du menu (priorité: config > props)
  const navItems = React.useMemo(() => {
    if (safeConfig.headerMenuLinks) {
      try {
        const parsed = typeof safeConfig.headerMenuLinks === 'string' 
          ? JSON.parse(safeConfig.headerMenuLinks) 
          : safeConfig.headerMenuLinks;
        if (Array.isArray(parsed) && parsed.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return parsed.map((link: any) => ({
            name: link.label,
            href: link.url,
            id: link.id || link.label.toLowerCase().replace(/\s+/g, '-'),
            isExternal: link.isExternal
          }));
        }
      } catch (e) {
        console.warn('[NavbarMinimal] Failed to parse headerMenuLinks', e);
      }
    }
    return propNavItems || [];
  }, [safeConfig.headerMenuLinks, propNavItems]);

  // Couleur de fond du site (fallback)
  const siteBgColor = safeConfig.couleurBackground || '#0a0a0f';

  // 🆕 Couleurs personnalisées du header
  const headerBgColor = branding.headerBgColor || safeConfig.headerBgColor || siteBgColor;
  const headerTextColor = branding.headerTextColor || safeConfig.headerTextColor || '#ffffff';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headerBorderColor = branding.headerBorderColor || safeConfig.headerBorderColor || ({} as any);

  // CTA (sans fallback hardcodé)
  const ctaPrincipal = branding.headerCtaText || safeConfig.headerCtaText;
  const ctaLink = branding.headerCtaUrl || safeConfig.headerCtaUrl || '#contact';
  const showCta = safeConfig.showHeaderCta !== false && ctaPrincipal;

  // Bouton d'appel
  const callButtonText = safeConfig.texteBoutonAppel;
  const callButtonUrl = safeConfig.lienBoutonAppel;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: isScrolled ? headerBgColor : 'transparent',
        borderBottom: isScrolled ? `1px solid ${typeof headerBorderColor === 'string' ? headerBorderColor : 'rgba(255, 255, 255, 0.05)'}` : 'none',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        color: headerTextColor,
      }}
    >
      <nav className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Image ou AnimatedLogoFrame */}
          <a
            href="#"
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-3 group touch-manipulation"
          >
            {logoImageUrl ? (
              // 🆕 Afficher l'image du logo si disponible
              <img
                src={logoImageUrl}
                alt={identity.nomSite || safeConfig.nomSite}
                className="h-8 md:h-10 w-auto object-contain"
                style={{ maxHeight: branding.headerLogoSize || safeConfig.headerLogoSize || 40 }}
              />
            ) : (
              // Fallback: AnimatedLogoFrame avec initiales
              <AnimatedLogoFrame initiales={initiales} size="md" variant={branding.logoFrameStyle || safeConfig.logoFrameStyle} />
            )}
            <span className="text-sm sm:text-lg font-semibold whitespace-nowrap" style={{ color: headerTextColor }}>
              {(identity.nomSite || safeConfig.nomSite).split(' ')[0]} <span className="text-gradient">{(identity.nomSite || safeConfig.nomSite).split(' ').slice(1).join(' ')}</span>
            </span>
          </a>

          {/* Desktop Navigation - Liens fins */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id)}
                className="text-xs tracking-[0.15em] uppercase text-primary-300/70 
                           hover:text-foreground transition-colors duration-300 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-accent-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA Button - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {callButtonUrl && callButtonText && (
              <a
                href={callButtonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary-200
                         bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20
                         transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                {callButtonText}
              </a>
            )}
            {showCta && (
              <a
                href={ctaLink}
                onClick={(e) => handleNavClick(e, 'contact')}
                className="relative inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-white
                         bg-gradient-to-r from-primary-500 to-accent-500
                         hover:from-primary-400 hover:to-accent-400
                         shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40
                         transition-all duration-300 hover:scale-105"
              >
                {ctaPrincipal}
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-primary-300 hover:text-foreground transition-colors"
            aria-label={isMobileMenuOpen ? 'Fermer' : 'Menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Dark theme */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden backdrop-blur-xl border-t border-white/5"
            style={{ backgroundColor: headerBgColor }}
          >
            <div className="px-6 py-6 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className="block py-2 text-sm text-primary-300 hover:text-foreground 
                             active:text-primary-400 transition-colors touch-manipulation"
                >
                  {item.name}
                </a>
              ))}
              {callButtonUrl && callButtonText && (
                <a
                  href={callButtonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-sm text-primary-300 hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {callButtonText}
                </a>
              )}
              {showCta && (
                <a
                  href={ctaLink}
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className="block w-full text-center py-3 mt-4 rounded-full text-sm font-medium text-white
                           bg-gradient-to-r from-primary-500 to-accent-500 touch-manipulation
                           active:opacity-80 transition-opacity"
                >
                  {ctaPrincipal}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
