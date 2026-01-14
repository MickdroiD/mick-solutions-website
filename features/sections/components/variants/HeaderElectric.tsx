'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import type { HeaderSectionProps } from '../../types';
import AnimatedMedia from '@/shared/components/visuals/AnimatedMedia';

// 🚫 PAS de menu par défaut - tout doit être configuré depuis l'admin
const defaultNavItems: any[] = [];

export default function HeaderElectric({ content: config, design }: HeaderSectionProps) {
    // 🆕 Parse menu links from config (JSON string from admin)
    const navItems = useMemo(() => {
        if (config.headerMenuLinks) {
            try {
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
                console.warn('[HeaderElectric] Failed to parse headerMenuLinks:', e);
            }
        }
        // Fallback? None for now or empty
        return defaultNavItems;
    }, [config.headerMenuLinks]);

    // 🆕 CTA configuration
    const ctaText = config.headerCtaText || null;
    const ctaUrl = config.headerCtaUrl || null;
    const showCta = config.showHeaderCta !== false && Boolean(ctaText);

    // 🆕 Site title
    const siteTitle = config.headerSiteTitle || config.nomSite || 'Factory V5';

    // 🆕 Typography settings
    const textSettings = (config.headerTextSettings || {}) as Record<string, any>;
    const titleStyle: React.CSSProperties = {
        fontFamily: textSettings.titleFontFamily || undefined,
        fontSize: textSettings.titleFontSize || undefined,
        fontWeight: textSettings.titleFontWeight || undefined,
        color: textSettings.titleColor || undefined,
    };

    const navLinkStyle: React.CSSProperties = {
        fontFamily: textSettings.bodyFontFamily || undefined,
        fontSize: textSettings.bodyFontSize || undefined,
    };

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        // Logic handled by href usually, but for scroll behavior:
        // We keep it simple for V5 transplant
        setIsMobileMenuOpen(false);
    }, []);

    const handleLogoClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Logo Config
    const headerLogoSize = typeof config.logoSize === 'number' ? config.logoSize : 40;
    const clampedLogoSize = Math.min(Math.max(headerLogoSize, 32), 80);
    const headerLogoAnimation = config.headerLogoAnimation || 'none';

    const headerSvgCode = config.headerLogoSvgCode || config.logoSvgCode;
    const headerLogoUrl = config.headerLogoUrl || config.logoUrl;
    const initiales = config.initialesLogo || (siteTitle || '').split(' ').map((w: string) => w[0]).join('');

    const showElectricEffect = ['electric', 'lightning-circle', 'storm'].includes(headerLogoAnimation);

    // Colors
    const siteBgColor = config.couleurBackground || '#0a0a0f';
    const headerBgColor = config.headerBgColor || siteBgColor;
    const headerTextColor = config.headerTextColor || config.couleurText || null;

    const bgColorScrolled = headerBgColor;
    const bgColorTransparent = `${headerBgColor}e6`; // 90% opacity

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 flex flex-col transition-all duration-300 pointer-events-none"
        >
            {/* Navbar Main */}
            <div
                className="w-full transition-all duration-300 pointer-events-auto"
                style={{
                    backgroundColor: isScrolled ? bgColorScrolled : bgColorTransparent,
                    borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    color: headerTextColor || undefined,
                    backdropFilter: 'blur(12px)',
                }}
            >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* LOGO */}
                        <a href="#" onClick={handleLogoClick} className="flex items-center gap-2 relative z-10 overflow-visible">
                            <div style={{ width: clampedLogoSize, height: clampedLogoSize }} className="relative">
                                <AnimatedMedia
                                    svgCode={headerSvgCode}
                                    imageUrl={headerLogoUrl}
                                    size={clampedLogoSize}
                                    alt={siteTitle}
                                    animationType={headerLogoAnimation}
                                    showElectricEffect={showElectricEffect}
                                    fallback={<span className="text-lg font-bold">{initiales}</span>}
                                />
                            </div>
                            <span className="text-lg font-semibold text-white truncate max-w-[200px]" style={titleStyle}>
                                {siteTitle}
                            </span>
                        </a>

                        {/* DESKTOP NAV */}
                        <div className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm text-gray-300 hover:text-white transition-colors relative group"
                                    style={navLinkStyle}
                                >
                                    {item.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300" />
                                </a>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="hidden md:flex items-center gap-3">
                            {showCta && ctaUrl && (
                                <a href={ctaUrl} className="px-5 py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 transition-transform">
                                    {ctaText}
                                </a>
                            )}
                        </div>

                        {/* MOBILE MENU BTN */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-white"
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </nav>

                {/* MOBILE MENU */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl"
                        >
                            <div className="px-4 py-4 space-y-1">
                                {navItems.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="block py-3 px-2 text-gray-300 hover:text-white"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}
