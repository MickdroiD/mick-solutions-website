'use client';

import { motion } from 'framer-motion';
// import Image from 'next/image'; // Can use Next Image or standard img if generic
import { ArrowRight, Sparkles, ChevronDown, ArrowDown } from 'lucide-react';
import type { HeroSectionProps } from '../../types';
import {
    getDirectAnimationConfig,
    getIndirectEffectStyles,
    getFrameStyles,
    getFrameAnimationClass,
    getFontFamilyStyle,
    resolveColor,
} from '../../effects-renderer';
import {
    HERO_LAYOUTS,
    BUTTON_SHAPES,
    BUTTON_SIZES,
    BUTTON_STYLES,
    SPACING_GAP,
    SPACING_PADDING_Y,
    MAX_WIDTHS,
    BLOB_SIZES,
    STAT_LAYOUTS,
    type HeroLayout,
    type ButtonShape,
    type ButtonSize,
    type ButtonStyle,
    type SpacingSize,
    type MaxWidth,
} from '../../design-tokens';

// ============================================
// HELPER FUNCTIONS (Local)
// ============================================

function getOverlayColor(color: string = 'black'): string {
    const colors: Record<string, string> = {
        'black': '0,0,0',
        'white': '255,255,255',
        'primary': 'var(--primary-900)',
        'accent': 'var(--accent-900)',
        'slate': '15,23,42',
    };
    return colors[color] || colors['black'];
}

function getBlockAnimation(animType: string | undefined) {
    switch (animType) {
        case 'rotate': return { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: "linear" as const } };
        case 'pulse': return { scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity } };
        case 'shake': return { x: [-2, 2, -2], transition: { duration: 0.5, repeat: Infinity } };
        case 'float': return { y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const } };
        default: return {};
    }
}

// ============================================
// LOGO CONTENT COMPONENT
// ============================================

interface LogoContentProps {
    config: HeroSectionProps['content'];
    logoUrl: string | null;
    heroLogoSize: number;
    effects?: any;
}

function LogoContent({ config, logoUrl, heroLogoSize, effects }: LogoContentProps) {
    const speed = effects?.animationSpeed || 'normal';
    const intensity = effects?.animationIntensity || 'normal';
    const animConfig = getDirectAnimationConfig(effects?.logoDirectEffect, speed, intensity);
    const indirectStyles = getIndirectEffectStyles(effects || {}, intensity);

    // Fallback title logic
    const siteName = "Factory"; // Default fallback
    const initials = siteName.split(' ').map(w => w[0]).join('');

    return (
        <motion.div
            className="relative z-10 w-full h-full flex items-center justify-center"
            animate={animConfig?.animate}
            transition={animConfig?.transition}
            style={indirectStyles}
        >
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt="Logo"
                    style={{
                        width: heroLogoSize,
                        height: heroLogoSize,
                        objectFit: 'contain',
                        ...indirectStyles
                    }}
                />
            ) : (
                <div
                    className="w-full h-full flex items-center justify-center text-6xl sm:text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
                    style={indirectStyles}
                >
                    {initials}
                </div>
            )}
        </motion.div>
    );
}

// ============================================
// LOGO FRAME WRAPPER
// ============================================

interface LogoFrameProps {
    children: React.ReactNode;
    effects?: any;
    size: number;
}

function LogoFrame({ children, effects, size }: LogoFrameProps) {
    const shape = effects?.logoFrameShape || 'none';
    const animation = effects?.logoFrameAnimation || 'none';
    const color = effects?.logoFrameColor || effects?.effectPrimaryColor || 'cyan';
    const thickness = effects?.logoFrameThickness || 2;
    const speed = effects?.animationSpeed || 'normal';
    const intensity = effects?.animationIntensity || 'normal';

    const frameStyles = getFrameStyles(shape, color, thickness);
    const frameAnimClass = getFrameAnimationClass(animation);

    // Manual CSS var injection for animations
    const styleVars = {
        '--frame-color-1': resolveColor(color, '#22d3ee'),
        '--frame-color-2': resolveColor(effects?.effectSecondaryColor, '#a78bfa'),
    } as React.CSSProperties;

    const speedClass = speed !== 'normal' ? `speed-${speed}` : '';
    const intensityClass = `frame-intensity-${intensity}`;

    if (shape === 'none') {
        return (
            <div style={{ width: `${size}px`, height: `${size}px` }} className="relative">
                {children}
            </div>
        );
    }

    return (
        <div
            className={`relative ${frameAnimClass} ${speedClass} ${intensityClass}`}
            style={{
                width: '100%',
                maxWidth: `${size}px`,
                aspectRatio: '1 / 1',
                flexShrink: 0,
                ...frameStyles,
                ...styleVars
            }}
        >
            {children}
        </div>
    );
}

// ============================================
// SCROLL INDICATOR
// ============================================

function ScrollIndicator({ style = 'mouse' }: { style?: string }) {
    if (style === 'arrow') {
        return (
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ArrowDown className="w-8 h-8 text-cyan-400" />
            </motion.div>
        );
    }
    // Default mouse
    return (
        <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-cyan-700 flex justify-center pt-2"
        >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </motion.div>
    );
}

// ============================================
// COMPONENT: HERO ELECTRIC
// ============================================

