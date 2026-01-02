'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { LogoFrameStyle } from '@/lib/types/global-settings';

interface AnimatedLogoFrameProps {
  initiales: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Variante de forme du cadre */
  variant?: LogoFrameStyle | null;
}

/**
 * AnimatedLogoFrame - Cadre animé pour le logo dans Header/Footer.
 * 
 * @description Affiche les initiales dans un cadre avec bordure gradient 
 * animée. Supporte plusieurs formes: Square, Circle, ThickCircle, None.
 */
export default function AnimatedLogoFrame({
  initiales,
  size = 'md',
  className = '',
  variant = 'Square'
}: AnimatedLogoFrameProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Normaliser la variante
  const frameVariant = variant || 'Square';

  // Tailles selon le prop
  const sizeClasses = {
    sm: 'h-7 w-7 sm:h-8 sm:w-8',
    md: 'h-9 w-9 sm:h-10 sm:w-10',
    lg: 'h-11 w-11 sm:h-12 sm:w-12',
  };

  const textSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
  };

  const paddingClasses = {
    sm: 'p-1 sm:p-1.5',
    md: 'p-1.5 sm:p-2',
    lg: 'p-2 sm:p-2.5',
  };

  // Classes de bordure selon la variante
  const getBorderRadius = () => {
    switch (frameVariant) {
      case 'Circle':
      case 'ThickCircle':
        return 'rounded-full';
      case 'Square':
        return 'rounded-xl';
      case 'None':
      default:
        return '';
    }
  };

  // Épaisseur de bordure selon la variante
  const getBorderWidth = () => {
    switch (frameVariant) {
      case 'ThickCircle':
        return 'p-[3px]';
      case 'Circle':
      case 'Square':
        return 'p-[2px]';
      case 'None':
      default:
        return 'p-0';
    }
  };

  // Positions des points lumineux selon la forme
  const getGlowPoints = () => {
    switch (frameVariant) {
      case 'Circle':
      case 'ThickCircle':
        // Points sur le cercle
        return [
          { x: 30, y: 4 },   // Top
          { x: 56, y: 30 },  // Right
          { x: 30, y: 56 },  // Bottom
          { x: 4, y: 30 },   // Left
        ];
      case 'Square':
        // Points aux coins
        return [
          { x: 8, y: 8 },   // Top-left
          { x: 52, y: 8 },  // Top-right
          { x: 52, y: 52 }, // Bottom-right
          { x: 8, y: 52 },  // Bottom-left
        ];
      case 'None':
      default:
        return [];
    }
  };

  // Rendu sans cadre (variante None)
  if (frameVariant === 'None') {
    return (
      <motion.div
        className={`relative flex-shrink-0 ${className}`}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`${sizeClasses[size]} ${paddingClasses[size]} flex items-center justify-center`}>
          <motion.span
            className={`${textSizes[size]} font-black`}
            style={{
              background: 'linear-gradient(135deg, var(--primary-400, #22d3ee), var(--accent-400, #a78bfa))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={isClient ? {
              textShadow: [
                '0 0 10px rgba(34, 211, 238, 0.3)',
                '0 0 20px rgba(168, 139, 250, 0.3)',
                '0 0 10px rgba(34, 211, 238, 0.3)',
              ],
            } : undefined}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {initiales}
          </motion.span>
        </div>
      </motion.div>
    );
  }

  // Fallback statique côté serveur
  if (!isClient) {
    return (
      <div className={`flex-shrink-0 ${getBorderWidth()} ${getBorderRadius()} bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 ${className}`}>
        <div className={`bg-slate-900 ${getBorderRadius()} ${paddingClasses[size]}`}>
          <div className={`${sizeClasses[size]} flex items-center justify-center`}>
            <span
              className={`${textSizes[size]} font-black`}
              style={{
                background: 'linear-gradient(135deg, var(--primary-400, #22d3ee), var(--accent-400, #a78bfa))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {initiales}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const glowPoints = getGlowPoints();

  return (
    <motion.div
      className={`relative flex-shrink-0 aspect-square ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {/* SVG pour les effets lumineux */}
      {glowPoints.length > 0 && (
        <svg
          viewBox="0 0 60 60"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scale(1.15)' }}
        >
          <defs>
            <linearGradient id={`frameGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop
                offset="0%"
                animate={{ stopColor: ['var(--primary-400, #22d3ee)', 'var(--accent-400, #a78bfa)', 'var(--primary-400, #22d3ee)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.stop
                offset="100%"
                animate={{ stopColor: ['var(--accent-400, #a78bfa)', 'var(--primary-400, #22d3ee)', 'var(--accent-400, #a78bfa)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </linearGradient>
            <filter id={`cornerGlow-${size}`}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Points lumineux positionnés selon la forme */}
          {glowPoints.map((pos, i) => (
            <motion.circle
              key={i}
              cx={pos.x}
              cy={pos.y}
              r={frameVariant === 'ThickCircle' ? 2.5 : 2}
              fill={`url(#frameGradient-${size})`}
              filter={`url(#cornerGlow-${size})`}
              initial={{ opacity: 0.4, scale: 0.8 }}
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
        </svg>
      )}

      {/* Cadre principal avec gradient */}
      <div
        className={`${getBorderWidth()} ${getBorderRadius()}`}
        style={{
          background: 'linear-gradient(135deg, var(--primary-400, #22d3ee), var(--accent-400, #a78bfa))',
          backgroundSize: '200% 200%',
          animation: 'gradient-x 3s ease infinite',
        }}
      >
        <div className={`bg-slate-900 ${getBorderRadius()} ${paddingClasses[size]}`}>
          <div className={`${sizeClasses[size]} flex items-center justify-center relative`}>
            {/* Glow effect interne */}
            <motion.div
              className={`absolute inset-0 ${frameVariant === 'Circle' || frameVariant === 'ThickCircle' ? 'rounded-full' : 'rounded-lg'} blur-md opacity-40`}
              animate={{
                background: [
                  'radial-gradient(circle, var(--primary-400, #22d3ee) 0%, transparent 70%)',
                  'radial-gradient(circle, var(--accent-400, #a78bfa) 0%, transparent 70%)',
                  'radial-gradient(circle, var(--primary-400, #22d3ee) 0%, transparent 70%)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Initiales avec gradient */}
            <motion.span
              className={`${textSizes[size]} font-black relative z-10`}
              style={{
                background: 'linear-gradient(135deg, var(--primary-400, #22d3ee), var(--accent-400, #a78bfa))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{
                textShadow: [
                  '0 0 10px rgba(34, 211, 238, 0.3)',
                  '0 0 20px rgba(168, 139, 250, 0.3)',
                  '0 0 10px rgba(34, 211, 238, 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {initiales}
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
