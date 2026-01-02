'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Mail } from 'lucide-react';
import type { NavbarModuleProps } from '../types';
import AnimatedLogoFrame from '@/components/AnimatedLogoFrame';

// Navigation items provenant de la configuration admin (headerMenuLinks)
// Si aucun lien configuré, tableau vide par défaut

export function NavbarCorporate({ config, navItems: propNavItems }: NavbarModuleProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cast config to any to safely access potentially missing properties (V2 schema bridging)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeConfig = config as any;

  // 1. Resolve Menu Links (Priority: Config > Props > Default)
  const navItems = useMemo(() => {
    if (safeConfig.headerMenuLinks) {
      try {
        const parsed = JSON.parse(safeConfig.headerMenuLinks);
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
        console.warn('Failed to parse headerMenuLinks', e);
      }
    }
    return propNavItems || [];
  }, [safeConfig.headerMenuLinks, propNavItems]);

  // 2. Resolve CTA (Priority: Config Header CTA > Global CTA) - Sans fallback hardcodé
  const ctaText = safeConfig.headerCtaText || safeConfig.ctaPrincipal;
  const ctaUrl = safeConfig.headerCtaUrl || '#contact';
  const showCta = safeConfig.showHeaderCta !== false && ctaText;

  // 3. Resolve Top Bar (Default: true)
  const showTopBar = safeConfig.showTopBar !== false;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fix: Handle string enum values for logoSize
  const logoUrl = safeConfig.headerLogoUrl || safeConfig.logoUrl;
  const rawSize = safeConfig.headerLogoSize || safeConfig.logoSize;
  const sizeMap: Record<string, number> = { Small: 32, Medium: 48, Large: 64, XLarge: 80 };
  const logoSize = typeof rawSize === 'number' ? rawSize : (sizeMap[rawSize as string] || 40);

  // Corporate Light Theme Defaults
  const defaultText = 'text-slate-700';
  const activeText = 'text-primary-600';

  // Custom Overrides (from Admin)
  const customBgColor = safeConfig.headerBgColor;
  const customTextColor = safeConfig.headerTextColor;

  return (
    <>
      {/* Top Bar (Contact Info) - Corporate Style (Dark Blue or Primary) */}
      {showTopBar && (
        <div className="bg-slate-900 text-slate-300 py-2 hidden md:block">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs">
            <div className="flex gap-6">
              {safeConfig.email && (
                <a href={`mailto:${safeConfig.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-3 h-3" />
                  {safeConfig.email}
                </a>
              )}
              {safeConfig.telephone && (
                <a href={`tel:${safeConfig.telephone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-3 h-3" />
                  {safeConfig.telephone}
                </a>
              )}
            </div>
            <div className="flex gap-4">
              {safeConfig.adresse && <span>{safeConfig.adresse}</span>}
            </div>
          </div>
        </div>
      )}

      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 font-sans`}
        style={{
          backgroundColor: customBgColor || undefined, // Only apply if set
        }}
        // Apply classes based on scroll if no custom color
        animate={{
          backgroundColor: customBgColor
            ? customBgColor
            : isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0)',
          boxShadow: isScrolled && !customBgColor ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
          y: 0
        }}
        initial={{ y: -100 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* LOGO */}
          <a href="/" className="flex items-center gap-3 group">
            <div
              className="relative flex items-center justify-center flex-shrink-0"
              style={{
                width: logoSize,
                height: logoSize
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={safeConfig.nomSite}
                  className="object-contain w-full h-full"
                />
              ) : (
                <AnimatedLogoFrame initiales={safeConfig.initialesLogo} size="sm" variant="Square" />
              )}
            </div>


          </a>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {navItems.map((item: any) => (
              <a
                key={item.id}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className={`text-sm font-medium transition-colors ${defaultText} hover:${activeText}`}
                style={{ color: customTextColor || undefined }}
              >
                {item.name}
              </a>
            ))}

            {showCta && (
              <a
                href={ctaUrl}
                className="px-6 py-2.5 rounded-full text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                style={{
                  // If custom text color is set, we might keep button standard or adapt? 
                  // Keeping standard primary button for contrast.
                }}
              >
                {ctaText}
              </a>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden p-2 text-slate-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: customTextColor || undefined }}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-primary-100 overflow-hidden shadow-xl"
            >
              <div className="px-6 py-8 space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {navItems.map((item: any) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-medium text-slate-700 hover:text-primary-600"
                  >
                    {item.name}
                  </a>
                ))}
                {showCta && (
                  <a
                    href={ctaUrl}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold mt-6 shadow-md"
                  >
                    {ctaText}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
