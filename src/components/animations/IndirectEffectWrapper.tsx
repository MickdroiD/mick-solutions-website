'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useMemo } from 'react';
import { 
  ANIMATION_REGISTRY, 
  INTENSITY_PRESETS, 
  NEON_COLOR_PRESETS,
  type IntensityLevel, 
  type NeonColorPreset 
} from './registry';

// ============================================
// TYPES
// ============================================

export interface IndirectEffectProps {
  children: ReactNode;
  /** Effect type from registry (neon-outline, particle-orbit, ripple, etc.) */
  effect: string;
  /** Primary color (hex, rgb, or preset name) */
  primaryColor?: string | NeonColorPreset;
  /** Secondary color (hex, rgb, or preset name) */
  secondaryColor?: string;
  /** Effect intensity */
  intensity?: IntensityLevel;
  /** Size in pixels */
  size?: number;
  /** Whether effect is active */
  active?: boolean;
  /** Additional className */
  className?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function resolveColor(color: string | NeonColorPreset, isSecondary = false): string {
  if (color in NEON_COLOR_PRESETS) {
    const preset = NEON_COLOR_PRESETS[color as NeonColorPreset];
    return isSecondary ? preset.secondary : preset.primary;
  }
  return color;
}

function getIntensityMultiplier(intensity: IntensityLevel) {
  return INTENSITY_PRESETS[intensity];
}

// ============================================
// INDIVIDUAL EFFECT RENDERERS
// ============================================

function NeonOutlineEffect({ 
  primaryColor, 
  secondaryColor, 
  intensity, 
  size 
}: { 
  primaryColor: string; 
  secondaryColor: string; 
  intensity: IntensityLevel; 
  size: number;
}) {
  const mult = getIntensityMultiplier(intensity);
  const baseGlow = 10 * mult.scale;
  const maxGlow = 25 * mult.scale;
  
  return (
    <motion.div
      className="absolute inset-0 rounded-xl pointer-events-none"
      animate={{
        boxShadow: [
          `0 0 ${baseGlow}px ${primaryColor}, inset 0 0 ${baseGlow / 2}px ${primaryColor}`,
          `0 0 ${maxGlow}px ${primaryColor}, inset 0 0 ${maxGlow / 2}px ${secondaryColor}`,
          `0 0 ${baseGlow}px ${secondaryColor}, inset 0 0 ${baseGlow / 2}px ${primaryColor}`,
          `0 0 ${maxGlow}px ${secondaryColor}, inset 0 0 ${maxGlow / 2}px ${primaryColor}`,
          `0 0 ${baseGlow}px ${primaryColor}, inset 0 0 ${baseGlow / 2}px ${primaryColor}`,
        ],
      }}
      transition={{
        duration: 3 * mult.duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{ width: size, height: size }}
    />
  );
}

function ParticleOrbitEffect({ 
  primaryColor, 
  secondaryColor, 
  intensity, 
  size 
}: { 
  primaryColor: string; 
  secondaryColor: string; 
  intensity: IntensityLevel; 
  size: number;
}) {
  const mult = getIntensityMultiplier(intensity);
  const particleCount = Math.round(6 * mult.scale);
  const orbitRadius = size * 0.6;
  
  const particles = useMemo(() => 
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (360 / particleCount) * i,
      delay: i * 0.3,
      color: i % 2 === 0 ? primaryColor : secondaryColor,
      size: 4 + (i % 3) * 2,
    })), 
    [particleCount, primaryColor, secondaryColor]
  );

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{ rotate: 360 }}
      transition={{
        duration: 8 * mult.duration,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ 
        width: size * 1.5, 
        height: size * 1.5,
        left: -size * 0.25,
        top: -size * 0.25,
      }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            background: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            left: '50%',
            top: '50%',
            marginLeft: -particle.size / 2,
            marginTop: -particle.size / 2,
            transform: `rotate(${particle.angle}deg) translateX(${orbitRadius}px)`,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </motion.div>
  );
}

