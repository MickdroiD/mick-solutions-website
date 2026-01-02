'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Sparkles, ChevronDown, ArrowDown } from 'lucide-react';
import type { ModuleProps } from '../types';
import type { GridBlock } from '@/lib/types/global-settings';
import {
  getDirectAnimationConfig,
  getIndirectEffectStyles,
  getFrameStyles,
  getFrameAnimationClass,
  getFontFamilyStyle,
  resolveColor,
} from '@/lib/helpers/effects-renderer';
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
} from '@/lib/design-tokens';
import type { TextSettings } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

// Extended effect settings for Hero (includes all configurable options)
interface ExtendedEffectSettings {
  // Index signature for compatibility with EffectSettings from factory.ts
  [key: string]: unknown;

  // From original EffectSettings
  logoDirectEffect?: string;
  logoIndirectEffect?: string;
  logoFrameShape?: string;
  logoFrameAnimation?: string;
  logoFrameColor?: string;
  logoFrameThickness?: number;
  effectPrimaryColor?: string;
  effectSecondaryColor?: string;
  backgroundOpacity?: number;
  backgroundBlur?: number;
  height?: 'Short' | 'Medium' | 'Tall' | 'FullScreen';
  logoSize?: number;

  // Layout options
  heroLayout?: HeroLayout;
  columnGap?: SpacingSize;
  maxWidth?: MaxWidth;
  paddingY?: SpacingSize;

  // Button options
  buttonShape?: ButtonShape;
  buttonSize?: ButtonSize;
  buttonStyle?: ButtonStyle;
  showButtonIcon?: boolean;

  // Animation options
  animationSpeed?: 'slow' | 'normal' | 'fast';
  animationIntensity?: 'subtle' | 'normal' | 'strong' | 'intense';

  // Overlay options
  overlayColor?: 'black' | 'white' | 'primary' | 'accent' | 'slate';
  overlayOpacity?: number;

  // Blob options
  showBlobs?: boolean;
  blobSize?: SpacingSize;

  // Advanced options
  showScrollIndicator?: boolean;
  scrollIndicatorStyle?: 'mouse' | 'arrow' | 'chevron' | 'dot';
  statsLayout?: 'horizontal' | 'vertical' | 'grid-2' | 'grid-3';
}

// ============================================
// HELPER FUNCTIONS
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
// LOGO CONTENT COMPONENT (avec effets indirects sur le logo)
// ============================================

interface LogoContentProps {
  config: ModuleProps['config'];
  logoUrl: string | null;
  heroLogoSize: number;
  effects?: ExtendedEffectSettings;
}

