'use client';

import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState, useMemo } from 'react';
import { NEON_COLOR_PRESETS, type NeonColorPreset } from './registry';

// ============================================
// TYPES
// ============================================

export type FrameShape = 
  | 'square' 
  | 'rounded-square' 
  | 'circle' 
  | 'hexagon' 
  | 'octagon' 
  | 'diamond'
  | 'none';

export type FrameAnimation = 
  | 'none' 
  | 'rotate' 
  | 'pulse' 
  | 'color-flow' 
  | 'dash-flow'
  | 'glow-pulse';

export type FrameColorMode = 
  | 'solid' 
  | 'gradient' 
  | 'rainbow' 
  | 'moving-gradient';

export interface EnhancedLogoFrameProps {
  /** Content inside the frame (logo, initials, etc.) */
  children: ReactNode;
  /** Frame shape */
  shape?: FrameShape;
  /** Frame animation type */
  animation?: FrameAnimation;
  /** Color mode */
  colorMode?: FrameColorMode;
  /** Primary color (hex, rgb, or preset name) */
  primaryColor?: string | NeonColorPreset;
  /** Secondary color for gradients */
  secondaryColor?: string | NeonColorPreset;
  /** Frame thickness in pixels */
  thickness?: number;
  /** Overall size in pixels */
  size?: number;
  /** Show corner/edge glow points */
  showGlowPoints?: boolean;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  /** Additional className */
  className?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function resolveColor(color: string | NeonColorPreset): string {
  if (typeof color === 'string' && color in NEON_COLOR_PRESETS) {
    return NEON_COLOR_PRESETS[color as NeonColorPreset].primary;
  }
  return color;
}

function getShapePath(shape: FrameShape, size: number): string {
  const center = size / 2;
  const radius = size / 2 - 2;
  
  switch (shape) {
    case 'hexagon': {
      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
      });
      return `M${points.join(' L')} Z`;
    }
    case 'octagon': {
      const points = Array.from({ length: 8 }, (_, i) => {
        const angle = (Math.PI / 4) * i - Math.PI / 8;
        return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
      });
      return `M${points.join(' L')} Z`;
    }
    case 'diamond': {
      return `M${center},2 L${size - 2},${center} L${center},${size - 2} L2,${center} Z`;
    }
    default:
      return '';
  }
}

function getShapeClipPath(shape: FrameShape): string {
  switch (shape) {
    case 'circle':
      return 'circle(50% at center)';
    case 'hexagon':
      return 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
    case 'octagon':
      return 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)';
    case 'diamond':
      return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    case 'rounded-square':
      return 'inset(0 round 20%)';
    case 'square':
      return 'inset(0 round 12%)';
    default:
      return '';
  }
}

function getGlowPositions(shape: FrameShape, size: number): Array<{ x: number; y: number }> {
  const center = size / 2;
  const radius = size / 2;
  
  switch (shape) {
    case 'circle':
      return Array.from({ length: 4 }, (_, i) => ({
        x: center + radius * Math.cos((Math.PI / 2) * i),
        y: center + radius * Math.sin((Math.PI / 2) * i),
      }));
    case 'hexagon':
      return Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        return {
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle),
        };
      });
    case 'octagon':
      return Array.from({ length: 8 }, (_, i) => {
        const angle = (Math.PI / 4) * i - Math.PI / 8;
        return {
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle),
        };
      });
    case 'diamond':
      return [
        { x: center, y: 4 },
        { x: size - 4, y: center },
        { x: center, y: size - 4 },
        { x: 4, y: center },
      ];
    case 'square':
    case 'rounded-square':
    default:
      return [
        { x: 8, y: 8 },
        { x: size - 8, y: 8 },
        { x: size - 8, y: size - 8 },
        { x: 8, y: size - 8 },
      ];
  }
}

// ============================================
// FRAME RENDERERS
// ============================================