function RippleEffect({ 
  primaryColor, 
  secondaryColor, 
  intensity, 
  size 
}: { 
  primaryColor: string; 
  secondaryColor: string; 
  intensity: IntensityLevel; 
  size: number;
}) {
  const mult = getIntensityMultiplier(intensity);
  const rippleCount = 3;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        width: size * 2, 
        height: size * 2,
        left: -size / 2,
        top: -size / 2,
      }}
    >
      {Array.from({ length: rippleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${i % 2 === 0 ? primaryColor : secondaryColor}`,
            left: '25%',
            top: '25%',
            width: '50%',
            height: '50%',
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: [0.5, 1.5 * mult.scale, 2 * mult.scale],
            opacity: [0.8, 0.4, 0],
          }}
          transition={{
            duration: 2.5 * mult.duration,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function LightningStrikeEffect({ 
  primaryColor, 
  secondaryColor, 
  intensity, 
  size 
}: { 
  primaryColor: string; 
  secondaryColor: string; 
  intensity: IntensityLevel; 
  size: number;
}) {
  const mult = getIntensityMultiplier(intensity);
  
  const lightningPaths = useMemo(() => [
    // Lightning 1 - Top-right
    { d: 'M15 0 L10 8 L14 8 L8 18', x: size * 0.7, y: -10, rotation: 0 },
    // Lightning 2 - Bottom-left
    { d: 'M15 0 L10 8 L14 8 L8 18', x: -15, y: size * 0.6, rotation: 180 },
    // Lightning 3 - Right
    { d: 'M12 0 L8 6 L11 6 L6 14', x: size + 5, y: size * 0.3, rotation: 90 },
  ], [size]);

  return (
    <svg 
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ width: size * 1.5, height: size * 1.5, left: -size * 0.25, top: -size * 0.25 }}
    >
      {lightningPaths.map((lightning, i) => (
        <motion.g 
          key={i}
          transform={`translate(${lightning.x}, ${lightning.y}) rotate(${lightning.rotation})`}
        >
          <motion.path
            d={lightning.d}
            stroke={i % 2 === 0 ? primaryColor : secondaryColor}
            strokeWidth={2 * mult.scale}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`drop-shadow(0 0 ${4 * mult.scale}px ${primaryColor})`}
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{
              opacity: [0, 1, 1, 0, 0, 0, 1, 0],
              pathLength: [0, 1, 1, 0, 0, 0, 1, 0],
            }}
            transition={{
              duration: 1.5 * mult.duration,
              repeat: Infinity,
              delay: i * 0.4,
              times: [0, 0.1, 0.2, 0.3, 0.5, 0.6, 0.7, 1],
            }}
          />
        </motion.g>
      ))}
    </svg>
  );
}

function AuroraEffect({ 
  primaryColor, 
  secondaryColor, 
  intensity, 
  size 
}: { 
  primaryColor: string; 
  secondaryColor: string; 
  intensity: IntensityLevel; 
  size: number;
}) {
  const mult = getIntensityMultiplier(intensity);
  
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        width: size * 1.5,
        height: size * 1.5,
        left: -size * 0.25,
        top: -size * 0.25,
        filter: `blur(${20 * mult.scale}px)`,
        opacity: 0.5 * mult.scale,
      }}
      animate={{
        background: [
          `radial-gradient(ellipse at 30% 30%, ${primaryColor} 0%, transparent 60%)`,
          `radial-gradient(ellipse at 70% 30%, ${secondaryColor} 0%, transparent 60%)`,
          `radial-gradient(ellipse at 70% 70%, ${primaryColor} 0%, transparent 60%)`,
          `radial-gradient(ellipse at 30% 70%, ${secondaryColor} 0%, transparent 60%)`,
          `radial-gradient(ellipse at 30% 30%, ${primaryColor} 0%, transparent 60%)`,
        ],
      }}
      transition={{
        duration: 6 * mult.duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function IndirectEffectWrapper({
  children,
  effect,
  primaryColor = 'cyan',
  secondaryColor,
  intensity = 'normal',
  size = 48,
  active = true,
  className = '',
}: IndirectEffectProps) {
  // Resolve colors
  const resolvedPrimary = resolveColor(primaryColor);
  const resolvedSecondary = secondaryColor 
    ? resolveColor(secondaryColor) 
    : resolveColor(primaryColor, true);

  // Get effect config from registry
  const effectConfig = ANIMATION_REGISTRY[effect];
  const isValidEffect = effectConfig && effectConfig.effectType === 'indirect';

  if (!active || !isValidEffect) {
    return <div className={className}>{children}</div>;
  }

  // Render appropriate effect
  const renderEffect = () => {
    switch (effect) {
      case 'neon-outline':
        return (
          <NeonOutlineEffect 
            primaryColor={resolvedPrimary}
            secondaryColor={resolvedSecondary}
            intensity={intensity}
            size={size}
          />
        );
      case 'particle-orbit':
        return (
          <ParticleOrbitEffect 
            primaryColor={resolvedPrimary}
            secondaryColor={resolvedSecondary}
            intensity={intensity}
            size={size}
          />
        );
      case 'ripple':
        return (
          <RippleEffect 
            primaryColor={resolvedPrimary}
            secondaryColor={resolvedSecondary}
            intensity={intensity}
            size={size}
          />
        );
      case 'lightning-strike':
        return (
          <LightningStrikeEffect 
            primaryColor={resolvedPrimary}
            secondaryColor={resolvedSecondary}
            intensity={intensity}
            size={size}
          />
        );
      case 'aurora':
        return (
          <AuroraEffect 
            primaryColor={resolvedPrimary}
            secondaryColor={resolvedSecondary}
            intensity={intensity}
            size={size}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Effect layer (behind) */}
      <AnimatePresence>
        {active && (
          <div className="absolute inset-0 z-0">
            {renderEffect()}
          </div>
        )}
      </AnimatePresence>
      
      {/* Content layer (front) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export { 
  NeonOutlineEffect, 
  ParticleOrbitEffect, 
  RippleEffect, 
  LightningStrikeEffect, 
  AuroraEffect 
};

