'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Mail } from 'lucide-react';
import type { NavbarModuleProps, NavItem } from '../types';
import {
  hexToRgb,
  getDirectAnimationConfig,
  getFrameStyles,
  getFrameAnimationClass,
  getIndirectEffectStyles,
  resolveColor
} from '@/lib/helpers/effects-renderer';

const defaultNavItems: NavItem[] = [
  // ... (keep existing items)
  { name: 'Avantages', href: '#avantages', id: 'avantages' },
  { name: 'Services', href: '#services', id: 'services' },
  { name: 'Portfolio', href: '#portfolio', id: 'portfolio' },
  { name: 'Confiance', href: '#confiance', id: 'confiance' },
  { name: 'Contact', href: '#contact', id: 'contact' },
];

export function NavbarCorporate({ config, navItems = defaultNavItems }: NavbarModuleProps) {
  // ... (keep state)
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

  // 🆕 Logo image URL
  const logoImageUrl = config.headerLogoUrl || config.logoUrl;
  const headerLogoSize = config.headerLogoSize || 48;

  // 🆕 Couleurs personnalisées
  const headerBgColor = config.headerBgColor || '#ffffff';
  const headerTextColor = config.headerTextColor || '#1e293b';
  const headerBorderColor = config.headerBorderColor;
  const isLightBg = !config.headerBgColor || headerBgColor === '#ffffff' || headerBgColor.toLowerCase() === '#fff';

  // 🆕 Effets avancés (backgroundBlur, opacity)
  const bgOpacity = config.headerEffects?.backgroundOpacity !== undefined ? config.headerEffects.backgroundOpacity / 100 : 1;
  const bgBlur = config.headerEffects?.backgroundBlur || 0;

  // Conversion RGB
  const effectiveBgColor = isLightBg ? '#ffffff' : headerBgColor;
  const bgColorRgb = hexToRgb(effectiveBgColor) || '255, 255, 255';

  // 🆕 Overlay
  const overlayColor = config.headerEffects?.overlayColor || 'black';
  const overlayOpacity = config.headerEffects?.overlayOpacity !== undefined ? config.headerEffects.overlayOpacity / 100 : 0.5;
  const getOverlayColorValue = (color: string) => {
    switch (color) {
      case 'white': return '255, 255, 255';
      case 'primary': return 'var(--primary-900)';
      case 'accent': return 'var(--accent-900)';
      case 'slate': return '15, 23, 42';
      case 'black': default: return '0, 0, 0';
    }
  };

  // 🆕 LOGO ADVANCED EFFECTS (Direct + Frame)
  const logoSpeed = config.headerEffects?.animationSpeed || 'normal';
  const logoIntensity = config.headerEffects?.animationIntensity || 'normal';
  const logoDirectAnim = getDirectAnimationConfig(config.headerLogoAnimation || config.headerEffects?.logoAnimation, logoSpeed, logoIntensity);

  // 🆕 Indirect Styles (Glows/Shadows)
  const indirectStyles = getIndirectEffectStyles((config.headerEffects || {}) as Record<string, unknown>, logoIntensity);

  // Frame settings
  const frameShape = config.headerEffects?.logoFrameShape || 'none';
  const frameColor = config.headerEffects?.logoFrameColor || config.headerEffects?.effectPrimaryColor || 'cyan';
  const frameAnim = config.headerEffects?.logoFrameAnimation || 'none';
  const frameStyles = getFrameStyles(frameShape, frameColor, config.headerEffects?.logoFrameThickness || 2);
  const frameAnimClass = getFrameAnimationClass(frameAnim);

  // CSS vars pour l'animation du cadre
  const frameCssVars = {
    '--frame-color-1': resolveColor(frameColor, '#22d3ee'),
    '--frame-color-2': resolveColor(config.headerEffects?.effectSecondaryColor, '#a78bfa'),
  } as React.CSSProperties;

  // 🆕 BLOBS (Background Effects)
  const showBlobs = config.headerEffects?.showBlobs;
  const blobSizeValue = config.headerEffects?.blobSize === 'sm' ? '300px' :
    config.headerEffects?.blobSize === 'md' ? '500px' :
      config.headerEffects?.blobSize === 'lg' ? '800px' : '400px';


  // 🆕 Typography Settings
  const titleFontFamily = config.headerTextSettings?.titleFontFamily || 'var(--font-heading)';
  const bodyFontFamily = config.headerTextSettings?.bodyFontFamily || 'var(--font-primary)';
  const linkFontSize = config.headerTextSettings?.bodyFontSize || 'text-sm';
  // Note: bodyFontWeight n'existe pas dans TextSettings, on utilise font-medium par défaut pour les liens

  // Helper pour injecter le style de font
  const getFontStyle = (family: string) => {
    if (family.startsWith('var(')) return { fontFamily: family };
    return { fontFamily: `'${family}', sans-serif` };
  };

  return (
    <>
      {/* Top bar avec contact - Disparaît au scroll */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isScrolled ? -40 : 0 }}
        className="fixed top-0 left-0 right-0 z-50 text-xs"
        style={{
          backgroundColor: isLightBg ? '#0f172a' : headerBgColor,
          color: isLightBg ? '#fff' : headerTextColor,
          ...getFontStyle(bodyFontFamily)
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {config.telephone && (
              <a href={`tel:${config.telephone}`} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <Phone className="w-3 h-3" />
                {config.telephone}
              </a>
            )}
            <a href={`mailto:${config.email}`} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <Mail className="w-3 h-3" />
              {config.email}
            </a>
          </div>
          <div className="hidden sm:block opacity-70">
            {config.adresse}
          </div>
        </div>
      </motion.div>

      {/* Main navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${isScrolled
          ? 'top-0 ' + ((config.headerEffects?.paddingY === 'none' ? 'py-0' : 'py-2') + ' shadow-lg')
          : 'top-10 ' + (config.headerEffects?.paddingY === 'none' ? 'py-0' :
            config.headerEffects?.paddingY === 'sm' ? 'py-2' :
              config.headerEffects?.paddingY === 'lg' ? 'py-6' :
                config.headerEffects?.paddingY === 'xl' ? 'py-8' :
                  'py-4')
          }`}
        style={{
          // Gestion avancée du Background
          backgroundColor: config.headerEffects?.backgroundUrl
            ? 'transparent'
            : (isScrolled
              ? `rgba(${bgColorRgb}, ${bgOpacity})`
              : `rgba(${bgColorRgb}, ${Math.max(0, bgOpacity - 0.1)})`),
          backgroundImage: config.headerEffects?.backgroundUrl ? `url(${config.headerEffects.backgroundUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backdropFilter: bgBlur ? `blur(${bgBlur}px)` : undefined,
          color: headerTextColor,
          borderBottom: headerBorderColor ? `1px solid ${headerBorderColor}` : undefined,
          ...getFontStyle(bodyFontFamily)
        }}
      >
        {/* Overlay pour image de fond */}
        {config.headerEffects?.backgroundUrl && (
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundColor: `rgba(${getOverlayColorValue(overlayColor)}, ${overlayOpacity})`
            }}
          />
        )}

        {/* 🆕 BLOBS (Effets lumineux d'arrière-plan) */}
        {showBlobs && (
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div
              className="absolute top-0 left-1/4 -translate-y-1/2 rounded-full bg-primary-500/10 dark:bg-primary-500/20"
              style={{ width: blobSizeValue, height: blobSizeValue, filter: 'blur(80px)' }}
            />
            <div
              className="absolute top-0 right-1/4 -translate-y-1/2 rounded-full bg-accent-500/10 dark:bg-accent-500/20"
              style={{ width: blobSizeValue, height: blobSizeValue, filter: 'blur(80px)' }}
            />
          </div>
        )}

        <nav className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo avec baseline */}
            <a
              href="#"
              onClick={handleLogoClick}
              className="flex items-center gap-4"
            >
              <div
                className={`relative flex items-center justify-center ${frameAnimClass}`}
                style={{
                  ...frameStyles,
                  width: frameShape !== 'none' ? Math.max(headerLogoSize + 20, 60) : 'auto',
                  height: frameShape !== 'none' ? Math.max(headerLogoSize + 20, 60) : 'auto',
                  ...frameCssVars
                }}
              >

                {logoImageUrl ? (
                  // 🆕 Afficher l'image du logo si disponible
                  <motion.img
                    src={logoImageUrl}
                    alt={config.nomSite}
                    className="w-auto object-contain"
                    style={{
                      height: headerLogoSize,
                      maxHeight: 60,
                      ...indirectStyles
                    }}
                    animate={logoDirectAnim?.animate}
                    transition={logoDirectAnim?.transition}
                  />
                ) : (
                  // Fallback: Initiales avec gradient
                  <div
                    className="rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md"
                    style={{
                      width: headerLogoSize,
                      height: headerLogoSize,
                      ...indirectStyles
                    }}
                  >
                    {config.initialesLogo}
                  </div>
                )}
              </div>

              <div className="hidden md:block">
                <h1 className="text-xl font-bold tracking-tight" style={getFontStyle(titleFontFamily)}>
                  {config.nomSite}
                </h1>
                {config.slogan && (
                  <p className="text-xs opacity-70 font-medium">
                    {config.slogan}
                  </p>
                )}
              </div>
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`${linkFontSize} font-medium hover:text-primary-500 transition-colors relative group`}
                  style={{ color: headerTextColor, ...getFontStyle(bodyFontFamily) }}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full" />
                </a>
              ))}

              {config.ctaPrincipal && (
                <a
                  href="#contact"
                  className="px-6 py-2.5 rounded-full bg-primary-600 text-white text-sm font-semibold 
                           hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/20 
                           transition-all active:scale-95 transform"
                >
                  {config.ctaPrincipal}
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[120px] left-0 right-0 z-30 border-t border-black/5 md:hidden"
            style={{
              backgroundColor: headerBgColor, // Pas de transparence pour lisibilité
              color: headerTextColor,
              ...getFontStyle(bodyFontFamily)
            }}
          >
            <div className="p-6 flex flex-col gap-4 shadow-xl">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`${linkFontSize} font-medium py-2 border-b border-black/5 last:border-0`}
                  style={{ color: headerTextColor, ...getFontStyle(bodyFontFamily) }}
                >
                  {item.name}
                </a>
              ))}
              {config.ctaPrincipal && (
                <a
                  href="#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-4 w-full py-3 rounded-xl bg-primary-600 text-white text-center font-bold"
                >
                  {config.ctaPrincipal}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
