'use client';

import { motion, type Transition, type TargetAndTransition } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { ModuleProps } from '../types';
import type { CSSProperties } from 'react';
import TechHUDWrapper from '@/components/animations/TechHUDWrapper';
import type { GridBlock } from '@/lib/types/global-settings';

// ============================================
// TYPES & INTERFACES
// ============================================

// Animation variants for the Hero Logo
interface AnimationVariants {
  animate: TargetAndTransition;
  transition: Transition;
  style?: CSSProperties;
}

// ============================================
// 🔄 NORMALISATION DES ANIMATIONS
// ============================================
type CanonicalAnimation = 'electric' | 'spin' | 'spin-glow' | 'pulse' | 'bounce' | 'none';

function normalizeAnimationValue(raw: string | null | undefined): CanonicalAnimation {
  if (!raw) return 'electric';
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (cleaned.includes('spin') && cleaned.includes('glow')) return 'spin-glow';
  if (cleaned.includes('spin') || cleaned.includes('rotat')) return 'spin';
  if (cleaned.includes('pulse')) return 'pulse';
  if (cleaned.includes('bounce')) return 'bounce';
  if (cleaned.includes('none')) return 'none';
  return 'electric';
}

function getHeroLogoAnimation(animation: string | null | undefined): AnimationVariants {
  const canonical = normalizeAnimationValue(animation);
  switch (canonical) {
    case 'spin-glow':
      return {
        animate: { rotate: 360 },
        transition: { duration: 20, repeat: Infinity, ease: 'linear' },
        style: { filter: 'drop-shadow(0 0 30px rgba(34, 211, 238, 0.6))' }
      };
    case 'spin':
      return {
        animate: { rotate: 360 },
        transition: { duration: 60, repeat: Infinity, ease: 'linear' }
      };
    case 'pulse':
      return {
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 3, repeat: Infinity }
      };
    case 'bounce':
      return {
        animate: { y: [0, -15, 0] },
        transition: { duration: 2, repeat: Infinity }
      };
    case 'electric':
      return {
        animate: {},
        transition: {},
        style: { filter: 'drop-shadow(0 0 40px rgba(34, 211, 238, 0.5))' }
      };
    default:
      return { animate: {}, transition: {} };
  }
}

// Helper pour les animations des blocs individuels
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
// COMPOSANT PRINCIPAL
// ============================================