function LogoContent({ config, logoUrl, heroLogoSize, effects }: LogoContentProps) {
  // Get animation config based on speed and intensity
  const speed = effects?.animationSpeed || 'normal';
  const intensity = effects?.animationIntensity || 'normal';
  const animConfig = getDirectAnimationConfig(effects?.logoDirectEffect, speed, intensity);

  // Get indirect effect styles (drop-shadow qui suit les contours du logo)
  const indirectStyles = getIndirectEffectStyles(effects || {}, intensity);

  return (
    <motion.div
      className="relative z-10 w-full h-full flex items-center justify-center"
      animate={animConfig?.animate}
      transition={animConfig?.transition}
      style={indirectStyles}
    >
      {config.logoSvgCode ? (
        <div
          className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
          style={indirectStyles}
          dangerouslySetInnerHTML={{ __html: config.logoSvgCode }}
        />
      ) : logoUrl ? (
        <Image
          src={logoUrl}
          alt={config.nomSite}
          width={Number(heroLogoSize)}
          height={Number(heroLogoSize)}
          className="w-full h-full object-contain"
          style={indirectStyles}
          unoptimized
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-6xl sm:text-7xl md:text-8xl font-bold text-gradient"
          style={indirectStyles}
        >
          {config.initialesLogo || 'MS'}
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// LOGO FRAME WRAPPER (Cadre animé autour du logo)
// ============================================

interface LogoFrameProps {
  children: React.ReactNode;
  effects?: ExtendedEffectSettings;
  size: number;
}

function LogoFrame({ children, effects, size }: LogoFrameProps) {
  const shape = effects?.logoFrameShape || 'none';
  const animation = effects?.logoFrameAnimation || 'none';
  const color = effects?.logoFrameColor || effects?.effectPrimaryColor || 'cyan';
  const secondaryColor = effects?.effectSecondaryColor || 'purple';
  const thickness = effects?.logoFrameThickness || 2;
  const speed = effects?.animationSpeed || 'normal';
  const intensity = effects?.animationIntensity || 'normal';

  // Get frame styles
  const frameStyles = getFrameStyles(shape, color, thickness);
  const frameAnimClass = getFrameAnimationClass(animation);

  // CSS variables for animation colors
  const cssVars = {
    '--frame-color-1': resolveColor(color, '#22d3ee'),
    '--frame-color-2': resolveColor(secondaryColor, '#a78bfa'),
  } as React.CSSProperties;

  // Speed class
  const speedClass = speed !== 'normal' ? `speed-${speed}` : '';
  const intensityClass = `frame-intensity-${intensity}`;

  // If no frame, just return children in a basic container
  if (shape === 'none') {
    return (
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className="relative"
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative ${frameAnimClass} ${speedClass} ${intensityClass} max-w-full`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...frameStyles,
        ...cssVars,
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// SCROLL INDICATOR COMPONENT
// ============================================

function ScrollIndicator({ style = 'mouse' }: { style?: string }) {
  if (style === 'arrow') {
    return (
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown className="w-8 h-8 text-primary-400" />
      </motion.div>
    );
  }

  if (style === 'chevron') {
    return (
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-primary-400" />
      </motion.div>
    );
  }

  if (style === 'dot') {
    return (
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-3 h-3 rounded-full bg-primary-400"
      />
    );
  }

  // Default: mouse
  return (
    <motion.div
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-6 h-10 rounded-full border-2 border-primary-700 flex justify-center pt-2"
    >
      <motion.div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function HeroElectric({ config }: ModuleProps) {
  // Get effects and textSettings
  const effects = (config as { effects?: ExtendedEffectSettings }).effects || {};
  const textSettings = (config as { textSettings?: TextSettings }).textSettings;

  // ========== LAYOUT ==========
  const heroLayout = effects.heroLayout || 'text-left';
  const layoutConfig = HERO_LAYOUTS[heroLayout];
  const columnGap = SPACING_GAP[effects.columnGap || 'lg'];
  const paddingY = SPACING_PADDING_Y[effects.paddingY || 'lg'];
  const maxWidth = MAX_WIDTHS[effects.maxWidth || 'xl'];

  // ========== HEIGHT ==========
  const heroHeight = config.heroHeight || effects.height || 'Tall';
  const heightClass = {
    Short: 'min-h-[70vh]',
    Medium: 'min-h-[85vh]',
    Tall: 'min-h-screen',
    FullScreen: 'min-h-screen h-screen',
  }[heroHeight as string] || 'min-h-screen';

  // ========== LOGO ==========
  const logoUrl = config.logoUrl || null;
  const heroLogoSize = effects.logoSize || config.heroLogoSize || 280;

  // ========== BACKGROUND ==========
  const heroBackgroundUrl = config.heroBackgroundUrl || null;
  const heroVideoUrl = config.heroVideoUrl || null;
  const backgroundOpacity = effects.backgroundOpacity !== undefined ? effects.backgroundOpacity / 100 : 1;
  const backgroundBlur = effects.backgroundBlur || 0;

  // ========== OVERLAY ==========
  const overlayColor = effects.overlayColor || 'black';
  const overlayOpacity = effects.overlayOpacity !== undefined ? effects.overlayOpacity / 100 : 0.4;

  // ========== BLOBS ==========
  const showBlobs = effects.showBlobs !== false;
  const blobConfig = BLOB_SIZES[effects.blobSize || 'lg'];

  // ========== BUTTONS ==========
  const buttonShape = BUTTON_SHAPES[effects.buttonShape || 'pill'];
  const buttonSize = BUTTON_SIZES[effects.buttonSize || 'lg'];
  const buttonStyle = BUTTON_STYLES[effects.buttonStyle || 'gradient'];
  const showButtonIcon = effects.showButtonIcon !== false;

  // ========== STATS ==========
  const statsLayout = STAT_LAYOUTS[effects.statsLayout as keyof typeof STAT_LAYOUTS] || STAT_LAYOUTS['horizontal'];

  // ========== SCROLL INDICATOR ==========
  const showScrollIndicator = effects.showScrollIndicator !== false;
  const scrollIndicatorStyle = effects.scrollIndicatorStyle || 'mouse';

  // ========== TEXT ANIMATION ==========
  const textAnimation = config.textAnimation || 'None';
  const getTextAnimationClass = () => {
    switch (textAnimation) {
      case 'Gradient': return 'animate-gradient-x bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent bg-[length:200%_auto]';
      case 'Fade': return 'animate-fade-in';
      default: return '';
    }
  };

  // ========== TITLE PARSING ==========
  const titreParts = config.titreHero ? config.titreHero.split('.') : [];
  const ligne1 = titreParts[0] ? titreParts[0].trim() + (titreParts[0].trim().endsWith('.') ? '' : '.') : '';
  const ligne2 = titreParts[1] ? titreParts[1].trim() + (titreParts[1].trim().endsWith('.') ? '' : '.') : '';
  const ligne3 = titreParts[2] ? titreParts[2].trim() : '';

  // ========== HERO BLOCKS ==========
  const rawBlocks = config.heroBlocks;
  const heroBlocks: GridBlock[] = Array.isArray(rawBlocks) && rawBlocks.length > 0 ? rawBlocks : [];
  const hasGridBlocks = heroBlocks.length > 0;

  // ========== RENDER ==========
  return (
    <section className={`relative ${heightClass} flex items-center justify-center overflow-hidden pt-20`}>
      {/* ===== BACKGROUND LAYER ===== */}
      <div className="absolute inset-0 bg-background pointer-events-none">
        {/* Video background */}
        {heroVideoUrl && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
        )}

        {/* Image background */}
        {heroBackgroundUrl && !heroVideoUrl && (
          <Image
            src={heroBackgroundUrl}
            alt="Hero background"
            fill
            className="object-cover"
            style={{
              opacity: backgroundOpacity,
              filter: backgroundBlur ? `blur(${backgroundBlur}px)` : undefined,
            }}
            priority
          />
        )}

        {/* Overlay */}
        {(heroBackgroundUrl || heroVideoUrl) && overlayOpacity > 0 && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: overlayColor === 'primary' || overlayColor === 'accent'
                ? `var(--${overlayColor}-900)`
                : undefined,
              background: overlayColor !== 'primary' && overlayColor !== 'accent'
                ? `rgba(${getOverlayColor(overlayColor)},${overlayOpacity})`
                : undefined,
              opacity: overlayColor === 'primary' || overlayColor === 'accent' ? overlayOpacity : 1,
            }}
          />
        )}

        {/* Decorative blobs */}
        {showBlobs && (
          <>
            <div
              className="absolute top-0 left-0 rounded-full -translate-x-1/2 -translate-y-1/2 bg-primary-500/10"
              style={{
                width: blobConfig.size,
                height: blobConfig.size,
                filter: `blur(${blobConfig.blur})`
              }}
            />
            <div
              className="absolute bottom-0 right-0 rounded-full translate-x-1/3 translate-y-1/3 bg-accent-500/10"
              style={{
                width: `calc(${blobConfig.size} * 0.75)`,
                height: `calc(${blobConfig.size} * 0.75)`,
                filter: `blur(${blobConfig.blur})`
              }}
            />
          </>
        )}
      </div>

      {/* ===== CONTENT ===== */}
      <div className={`relative z-10 ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${paddingY}`}>
        <div className={`${layoutConfig.container} ${columnGap} ${layoutConfig.reverse ? 'lg:flex-row-reverse' : ''}`}>

          {/* ===== TEXT COLUMN ===== */}
          <motion.div
            initial={{ opacity: 0, x: layoutConfig.reverse ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`${layoutConfig.textAlign} ${heroLayout === 'centered' ? 'max-w-3xl mx-auto' : ''}`}
          >
            {/* Badge */}
            {config.badgeHero && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8 ${layoutConfig.justify}`}
              >
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-300">{config.badgeHero}</span>
              </motion.div>
            )}

            {/* Title */}
            <h1
              className={`${textSettings?.titleFontSize || 'text-4xl sm:text-5xl lg:text-6xl'} ${textSettings?.titleFontWeight || 'font-bold'} ${textSettings?.titleColor || 'text-foreground'} ${textSettings?.titleAlign || layoutConfig.textAlign} ${textSettings?.titleTransform || ''} ${textSettings?.bodyLineHeight || 'leading-tight'} mb-6 font-heading ${textAnimation === 'Gradient' && !textSettings?.titleColor ? getTextAnimationClass() : ''}`}
              style={getFontFamilyStyle(textSettings?.titleFontFamily)}
            >
              {ligne1}
              {ligne2 && <><br />{ligne2}</>}
              {ligne3 && <><br />{ligne3}</>}
              {!ligne1 && !ligne2 && !ligne3 && config.titreHero}
            </h1>

            {/* Subtitle */}
            <p
              className={`${textSettings?.subtitleFontSize || 'text-lg sm:text-xl'} ${textSettings?.subtitleColor || 'text-muted-foreground'} ${textSettings?.bodyLineHeight || 'leading-relaxed'} mb-8 ${heroLayout === 'centered' ? '' : 'max-w-xl'} ${heroLayout === 'centered' ? 'mx-auto' : layoutConfig.textAlign.includes('right') ? 'ml-auto' : ''}`}
              style={getFontFamilyStyle(textSettings?.subtitleFontFamily)}
            >
              {config.sousTitreHero}
            </p>

            {/* CTAs */}
            <div className={`flex flex-col sm:flex-row gap-4 ${layoutConfig.justify}`}>
              {config.ctaPrincipal && (
                <motion.a
                  href={config.ctaPrincipalUrl || '#'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${buttonSize} ${buttonShape} ${buttonStyle.primary} font-semibold transition-all`}
                >
                  {config.ctaPrincipal}
                  {showButtonIcon && <ArrowRight className="w-5 h-5" />}
                </motion.a>
              )}
              {config.ctaSecondaire && (
                <motion.a
                  href={config.ctaSecondaireUrl || '#'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${buttonSize} ${buttonShape} ${buttonStyle.secondary} font-medium transition-all`}
                >
                  {config.ctaSecondaire}
                </motion.a>
              )}
            </div>

            {/* Stats */}
            {(config.trustStat1Value || config.trustStat2Value || config.trustStat3Value) && (
              <div className={`mt-12 ${statsLayout} ${layoutConfig.justify} pt-8 border-t border-white/5`}>
                {[
                  { value: config.trustStat1Value, label: config.trustStat1Label },
                  { value: config.trustStat2Value, label: config.trustStat2Label },
                  { value: config.trustStat3Value, label: config.trustStat3Label },
                ].filter(stat => stat.value).map((stat, index) => (
                  <div key={index} className={layoutConfig.textAlign}>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-primary-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ===== VISUAL COLUMN (only for non-centered layouts) ===== */}
          {heroLayout !== 'centered' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`flex ${layoutConfig.reverse ? 'justify-start' : 'justify-center lg:justify-end'} w-full`}
            >
              {hasGridBlocks ? (
                // Grid blocks mode
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 w-full max-w-[600px]">
                  {heroBlocks.map((block) => {
                    const getColSpan = () => {
                      if (block.width === '100%') return 'col-span-4 aspect-[2/1]';
                      if (block.width === '50%') return 'col-span-2 aspect-square';
                      if (block.width === '25%') return 'col-span-1 aspect-square';
                      return 'col-span-1 aspect-square';
                    };
                    return (
                      <motion.div
                        key={block.id}
                        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm ${getColSpan()}`}
                        animate={getBlockAnimation(block.animation)}
                        whileHover={{ scale: 1.02, borderColor: 'var(--primary-500)' }}
                      >
                        {block.type === 'image' && block.content && (
                          <Image
                            src={block.content}
                            alt="Hero block"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        )}
                        {!block.content && (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                            <Sparkles className="w-8 h-8 text-primary-400 opacity-50" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                // Logo mode with frame
                <LogoFrame effects={effects} size={heroLogoSize}>
                  <LogoContent
                    config={config}
                    logoUrl={logoUrl}
                    heroLogoSize={heroLogoSize}
                    effects={effects}
                  />
                </LogoFrame>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ===== SCROLL INDICATOR ===== */}
      {showScrollIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ScrollIndicator style={scrollIndicatorStyle} />
        </motion.div>
      )}
    </section>
  );
}
