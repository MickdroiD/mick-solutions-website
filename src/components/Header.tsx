'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { name: 'Avantages', href: '#avantages', id: 'avantages' },
  { name: 'Services', href: '#services', id: 'services' },
  { name: 'Confiance', href: '#confiance', id: 'confiance' },
  { name: 'Contact', href: '#contact', id: 'contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation programmatique pour compatibilité cross-browser (Safari iOS, etc.)
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    // Fermer le menu mobile d'abord
    setIsMobileMenuOpen(false);
    
    // Petit délai pour laisser le menu se fermer avant le scroll
    // Nécessaire pour Safari iOS et certains navigateurs mobiles
    requestAnimationFrame(() => {
      const element = document.getElementById(targetId);
      if (element) {
        // Utiliser scrollIntoView avec polyfill behavior pour compatibilité
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        
        // Fallback pour les navigateurs qui ne supportent pas smooth scroll
        // Safari < 15.4, certains navigateurs mobiles
        if (!('scrollBehavior' in document.documentElement.style)) {
          const headerHeight = 80; // hauteur du header
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - headerHeight,
            behavior: 'auto'
          });
        }
      }
    });
  }, []);

  // Scroll vers le haut pour le logo
  const handleLogoClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a 
            href="#" 
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-3 group touch-manipulation"
          >
            <motion.div 
              className="logo-frame flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative bg-slate-900/90 rounded-xl p-1 sm:p-2">
                <Image
                  src="/logo.svg"
                  alt="Mick Solutions"
                  width={48}
                  height={48}
                  className="h-7 w-7 sm:h-10 sm:w-10 relative z-10"
                  priority
                />
              </div>
            </motion.div>
            <span className="text-xs sm:text-lg font-semibold text-white whitespace-nowrap">
              Mick <span className="text-gradient">Solutions</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id)}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-accent-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, 'contact')}
              className="relative inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-white
                       bg-gradient-to-r from-primary-500 to-accent-500
                       hover:from-primary-400 hover:to-accent-400
                       shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40
                       transition-all duration-300 hover:scale-105"
            >
              Audit Gratuit
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors touch-manipulation"
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMobileMenuOpen}
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
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className="block py-3 px-2 text-slate-400 hover:text-white active:text-primary-400 transition-colors touch-manipulation text-base"
                >
                  {item.name}
                </a>
              ))}
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, 'contact')}
                className="block w-full text-center py-3 mt-4 rounded-full text-sm font-medium text-white
                         bg-gradient-to-r from-primary-500 to-accent-500 touch-manipulation
                         active:opacity-80 transition-opacity"
              >
                Audit Gratuit
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