export function HeroElectric({ config }: ModuleProps) {
  // Récupération des données
  const logoUrl = config.logoUrl || null;
  const heroLogoSize = config.heroLogoSize || 280;
  const heroLogoAnimation = config.heroLogoAnimation || 'electric';
  const animProps = getHeroLogoAnimation(heroLogoAnimation as string);
  const canonicalAnim = normalizeAnimationValue(heroLogoAnimation as string);
  
  // Effets visuels
  const isElectricEffect = ['electric', 'spin-glow'].includes(canonicalAnim);
  const isLightningCircle = canonicalAnim === 'electric';

  // Parser le titre
  const titreParts = config.titreHero ? config.titreHero.split('.') : [];
  const ligne1 = titreParts[0] ? titreParts[0].trim() + (titreParts[0].trim().endsWith('.') ? '' : '.') : '';
  const ligne2 = titreParts[1] ? titreParts[1].trim() + (titreParts[1].trim().endsWith('.') ? '' : '.') : '';
  const ligne3 = titreParts[2] ? titreParts[2].trim() : '';

  // 🧱 LOGIQUE GRID BLOCKS 🧱
  // On vérifie si config.heroBlocks existe et contient des éléments
  const rawBlocks = config.heroBlocks;
  const heroBlocks: GridBlock[] = Array.isArray(rawBlocks) && rawBlocks.length > 0 
    ? rawBlocks 
    : [];
  
  const hasGridBlocks = heroBlocks.length > 0;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-background pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 bg-primary-500/10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 bg-accent-500/10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* GAUCHE: TEXTE */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            {config.badgeHero && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8"
              >
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-300">{config.badgeHero}</span>
              </motion.div>
            )}

            {/* Titre */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 font-heading">
              {ligne1}
              {ligne2 && <><br /><span className="text-gradient">{ligne2}</span></>}
              {ligne3 && <><br />{ligne3}</>}
              {!ligne1 && !ligne2 && !ligne3 && config.titreHero}
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              {config.sousTitreHero}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {config.ctaPrincipal && (
                <motion.a
                  href={config.ctaPrincipalUrl || '#'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all"
                >
                  {config.ctaPrincipal}
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
              )}
              {config.ctaSecondaire && (
                <motion.a
                  href={config.ctaSecondaireUrl || '#'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium text-foreground bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  {config.ctaSecondaire}
                </motion.a>
              )}
            </div>

            {/* Stats */}
            {(config.trustStat1Value || config.trustStat2Value) && (
              <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start pt-8 border-t border-white/5">
                {config.trustStat1Value && (
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-foreground">{config.trustStat1Value}</div>
                    <div className="text-xs text-primary-400">{config.trustStat1Label}</div>
                  </div>
                )}
                {config.trustStat2Value && (
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-foreground">{config.trustStat2Value}</div>
                    <div className="text-xs text-primary-400">{config.trustStat2Label}</div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* DROITE: VISUEL (GRILLE OU LOGO) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end w-full"
          >
            {hasGridBlocks ? (
              // 🧱 OPTION A : GRILLE DYNAMIQUE (Hero Blocks)
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 w-full max-w-[600px]">
                {heroBlocks.map((block) => {
                  // Support ancien format (number) et nouveau format (string %)
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
                    {/* Fallback si pas de contenu */}
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
              // ⚡ OPTION B : LOGO CLASSIQUE
              // ✅ Taille admin respectée - CSS global gère les débordements
              <div 
                className="relative z-10 mb-6"
                style={{
                  width: `${heroLogoSize}px`,
                  height: `${heroLogoSize}px`,
                }}
              >
                <TechHUDWrapper active={isLightningCircle} variant="storm">
                  <motion.div
                    className="relative z-10 w-full h-full flex items-center justify-center"
                    animate={animProps.animate}
                    transition={animProps.transition}
                    style={animProps.style}
                  >
                    {config.logoSvgCode ? (
                      <div
                        className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                        style={{ filter: isElectricEffect ? 'drop-shadow(0 0 30px var(--primary-400))' : undefined }}
                        dangerouslySetInnerHTML={{ __html: config.logoSvgCode }}
                      />
                    ) : logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={config.nomSite}
                        width={Number(heroLogoSize)}
                        height={Number(heroLogoSize)}
                        className="w-full h-full object-contain"
                        style={{ filter: isElectricEffect ? 'drop-shadow(0 0 30px var(--primary-400))' : undefined }}
                        unoptimized
                      />
                    ) : (
                      // Initiales
                      <div 
                        className="w-full h-full flex items-center justify-center text-6xl sm:text-7xl md:text-8xl font-bold text-gradient"
                        style={{ filter: isElectricEffect ? 'drop-shadow(0 0 30px var(--primary-400))' : undefined }}
                      >
                        {config.initialesLogo || 'MS'}
                      </div>
                    )}
                  </motion.div>
                </TechHUDWrapper>
                
                {/* Glow ambiant */}
                {isElectricEffect && !isLightningCircle && (
                  <motion.div
                    className="absolute inset-0 blur-3xl opacity-40 -z-10"
                    animate={{
                      background: [
                        "radial-gradient(circle, var(--primary-400) 0%, transparent 70%)",
                        "radial-gradient(circle, var(--accent-500) 0%, transparent 70%)",
                        "radial-gradient(circle, var(--primary-400) 0%, transparent 70%)",
                      ],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-primary-700 flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}