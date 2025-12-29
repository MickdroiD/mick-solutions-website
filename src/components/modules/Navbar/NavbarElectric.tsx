'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import type { NavbarModuleProps, NavItem } from '../types';
import AnimatedMedia from '../../AnimatedMedia';

const defaultNavItems: NavItem[] = [
  { name: 'Avantages', href: '#avantages', id: 'avantages' },
  { name: 'Services', href: '#services', id: 'services' },
  { name: 'Portfolio', href: '#portfolio', id: 'portfolio' },
  { name: 'Confiance', href: '#confiance', id: 'confiance' },
  { name: 'Contact', href: '#contact', id: 'contact' },
];

/**
 * NavbarElectric - Variante dynamique "Electric" pour White Label Factory.
 * 
 * @description Navigation futuriste avec glass effect, logo animé,
 * gradient sur le CTA, sticky avec blur. Idéal pour tech, startups, SaaS.
 * 
 * Logo Source Priority: logoSvgCode > logoUrl > initiales (fallback)
 */
export function NavbarElectric({ config, navItems = defaultNavItems }: NavbarModuleProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Configuration du logo header depuis Baserow
  const headerLogoSize = Number(config.headerLogoSize) || 40; // Taille en pixels
  const clampedLogoSize = Math.min(Math.max(headerLogoSize, 32), 80); // Clamp entre 32-80px pour le header
  const headerLogoAnimation = config.headerLogoAnimation || 'electric';
  const hasLogoSvg = Boolean(config.logoSvgCode && String(config.logoSvgCode).trim());
  const hasLogoUrl = Boolean(config.logoUrl && config.logoUrl.trim());
  const initiales = config.initialesLogo || config.nomSite.split(' ').map(w => w[0]).join('');

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ 
        backgroundColor: isScrolled ? '#0a0a0f' : 'rgba(10, 10, 15, 0.9)',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo avec animation configurable depuis Baserow */}
          <a 
            href="#" 
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-3 group touch-manipulation"
          >
            {/* Logo animé via AnimatedMedia (SVG/Image/Fallback) */}
            {(hasLogoSvg || hasLogoUrl) ? (
              <AnimatedMedia
                svgCode={hasLogoSvg ? config.logoSvgCode : undefined}
                imageUrl={!hasLogoSvg && hasLogoUrl ? config.logoUrl : undefined}
                animationType={headerLogoAnimation}
                size={clampedLogoSize}
                alt={config.nomSite}
                fallback={
                  <span className="text-lg font-bold text-gradient">{initiales}</span>
                }
                primaryColor="var(--primary-400)"
                accentColor="var(--accent-400)"
              />
            ) : (
              // Fallback: Initiales avec gradient
              <div 
                className="flex items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30"
                style={{ width: clampedLogoSize, height: clampedLogoSize }}
              >
                <span className="text-lg font-bold text-gradient">{initiales}</span>
              </div>
            )}
            <span className="text-xs sm:text-lg font-semibold text-white whitespace-nowrap">
              {config.nomSite.split(' ')[0]} <span className="text-gradient">{config.nomSite.split(' ').slice(1).join(' ')}</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id)}
                className="text-sm text-primary-300/70 hover:text-foreground transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-accent-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {config.lienBoutonAppel && config.lienBoutonAppel !== '#contact' && (
              <a
                href={config.lienBoutonAppel}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary-200
                         bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20
                         transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                Réserver un appel
              </a>
            )}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, 'contact')}
              className="relative inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-white
                       bg-gradient-to-r from-primary-500 to-accent-500
                       hover:from-primary-400 hover:to-accent-400
                       shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40
                       transition-all duration-300 hover:scale-105"
            >
              {config.ctaPrincipal.split(' ').slice(-2).join(' ')}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-primary-300 hover:text-foreground transition-colors touch-manipulation"
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden backdrop-blur-xl border-b border-white/5"
            style={{ backgroundColor: 'rgba(10, 10, 15, 0.95)' }}
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className="block py-3 px-2 text-primary-300 hover:text-foreground active:text-primary-400 transition-colors touch-manipulation text-base"
                >
                  {item.name}
                </a>
              ))}
              {config.lienBoutonAppel && config.lienBoutonAppel !== '#contact' && (
                <a
                  href={config.lienBoutonAppel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-3 px-2 text-primary-300 hover:text-foreground transition-colors touch-manipulation text-base"
                >
                  <Phone className="w-4 h-4" />
                  Réserver un appel
                </a>
              )}
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, 'contact')}
                className="block w-full text-center py-3 mt-4 rounded-full text-sm font-medium text-white
                         bg-gradient-to-r from-primary-500 to-accent-500 touch-manipulation
                         active:opacity-80 transition-opacity"
              >
                {config.ctaPrincipal.split(' ').slice(-2).join(' ')}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

