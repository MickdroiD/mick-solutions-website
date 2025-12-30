'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Mail } from 'lucide-react';
import type { NavbarModuleProps, NavItem } from '../types';

const defaultNavItems: NavItem[] = [
  { name: 'Avantages', href: '#avantages', id: 'avantages' },
  { name: 'Services', href: '#services', id: 'services' },
  { name: 'Portfolio', href: '#portfolio', id: 'portfolio' },
  { name: 'Confiance', href: '#confiance', id: 'confiance' },
  { name: 'Contact', href: '#contact', id: 'contact' },
];

/**
 * NavbarCorporate - Variante professionnelle et structurée.
 * 
 * @description Navigation corporate avec logo + baseline,
 * barre de contact en haut (email/tel), menu structuré.
 * Idéal pour entreprises B2B, cabinets, institutions.
 */
export function NavbarCorporate({ config, navItems = defaultNavItems }: NavbarModuleProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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
    <>
      {/* Top bar avec contact - Disparaît au scroll */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isScrolled ? -40 : 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-primary-900 text-white text-xs"
      >
        <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {config.telephone && (
              <a href={`tel:${config.telephone}`} className="flex items-center gap-2 hover:text-primary-300 transition-colors">
                <Phone className="w-3 h-3" />
                {config.telephone}
              </a>
            )}
            <a href={`mailto:${config.email}`} className="flex items-center gap-2 hover:text-primary-300 transition-colors">
              <Mail className="w-3 h-3" />
              {config.email}
            </a>
          </div>
          <div className="hidden sm:block text-primary-300">
            {config.adresse}
          </div>
        </div>
      </motion.div>

      {/* Main navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'top-0 bg-white shadow-lg'
            : 'top-10 bg-white/95 backdrop-blur-sm'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo avec baseline */}
            <a 
              href="#" 
              onClick={handleLogoClick}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-theme-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {config.initialesLogo}
              </div>
              <div>
                <div className="font-semibold text-primary-900 text-lg">
                  {config.nomSite}
                </div>
                <div className="text-xs text-primary-500 hidden sm:block">
                  {config.slogan.substring(0, 40)}...
                </div>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className="text-sm font-medium text-primary-700 
                             hover:text-primary-500 transition-colors relative group py-2"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </a>
              ))}
            </div>

            {/* CTA Corporate */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, 'contact')}
                className="btn-primary"
              >
                {config.ctaPrincipal}
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-primary-700"
              aria-label={isMobileMenuOpen ? 'Fermer' : 'Menu'}
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
              className="lg:hidden bg-white border-t border-primary-200"
            >
              <div className="px-6 py-6 space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className="block py-2 text-primary-700 font-medium hover:text-primary-500"
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-4 border-t border-primary-200">
                  <a
                    href="#contact"
                    onClick={(e) => handleNavClick(e, 'contact')}
                    className="btn-primary w-full justify-center"
                  >
                    {config.ctaPrincipal}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}

