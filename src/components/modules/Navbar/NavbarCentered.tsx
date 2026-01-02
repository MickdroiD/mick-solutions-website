'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import type { NavbarModuleProps, NavItem } from '../types';

import React from 'react';

// Navigation items provenant de la configuration admin (headerMenuLinks)
// Si aucun lien configuré, tableau vide par défaut

/**
 * NavbarCentered - Variante élégante avec logo centré.
 * 
 * @description Logo au centre, liens répartis de chaque côté,
 * effet de soulignement élégant. Idéal pour luxe, mode, restaurants,
 * bijouterie, hotels.
 */
export function NavbarCentered({ config, navItems: propNavItems }: NavbarModuleProps) {
  // Cast config to any to safely access potentially missing properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeConfig = config as any;

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
        console.warn('[NavbarCentered] Failed to parse headerMenuLinks', e);
      }
    }
    return propNavItems || [];
  }, [safeConfig.headerMenuLinks, propNavItems]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Diviser les liens en deux groupes
  const midPoint = Math.ceil(navItems.length / 2);
  const leftItems = navItems.slice(0, midPoint);
  const rightItems = navItems.slice(midPoint);

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

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 dark:bg-background/95 backdrop-blur-lg shadow-sm py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6">
        {/* Desktop - 3 colonnes */}
        <div className="hidden lg:grid grid-cols-3 items-center h-16">
          {/* Liens gauche */}
          <div className="flex items-center gap-8 justify-start">
            {leftItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id)}
                className="relative text-sm tracking-wide text-primary-700 dark:text-primary-200 
                           hover:text-primary-900 dark:hover:text-foreground transition-colors group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-full h-px bg-primary-500 scale-x-0 
                               group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </a>
            ))}
          </div>

          {/* Logo centré */}
          <div className="flex justify-center">
            <a 
              href="#" 
              onClick={handleLogoClick}
              className="flex flex-col items-center group"
            >
              {config.logoUrl ? (
                <Image
                  src={config.logoUrl}
                  alt={config.nomSite}
                  width={48}
                  height={48}
                  className="h-12 w-12 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-primary-500 flex items-center justify-center">
                  <span className="text-lg font-serif text-primary-500">{config.initialesLogo}</span>
                </div>
              )}
              <span className={`text-xs tracking-[0.3em] uppercase text-primary-500 mt-2 transition-opacity duration-300 ${
                isScrolled ? 'opacity-0 h-0 mt-0' : 'opacity-100'
              }`}>
                {config.nomSite}
              </span>
            </a>
          </div>

          {/* Liens droite */}
          <div className="flex items-center gap-8 justify-end">
            {rightItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id)}
                className="relative text-sm tracking-wide text-primary-700 dark:text-primary-200 
                           hover:text-primary-900 dark:hover:text-foreground transition-colors group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-full h-px bg-primary-500 scale-x-0 
                               group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </a>
            ))}
          </div>
        </div>

        {/* Mobile - Logo + Hamburger */}
        <div className="lg:hidden flex items-center justify-between h-14">
          <a 
            href="#" 
            onClick={handleLogoClick}
            className="flex items-center gap-3"
          >
            {config.logoUrl ? (
              <Image
                src={config.logoUrl}
                alt={config.nomSite}
                width={36}
                height={36}
                className="h-9 w-9"
              />
            ) : (
              <span className="text-lg font-serif text-primary-500">{config.initialesLogo}</span>
            )}
            <span className="text-sm tracking-widest uppercase text-primary-700 dark:text-primary-200">
              {config.nomSite.split(' ')[0]}
            </span>
          </a>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-primary-700 dark:text-primary-200"
            aria-label={isMobileMenuOpen ? 'Fermer' : 'Menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Overlay élégant */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 top-14 bg-white/98 dark:bg-background/98 backdrop-blur-xl"
          >
            <div className="flex flex-col items-center justify-center h-full py-10 space-y-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-2xl tracking-wide text-primary-700 dark:text-primary-200 
                             hover:text-primary-500 transition-colors"
                >
                  {item.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