function SVGFrame({
  shape,
  size,
  thickness,
  primaryColor,
  secondaryColor,
  animation,
  colorMode,
  glowIntensity,
}: {
  shape: FrameShape;
  size: number;
  thickness: number;
  primaryColor: string;
  secondaryColor: string;
  animation: FrameAnimation;
  colorMode: FrameColorMode;
  glowIntensity: number;
}) {
  const isPolygon = ['hexagon', 'octagon', 'diamond'].includes(shape);
  const path = isPolygon ? getShapePath(shape, size) : '';
  
  // Animation properties
  const rotationAnim = animation === 'rotate' ? { rotate: 360 } : {};
  const rotationTransition = animation === 'rotate' 
    ? { duration: 10, repeat: Infinity, ease: 'linear' as const }
    : {};
  
  // Gradient IDs
  const gradientId = `frame-gradient-${shape}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Stroke dasharray for dash-flow animation
  const strokeDasharray = animation === 'dash-flow' ? '10 5' : undefined;
  
  return (
    <motion.svg
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      animate={rotationAnim}
      transition={rotationTransition}
    >
      <defs>
        {/* Static or animated gradient */}
        {colorMode === 'gradient' || colorMode === 'moving-gradient' ? (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {colorMode === 'moving-gradient' ? (
              <>
                <motion.stop
                  offset="0%"
                  animate={{ stopColor: [primaryColor, secondaryColor, primaryColor] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.stop
                  offset="100%"
                  animate={{ stopColor: [secondaryColor, primaryColor, secondaryColor] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor={primaryColor} />
                <stop offset="100%" stopColor={secondaryColor} />
              </>
            )}
          </linearGradient>
        ) : colorMode === 'rainbow' ? (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <motion.stop
              offset="0%"
              animate={{ stopColor: ['#22d3ee', '#a855f7', '#ec4899', '#22d3ee'] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.stop
              offset="50%"
              animate={{ stopColor: ['#a855f7', '#ec4899', '#22d3ee', '#a855f7'] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.stop
              offset="100%"
              animate={{ stopColor: ['#ec4899', '#22d3ee', '#a855f7', '#ec4899'] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </linearGradient>
        ) : null}
        
        {/* Glow filter */}
        <filter id={`glow-${gradientId}`}>
          <feGaussianBlur stdDeviation={3 * glowIntensity} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Frame path */}
      {isPolygon ? (
        <motion.path
          d={path}
          fill="none"
          stroke={colorMode === 'solid' ? primaryColor : `url(#${gradientId})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={strokeDasharray}
          filter={`url(#glow-${gradientId})`}
          animate={
            animation === 'pulse' 
              ? { strokeWidth: [thickness, thickness * 1.5, thickness] }
              : animation === 'dash-flow'
              ? { strokeDashoffset: [0, 30] }
              : {}
          }
          transition={
            animation === 'pulse'
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : animation === 'dash-flow'
              ? { duration: 1, repeat: Infinity, ease: 'linear' }
              : {}
          }
        />
      ) : shape === 'circle' ? (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - thickness}
          fill="none"
          stroke={colorMode === 'solid' ? primaryColor : `url(#${gradientId})`}
          strokeWidth={thickness}
          strokeDasharray={strokeDasharray}
          filter={`url(#glow-${gradientId})`}
          animate={
            animation === 'pulse'
              ? { strokeWidth: [thickness, thickness * 1.5, thickness] }
              : animation === 'dash-flow'
              ? { strokeDashoffset: [0, 60] }
              : {}
          }
          transition={
            animation === 'pulse'
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : animation === 'dash-flow'
              ? { duration: 2, repeat: Infinity, ease: 'linear' }
              : {}
          }
        />
      ) : (
        <motion.rect
          x={thickness / 2}
          y={thickness / 2}
          width={size - thickness}
          height={size - thickness}
          rx={shape === 'rounded-square' ? size * 0.2 : size * 0.12}
          fill="none"
          stroke={colorMode === 'solid' ? primaryColor : `url(#${gradientId})`}
          strokeWidth={thickness}
          strokeDasharray={strokeDasharray}
          filter={`url(#glow-${gradientId})`}
          animate={
            animation === 'pulse'
              ? { strokeWidth: [thickness, thickness * 1.5, thickness] }
              : animation === 'dash-flow'
              ? { strokeDashoffset: [0, 40] }
              : {}
          }
          transition={
            animation === 'pulse'
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : animation === 'dash-flow'
              ? { duration: 1.5, repeat: Infinity, ease: 'linear' }
              : {}
          }
        />
      )}
    </motion.svg>
  );
}

