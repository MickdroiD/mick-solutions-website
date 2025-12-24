'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import type { AnimationStyleType } from '@/lib/types/global-settings';

interface AnimationWrapperProps {
  /** Style d'animation à appliquer */
  animationStyle: AnimationStyleType;
  /** Contenu à animer */
  children: ReactNode;
  /** Délai avant le démarrage de l'animation (en secondes) */
  delay?: number;
  /** Classes CSS additionnelles */
  className?: string;
  /** Durée de l'animation (en secondes) */
  duration?: number;
}

/**
 * Variantes d'animation pour le style "Elegant Fade".
 * Effet simple et élégant : opacity 0→1 + translation y 20→0.
 */
const elegantFadeVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
    }
  },
};

/**
 * Variantes d'animation pour le style "Dynamic Slide".
 * Effet dynamique avec slide et scale.
 */
const dynamicSlideVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -30,
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
    }
  },
};

/**
 * Variantes d'animation pour le style "Mick Electric".
 * Effet électrique avec glow et pulse.
 */
const mickElectricVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    filter: 'blur(10px)',
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1], // easeOutQuint
    }
  },
};

/**
 * Obtient les variantes d'animation selon le style choisi.
 */
function getVariants(style: AnimationStyleType): Variants | null {
  switch (style) {
    case 'Mick Electric':
      return mickElectricVariants;
    case 'Elegant Fade':
      return elegantFadeVariants;
    case 'Dynamic Slide':
      return dynamicSlideVariants;
    case 'Minimal':
      return null; // Pas d'animation
    default:
      return elegantFadeVariants;
  }
}

/**
 * Wrapper d'animation configurable.
 * Applique différentes animations selon le style défini dans Baserow.
 * 
 * Styles disponibles:
 * - 'Mick Electric': Animation électrique avec blur et glow
 * - 'Elegant Fade': Fade-in simple avec translation verticale
 * - 'Dynamic Slide': Slide horizontal avec scale
 * - 'Minimal': Rendu direct sans animation
 */
export default function AnimationWrapper({
  animationStyle,
  children,
  delay = 0,
  className = '',
  duration,
}: AnimationWrapperProps) {
  const variants = getVariants(animationStyle);

  // Mode Minimal: rendu direct sans wrapper motion
  if (!variants) {
    return <div className={className}>{children}</div>;
  }

  // Appliquer l'animation avec les variantes correspondantes
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={variants}
      transition={{
        delay,
        ...(duration && { duration }),
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hook pour obtenir les props d'animation à appliquer directement sur un composant.
 * Utile quand on ne peut pas wrapper avec AnimationWrapper.
 */
export function useAnimationProps(
  animationStyle: AnimationStyleType, 
  delay: number = 0
) {
  const variants = getVariants(animationStyle);
  
  if (!variants) {
    return {};
  }

  return {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, margin: '-50px' },
    variants,
    transition: { delay },
  };
}

/**
 * Composant pour les animations staggered (éléments enfants décalés).
 * Utilisé pour les listes d'items comme Services, Portfolio, etc.
 */
interface StaggerContainerProps {
  children: ReactNode;
  animationStyle: AnimationStyleType;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  animationStyle,
  staggerDelay = 0.1,
  className = '',
}: StaggerContainerProps) {
  // Mode Minimal: rendu direct
  if (animationStyle === 'Minimal') {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Composant enfant pour StaggerContainer.
 * À utiliser à l'intérieur d'un StaggerContainer.
 */
interface StaggerItemProps {
  children: ReactNode;
  animationStyle: AnimationStyleType;
  className?: string;
}

export function StaggerItem({
  children,
  animationStyle,
  className = '',
}: StaggerItemProps) {
  const variants = getVariants(animationStyle);

  // Mode Minimal: rendu direct
  if (!variants) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