export default function HeroElectric({ content, design, effects, textSettings }: HeroSectionProps) {
    // defaults
    const heroLayout = design.layout || 'text-left';
    const layoutConfig = HERO_LAYOUTS[heroLayout as HeroLayout] || HERO_LAYOUTS['text-left'];

    // Using simple defaults if tokens fail or data missing
    const columnGap = SPACING_GAP['lg'];
    const paddingY = SPACING_PADDING_Y['lg'];
    const maxWidth = MAX_WIDTHS['xl'];

    const heroHeight = design.height || 'tall';
    const heightClass = {
        short: 'min-h-[60vh]',
        medium: 'min-h-[75vh]',
        tall: 'min-h-screen',
        fullscreen: 'min-h-screen h-screen',
    }[heroHeight] || 'min-h-screen';

    const logoUrl = content.logoUrl || null;
    const heroLogoSize = 280; // Default

    // Background
    const backgroundOpacity = design.overlayOpacity !== undefined ? design.overlayOpacity / 100 : 0.4;
    const overlayColor = 'black'; // simplified for now

    // Buttons
    // Try to get from effects or fallback to defaults
    const buttonShape = BUTTON_SHAPES['pill'];
    const buttonSize = BUTTON_SIZES['lg'];
    const buttonStyle = BUTTON_STYLES['gradient'];

    // Stats
    const statsLayout = STAT_LAYOUTS['horizontal'];

    // Text Animation
    const textAnimation = 'Gradient'; // Force gradient for Electric feel

    // Titre split (Legacy logic support)
    const rawTitre = content.titre || "Hero Title";
    const titreParts = rawTitre.split('.');

    return (
        <section className={`relative ${heightClass} flex items-center justify-center overflow-hidden pt-20 bg-[#0a0a0f]`}>
            {/* BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none">
                {content.backgroundImageUrl && (
                    <img
                        src={content.backgroundImageUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ opacity: 0.5 }}
                    />
                )}
                <div className="absolute inset-0 bg-black/60" style={{ opacity: backgroundOpacity }} />

                {/* BLOBS */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
            </div>

            {/* CONTENT */}
            <div className={`relative z-10 ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${paddingY}`}>
                <div className={`${layoutConfig.container} ${columnGap} ${layoutConfig.reverse ? 'lg:flex-row-reverse' : ''}`}>

                    {/* TEXT COLUMN */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className={`${layoutConfig.textAlign} ${heroLayout === 'centered' ? 'max-w-3xl mx-auto' : ''}`}
                    >
                        {/* Badge Legacy */}
                        {content.badgeHero && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8`}
                            >
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm text-cyan-300">{content.badgeHero}</span>
                            </motion.div>
                        )}

                        <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${textAnimation === 'Gradient' ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-[length:200%_auto] animate-gradient-x' : 'text-white'}`}
                            style={getFontFamilyStyle(textSettings?.titleFontFamily)}
                        >
                            {titreParts.map((part, i) => (
                                <span key={i} className="block">{part}</span>
                            ))}
                        </h1>

                        <p className="text-xl text-slate-400 mb-8 leading-relaxed max-w-xl"
                            style={getFontFamilyStyle(textSettings?.subtitleFontFamily)}
                        >
                            {content.sousTitre}
                        </p>

                        <div className={`flex flex-col sm:flex-row gap-4 ${layoutConfig.justify}`}>
                            {content.ctaPrincipal && (
                                <motion.a
                                    href={content.ctaPrincipal.url}
                                    whileHover={{ scale: 1.05 }}
                                    className={`${buttonSize} ${buttonShape} ${buttonStyle.primary}`}
                                >
                                    {content.ctaPrincipal.texte}
                                    <ArrowRight className="w-5 h-5" />
                                </motion.a>
                            )}
                            {content.ctaSecondaire && (
                                <motion.a
                                    href={content.ctaSecondaire.url}
                                    whileHover={{ scale: 1.05 }}
                                    className={`${buttonSize} ${buttonShape} ${buttonStyle.secondary}`}
                                >
                                    {content.ctaSecondaire.texte}
                                </motion.a>
                            )}
                        </div>

                        {/* STATS Legacy */}
                        {(content.trustStat1Value || content.trustStat2Value) && (
                            <div className={`mt-12 ${statsLayout} border-t border-white/5 pt-8`}>
                                {[
                                    { val: content.trustStat1Value, lbl: content.trustStat1Label },
                                    { val: content.trustStat2Value, lbl: content.trustStat2Label },
                                    { val: content.trustStat3Value, lbl: content.trustStat3Label }
                                ].filter(s => s.val).map((s, i) => (
                                    <div key={i} className={layoutConfig.textAlign}>
                                        <div className="text-3xl font-bold text-white">{s.val}</div>
                                        <div className="text-xs text-cyan-400 uppercase tracking-wider">{s.lbl}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* VISUAL COLUMN */}
                    {heroLayout !== 'centered' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={`flex ${layoutConfig.reverse ? 'justify-start' : 'justify-center lg:justify-end'} w-full lg:w-1/2`}
                        >
                            <LogoFrame effects={effects} size={heroLogoSize}>
                                <LogoContent
                                    config={content}
                                    logoUrl={logoUrl}
                                    heroLogoSize={heroLogoSize}
                                    effects={effects}
                                />
                            </LogoFrame>
                        </motion.div>
                    )}

                </div>
            </div>

            {/* SCROLL INDICATOR */}
            {design.showScrollIndicator && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <ScrollIndicator />
                </div>
            )}
        </section>
    );
}