function GlowPoints({
  shape,
  size,
  primaryColor,
  secondaryColor,
  glowIntensity,
}: {
  shape: FrameShape;
  size: number;
  primaryColor: string;
  secondaryColor: string;
  glowIntensity: number;
}) {
  const positions = useMemo(() => getGlowPositions(shape, size), [shape, size]);
  const gradientId = `glow-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg 
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ transform: 'scale(1.15)' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{ stopColor: [primaryColor, secondaryColor, primaryColor] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: [secondaryColor, primaryColor, secondaryColor] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </linearGradient>
        <filter id={`point-glow-${gradientId}`}>
          <feGaussianBlur stdDeviation={2} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {positions.map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={3}
          fill={`url(#${gradientId})`}
          filter={`url(#point-glow-${gradientId})`}
          initial={{ opacity: 0.4 * glowIntensity, scale: 0.8 }}
          animate={{ 
            opacity: [0.4 * glowIntensity, glowIntensity, 0.4 * glowIntensity], 
            scale: [0.8, 1.2, 0.8] 
          }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </svg>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function EnhancedLogoFrame({
  children,
  shape = 'rounded-square',
  animation = 'color-flow',
  colorMode = 'moving-gradient',
  primaryColor = 'cyan',
  secondaryColor = 'purple',
  thickness = 2,
  size = 48,
  showGlowPoints = true,
  glowIntensity = 0.8,
  className = '',
}: EnhancedLogoFrameProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Resolve colors
  const resolvedPrimary = resolveColor(primaryColor);
  const resolvedSecondary = resolveColor(secondaryColor);
  
  // Get clip path for content masking
  const clipPath = getShapeClipPath(shape);

  // No frame
  if (shape === 'none') {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        {children}
      </div>
    );
  }

  // Server-side fallback
  if (!isClient) {
    return (
      <div 
        className={`relative ${className}`}
        style={{ width: size, height: size }}
      >
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            border: `${thickness}px solid ${resolvedPrimary}`,
            borderRadius: shape === 'circle' ? '50%' : shape === 'rounded-square' ? '20%' : '12%',
          }}
        />
        <div 
          className="relative z-10 w-full h-full flex items-center justify-center"
          style={{ clipPath }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glow points layer */}
      {showGlowPoints && (
        <GlowPoints
          shape={shape}
          size={size}
          primaryColor={resolvedPrimary}
          secondaryColor={resolvedSecondary}
          glowIntensity={glowIntensity}
        />
      )}
      
      {/* Frame layer */}
      <SVGFrame
        shape={shape}
        size={size}
        thickness={thickness}
        primaryColor={resolvedPrimary}
        secondaryColor={resolvedSecondary}
        animation={animation}
        colorMode={colorMode}
        glowIntensity={glowIntensity}
      />
      
      {/* Glow pulse effect */}
      {animation === 'glow-pulse' && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 20px ${resolvedPrimary}`,
            clipPath,
          }}
          animate={{
            boxShadow: [
              `0 0 10px ${resolvedPrimary}`,
              `0 0 30px ${resolvedPrimary}, 0 0 60px ${resolvedSecondary}`,
              `0 0 10px ${resolvedPrimary}`,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      
      {/* Content */}
      <div 
        className="relative z-10 w-full h-full flex items-center justify-center bg-slate-900/80"
        style={{ 
          clipPath,
          padding: thickness + 2,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ============================================
// FRAME SHAPE OPTIONS FOR ADMIN
// ============================================

export const FRAME_SHAPE_OPTIONS = [
  { value: 'none', label: 'Aucun', icon: '⬜' },
  { value: 'square', label: 'Carré', icon: '◻️' },
  { value: 'rounded-square', label: 'Carré arrondi', icon: '🔲' },
  { value: 'circle', label: 'Cercle', icon: '⭕' },
  { value: 'hexagon', label: 'Hexagone', icon: '⬡' },
  { value: 'octagon', label: 'Octogone', icon: '🛑' },
  { value: 'diamond', label: 'Losange', icon: '💎' },
] as const;

export const FRAME_ANIMATION_OPTIONS = [
  { value: 'none', label: 'Statique', icon: '⏹️' },
  { value: 'rotate', label: 'Rotation', icon: '🔄' },
  { value: 'pulse', label: 'Pulsation', icon: '💓' },
  { value: 'color-flow', label: 'Flux couleur', icon: '🌈' },
  { value: 'dash-flow', label: 'Tirets animés', icon: '➖' },
  { value: 'glow-pulse', label: 'Halo pulsant', icon: '✨' },
] as const;

export const FRAME_COLOR_MODE_OPTIONS = [
  { value: 'solid', label: 'Couleur unie', icon: '🎨' },
  { value: 'gradient', label: 'Dégradé', icon: '🌅' },
  { value: 'moving-gradient', label: 'Dégradé animé', icon: '🌊' },
  { value: 'rainbow', label: 'Arc-en-ciel', icon: '🌈' },
] as const;

