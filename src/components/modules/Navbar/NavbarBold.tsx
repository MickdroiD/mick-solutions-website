'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import type { NavbarModuleProps, NavItem } from '../types';

const defaultNavItems: NavItem[] = [
  { name: 'Avantages', href: '#avantages', id: 'avantages' },
  { name: 'Services', href: '#services', id: 'services' },
  { name: 'Portfolio', href: '#portfolio', id: 'portfolio' },
  { name: 'Confiance', href: '#confiance', id: 'confiance' },
  { name: 'Contact', href: '#contact', id: 'contact' },
];

/**
 * NavbarBold - Variante audacieuse et impactante.
 * 
 * @description Navigation avec hamburger toujours visible (même desktop),
 * typographie massive dans le menu ouvert, plein écran overlay.
 * Idéal pour agences créatives, architectes, designers.
 */
export function NavbarBold({ config, navItems = defaultNavItems }: NavbarModuleProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquer le scroll quand le menu est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(targetId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  }, []);

  const handleLogoClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* Header bar - toujours visible */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled && !isMenuOpen
            ? 'bg-background/90 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo texte bold */}
            <a 
              href="#" 
              onClick={handleLogoClick}
              className="relative z-50 text-2xl font-black tracking-tight"
            >
              <span className={`transition-colors ${isMenuOpen ? 'text-background dark:text-foreground' : 'text-foreground'}`}>
                {config.nomSite.split(' ')[0]}
              </span>
              <span className={`transition-colors ${isMenuOpen ? 'text-accent-400' : 'text-primary-500'}`}>
                .
              </span>
            </a>

            {/* Hamburger button - TOUJOURS visible */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`relative z-50 p-3 transition-colors ${
                isMenuOpen ? 'text-background dark:text-foreground' : 'text-foreground'
              }`}
              aria-label={isMenuOpen ? 'Fermer' : 'Menu'}
            >
              <motion.div
                animate={isMenuOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? <X size={32} strokeWidth={2.5} /> : <Menu size={32} strokeWidth={2.5} />}
              </motion.div>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Full screen overlay menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ clipPath: 'circle(0% at calc(100% - 48px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 48px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 48px) 40px)' }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
            className="fixed inset-0 z-40 bg-primary-500"
          >
            <div className="flex flex-col justify-center items-start h-full px-6 sm:px-12 lg:px-24">
              <nav className="space-y-4">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.id)}
                      className="group flex items-center gap-4"
                    >
                      <span className="text-primary-200 text-lg font-mono">
                        0{index + 1}
                      </span>
                      <span className="text-5xl sm:text-7xl lg:text-8xl font-black text-background dark:text-foreground 
                                     group-hover:text-accent-300 transition-colors duration-300
                                     uppercase tracking-tight leading-none">
                        {item.name}
                      </span>
                      <ArrowRight className="w-8 h-8 sm:w-12 sm:h-12 text-background dark:text-foreground opacity-0 
                                           group-hover:opacity-100 group-hover:translate-x-4 
                                           transition-all duration-300" />
                    </a>
                  </motion.div>
                ))}
              </nav>

              {/* Contact info en bas */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-10 left-6 sm:left-12 lg:left-24 text-primary-200"
              >
                <p className="text-sm mb-1">{config.email}</p>
                <p className="text-sm">{config.adresse}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

