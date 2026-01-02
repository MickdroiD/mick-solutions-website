'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Mail } from 'lucide-react';
import type { NavbarModuleProps, NavItem } from '../types';
import {
  hexToRgb
} from '@/lib/helpers/effects-renderer';
import AnimatedLogoFrame from '../../AnimatedLogoFrame';

const defaultNavItems: NavItem[] = [
  { name: 'Avantages', href: '#avantages', id: 'avantages' },
  { name: 'Services', href: '#services', id: 'services' },
  { name: 'Portfolio', href: '#portfolio', id: 'portfolio' },
  { name: 'Confiance', href: '#confiance', id: 'confiance' },
  { name: 'Contact', href: '#contact', id: 'contact' },
];

export function NavbarCorporate({ config, navItems: propNavItems }: NavbarModuleProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cast config to any to safely access potentially missing properties (V2 schema bridging)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeConfig = config as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const branding = safeConfig.branding || ({} as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const identity = safeConfig.identity || ({} as any);

  // 1. Resolve Menu Links (Priority: Config > Props > Default)
  const navItems = useMemo(() => {
    if (branding.headerMenuLinks) {
      try {
        const parsed = JSON.parse(branding.headerMenuLinks);
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
    return propNavItems || defaultNavItems;
  }, [branding.headerMenuLinks, propNavItems]);

  // 2. Resolve CTA (Priority: Config Header CTA > Global CTA > Default)
  const ctaText = branding.headerCtaText || safeConfig.ctaPrincipal || 'Contact';
  const ctaUrl = branding.headerCtaUrl || '#contact';
  const showCta = branding.showHeaderCta !== false;

  // 3. Resolve Top Bar (Default: true)
  const showTopBar = branding.showTopBar !== false;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Styles setup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headerEffects = branding.headerEffects || ({} as any);
  const bgColor = branding.headerBgColor || safeConfig.couleurBackground || '#0a0a0f';
  const textColor = branding.headerTextColor || safeConfig.couleurText || '#ffffff';
  const borderColor = branding.headerBorderColor || 'rgba(255,255,255,0.1)';
  const logoUrl = branding.headerLogoUrl || safeConfig.logoUrl;
  const logoSize = branding.headerLogoSize || safeConfig.logoSize || 40;

  // Font styles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textSettings = branding.headerTextSettings || ({} as any);
  const fontFamily = textSettings.bodyFontFamily || safeConfig.fontPrimary || 'Inter';

  // Helper for background color with opacity
  const getBackgroundColor = () => {
    if (!isScrolled) return 'transparent';
    if (headerEffects.backgroundOpacity) {
      const rgb = hexToRgb(bgColor);
      if (rgb) {
        return `rgba(${rgb}, ${headerEffects.backgroundOpacity / 100})`;
      }
    }
    return bgColor;
  };

  return (
    <>
      {/* Top Bar (Contact Info) */}
      {showTopBar && (
        <div className="bg-slate-900 border-b border-white/5 py-2 hidden md:block">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs text-slate-400">
            <div className="flex gap-4">
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
            <div>
              {safeConfig.adresse}
            </div>
          </div>
        </div>
      )}

      <motion.nav
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-xl shadow-lg' : 'bg-transparent'
          }`}
        style={{
          backgroundColor: getBackgroundColor(),
          borderBottom: isScrolled ? `1px solid ${borderColor}` : 'none',
          fontFamily
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            {/* Unified Logo Frame approach */}
            <div
              className="relative flex items-center justify-center flex-shrink-0 aspect-square"
              style={{
                width: logoSize,
                height: logoSize
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={identity.nomSite || safeConfig.nomSite}
                  className="object-contain w-full h-full"
                />
              ) : (
                <AnimatedLogoFrame initiales={identity.initialesLogo || safeConfig.initialesLogo} size="sm" variant={headerEffects.logoFrameShape || 'square'} />
              )}
            </div>

            <span className="font-bold text-xl tracking-tight" style={{ color: textColor }}>
              {identity.nomSite || safeConfig.nomSite}
            </span>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {navItems.map((item: any) => (
              <a
                key={item.id}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className="text-sm font-medium transition-colors hover:text-cyan-400"
                style={{ color: textColor }}
              >
                {item.name}
              </a>
            ))}

            {showCta && (
              <a
                href={ctaUrl}
                className="px-6 py-2.5 rounded-full text-sm font-semibold bg-white text-black hover:bg-cyan-400 transition-colors"
              >
                {ctaText}
              </a>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: textColor }}
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
              className="md:hidden bg-slate-900 border-b border-white/10 overflow-hidden"
            >
              <div className="px-6 py-8 space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {navItems.map((item: any) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-medium text-white/80 hover:text-white"
                  >
                    {item.name}
                  </a>
                ))}
                {showCta && (
                  <a
                    href={ctaUrl}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-6 py-3 rounded-lg bg-white text-black font-semibold mt-6"
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
