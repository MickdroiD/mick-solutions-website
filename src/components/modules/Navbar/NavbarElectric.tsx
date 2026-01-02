'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import type { NavbarModuleProps, NavItem } from '../types';
import AnimatedMedia, { type V2EffectConfig } from '../../AnimatedMedia';

// 🚫 PAS de menu par défaut - tout doit être configuré depuis l'admin
// Si aucun lien n'est configuré, le menu sera vide
const defaultNavItems: NavItem[] = [];

/**
 * NavbarElectric - Variante dynamique "Electric" pour White Label Factory.
 * 
 * @description Navigation futuriste avec glass effect, logo animé,
 * gradient sur le CTA, sticky avec blur. Idéal pour tech, startups, SaaS.
 * 
 * Logo Source Priority: logoSvgCode > logoUrl > initiales (fallback)
 * 
 * @config headerMenuLinks - JSON string with menu links from admin
 * @config headerCtaText - CTA button text from admin
 * @config headerCtaUrl - CTA button URL from admin
 * @config showHeaderCta - Whether to show CTA button
 * @config showTopBar - Whether to show top info bar
 */
export function NavbarElectric({ config, navItems: propNavItems }: NavbarModuleProps) {
  // 🆕 Parse menu links from config (JSON string from admin)
  const navItems = useMemo(() => {
    if (config.headerMenuLinks) {
      try {
        // Handle both string and already-parsed array
        let parsed = config.headerMenuLinks;
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: { id?: string; label: string; url: string }) => ({
            name: item.label,
            href: item.url,
            id: item.id || item.url.replace('#', '') || item.label.toLowerCase(),
          }));
        }
      } catch (e) {
        console.warn('[NavbarElectric] Failed to parse headerMenuLinks:', e);
      }
    }
    // Fallback to props or defaults
    return propNavItems || defaultNavItems;
  }, [config.headerMenuLinks, propNavItems]);

  // 🆕 CTA configuration from admin - Aucun fallback hardcodé
  const ctaText = config.headerCtaText || null;
  const ctaUrl = config.headerCtaUrl || null;
  // Afficher le CTA seulement si le texte est configuré ET showHeaderCta n'est pas false
  const showCta = config.showHeaderCta !== false && Boolean(ctaText);
  
  // 🆕 Site title override for header
  const siteTitle = config.headerSiteTitle || config.nomSite;
  
  // 🆕 Typography settings from admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textSettings = (config.headerTextSettings || {}) as Record<string, any>;
  const titleStyle: React.CSSProperties = {
    fontFamily: textSettings.titleFontFamily || undefined,
    fontSize: textSettings.titleFontSize || undefined,
    fontWeight: textSettings.titleFontWeight || undefined,
    color: textSettings.titleColor || undefined,
    textTransform: (textSettings.titleTransform as React.CSSProperties['textTransform']) || undefined,
    letterSpacing: textSettings.titleLetterSpacing || undefined,
  };
  
  // 🆕 Navigation link styles from admin
  const navLinkStyle: React.CSSProperties = {
    fontFamily: textSettings.bodyFontFamily || undefined,
    fontSize: textSettings.bodyFontSize || undefined,
    fontWeight: textSettings.bodyFontWeight || undefined,
    color: textSettings.bodyColor || undefined,
    textTransform: (textSettings.bodyTransform as React.CSSProperties['textTransform']) || undefined,
    letterSpacing: textSettings.bodyLetterSpacing || undefined,
  };
  
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
  // 🆕 Priorité: headerLogoUrl/headerLogoSvgCode > logoUrl/logoSvgCode (logo principal)
  // Fix: Handle string enum values for logoSize
  const rawSize = config.headerLogoSize || config.logoSize;
  const sizeMap: Record<string, number> = { Small: 32, Medium: 48, Large: 64, XLarge: 80 };
  const headerLogoSize = typeof rawSize === 'number' ? rawSize : (sizeMap[rawSize as string] || 40);
  const clampedLogoSize = Math.min(Math.max(headerLogoSize, 32), 80); // Clamp entre 32-80px pour le header
  
  // 🔧 FIX: headerLogoAnimation vient de l'admin (branding.headerLogoAnimation)
  // Default to 'none' instead of 'electric' to respect user choice
  const headerLogoAnimation = config.headerLogoAnimation || 'none';

  // 🆕 Support logo dédié header
  const headerSvgCode = config.headerLogoSvgCode || config.logoSvgCode;
  const headerLogoUrl = config.headerLogoUrl || config.logoUrl;
  const hasLogoSvg = Boolean(headerSvgCode && String(headerSvgCode).trim());
  const hasLogoUrl = Boolean(headerLogoUrl && headerLogoUrl.trim());
  const initiales = config.initialesLogo || siteTitle.split(' ').map(w => w[0]).join('');

  // 🔧 FIX: L'effet électrique doit être contrôlé par headerLogoAnimation, PAS par le thème global
  // L'utilisateur choisit l'animation dans l'admin Header > Animation du Logo
  const showElectricEffect = ['electric', 'lightning-circle', 'storm'].includes(headerLogoAnimation);

  // ============================================
  // V2 EFFECT CONFIG - Build from headerEffects or legacy props
  // ============================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawHeaderEffects = (config as Record<string, any>).headerEffects || {};
  
  const headerEffectsConfig: V2EffectConfig = useMemo(() => ({
    // V2 effects from admin (priority)
    logoDirectEffect: rawHeaderEffects.logoDirectEffect || (showElectricEffect ? 'electric' : 'none'),
    logoIndirectEffect: rawHeaderEffects.logoIndirectEffect || (showElectricEffect ? 'aura-glow' : 'none'),
    logoFrameShape: rawHeaderEffects.logoFrameShape || 'none',
    logoFrameAnimation: rawHeaderEffects.logoFrameAnimation || 'none',
    logoFrameColor: rawHeaderEffects.logoFrameColor || rawHeaderEffects.effectPrimaryColor || 'cyan',
    logoFrameThickness: rawHeaderEffects.logoFrameThickness || 2,
    animationSpeed: rawHeaderEffects.animationSpeed || 'normal',
    animationIntensity: rawHeaderEffects.animationIntensity || 'normal',
    effectPrimaryColor: rawHeaderEffects.effectPrimaryColor || 'cyan',
    effectSecondaryColor: rawHeaderEffects.effectSecondaryColor || 'purple',
    // Legacy animation support (fallback)
    logoAnimation: headerLogoAnimation,
  }), [rawHeaderEffects, showElectricEffect, headerLogoAnimation]);

  // 🆕 Couleurs personnalisées header - Utilise les couleurs globales du site comme fallback
  const siteBgColor = config.couleurBackground || '#0a0a0f';
  const headerBgColor = config.headerBgColor || siteBgColor;
  const headerTextColor = config.headerTextColor || config.couleurText || null;
  const headerBorderColor = config.headerBorderColor || null;

  // Calculer les couleurs finales (utilise la couleur de fond du site ou celle spécifique au header)
  const bgColorScrolled = headerBgColor;
  const bgColorTransparent = `${headerBgColor}e6`; // 90% opacité
  const borderColorActive = headerBorderColor
    ? `1px solid ${headerBorderColor}`
    : '1px solid rgba(255, 255, 255, 0.05)';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col transition-all duration-300 pointer-events-none"
      style={{
        height: 'auto',
      }}
    >
      {/* ============================================ */}
      {/* TOP BAR - INFO & CONTACT */}
      {/* ============================================ */}
      {config.showTopBar && (
        <div
          className="w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5 text-[10px] sm:text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center z-50 pointer-events-auto relative"
        >
          <div className="flex items-center gap-4 text-slate-400">
            {config.email && (
              <a href={`mailto:${config.email}`} className="hover:text-primary-400 transition-colors flex items-center gap-1.5">
                <span>✉️</span> <span className="hidden sm:inline">{config.email}</span>
              </a>
            )}
            {config.telephone && (
              <a href={`tel:${config.telephone}`} className="hover:text-primary-400 transition-colors flex items-center gap-1.5">
                <span>📞</span> <span className="hidden sm:inline">{config.telephone}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="hidden sm:inline opacity-50">{config.slogan}</span>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MAIN NAVBAR */}
      {/* ============================================ */}
      <div
        className="w-full transition-all duration-300 pointer-events-auto"
        style={{
          backgroundColor: isScrolled ? bgColorScrolled : bgColorTransparent,
          borderBottom: isScrolled ? borderColorActive : 'none',
          color: headerTextColor || undefined,
          backdropFilter: 'blur(12px)',
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo avec animation configurable depuis Baserow */}
            {/* 🔧 FIX: overflow-visible permet aux cercles électriques de s'afficher */}
            <a
              href="#"
              onClick={handleLogoClick}
              className="flex items-center gap-2 sm:gap-3 group touch-manipulation relative z-10 overflow-visible"
              style={{ maxWidth: '70%' }}
            >
              {/* Logo animé via AnimatedMedia (SVG/Image/Fallback) */}
              {/* 🔧 FIX: overflow-visible permet aux cercles électriques de s'afficher */}
              <div
                className="flex-shrink-0 relative overflow-visible"
                style={{ 
                  width: clampedLogoSize, 
                  height: clampedLogoSize,
                  // Padding pour laisser de la place aux effets électriques (40% de la taille)
                  margin: showElectricEffect ? `${Math.round(clampedLogoSize * 0.2)}px` : undefined,
                }}
              >
                {(hasLogoSvg || hasLogoUrl) ? (
                  <AnimatedMedia
                    svgCode={hasLogoSvg ? headerSvgCode : undefined}
                    imageUrl={!hasLogoSvg && hasLogoUrl ? headerLogoUrl : undefined}
                    size={clampedLogoSize}
                    alt={siteTitle}
                    fallback={
                      <span className="text-lg font-bold text-gradient">{initiales}</span>
                    }
                    // V2 Architecture: Pass complete effectConfig object
                    effectConfig={headerEffectsConfig}
                    className="max-w-full max-h-full"
                  />
                ) : (
                  // Fallback: Initiales avec gradient
                  <div
                    className="flex items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 w-full h-full"
                  >
                    <span className="text-lg font-bold text-gradient">{initiales}</span>
                  </div>
                )}
              </div>

              {/* 🆕 Site title with customizable typography from admin */}
              <span 
                className="text-xs sm:text-lg font-semibold text-white whitespace-nowrap truncate max-w-[150px] sm:max-w-xs"
                style={titleStyle}
              >
                {siteTitle.split(' ')[0]} <span className="text-gradient">{siteTitle.split(' ').slice(1).join(' ')}</span>
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
                  style={navLinkStyle}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-accent-500 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Bouton d'appel - N'afficher que si lien ET texte sont configurés */}
              {config.lienBoutonAppel && config.texteBoutonAppel && config.lienBoutonAppel !== '#contact' && (
                <a
                  href={config.lienBoutonAppel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary-200
                           bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20
                           transition-all duration-300"
                >
                  <Phone className="w-4 h-4" />
                  {config.texteBoutonAppel}
                </a>
              )}
              {/* 🆕 CTA configurable depuis admin - headerCtaText/headerCtaUrl */}
              {showCta && ctaUrl && (
                <a
                  href={ctaUrl}
                  onClick={(e) => {
                    if (ctaUrl?.startsWith('#')) {
                      handleNavClick(e, ctaUrl.replace('#', ''));
                    }
                  }}
                  className="relative inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-white
                           bg-gradient-to-r from-primary-500 to-accent-500
                           hover:from-primary-400 hover:to-accent-400
                           shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40
                           transition-all duration-300 hover:scale-105 whitespace-nowrap"
                >
                  {ctaText}
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-primary-300 hover:text-foreground transition-colors touch-manipulation ml-2"
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
              style={{ backgroundColor: `${headerBgColor}f2` }}
            >
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className="block py-3 px-2 text-primary-300 hover:text-foreground active:text-primary-400 transition-colors touch-manipulation text-base"
                    style={navLinkStyle}
                  >
                    {item.name}
                  </a>
                ))}
                {/* Bouton d'appel mobile - N'afficher que si lien ET texte sont configurés */}
                {config.lienBoutonAppel && config.texteBoutonAppel && config.lienBoutonAppel !== '#contact' && (
                  <a
                    href={config.lienBoutonAppel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 py-3 px-2 text-primary-300 hover:text-foreground transition-colors touch-manipulation text-base"
                  >
                    <Phone className="w-4 h-4" />
                    {config.texteBoutonAppel}
                  </a>
                )}
                {/* 🆕 CTA configurable depuis admin */}
                {showCta && ctaUrl && (
                  <a
                    href={ctaUrl}
                    onClick={(e) => {
                      if (ctaUrl?.startsWith('#')) {
                        handleNavClick(e, ctaUrl.replace('#', ''));
                      }
                    }}
                    className="block w-full text-center py-3 mt-4 rounded-full text-sm font-medium text-white
                             bg-gradient-to-r from-primary-500 to-accent-500 touch-manipulation
                             active:opacity-80 transition-opacity"
                  >
                    {ctaText}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

