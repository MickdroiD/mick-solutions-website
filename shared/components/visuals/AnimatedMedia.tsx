'use client';

import { motion, type Transition, type TargetAndTransition } from 'framer-motion';
// import Image from 'next/image'; // Generic img for now or standard next/image
import type { CSSProperties, ReactNode } from 'react';

// === PATHS ADJUSTMENTS FOR V5 ===
import TechHUDWrapper from './tech-hud/TechHUDWrapper';
import {
    getIndirectEffectStyles,
    getFrameStyles,
    getFrameAnimationClass,
    resolveColor,
} from '@/features/sections/effects-renderer';

// ============================================
// V2 EFFECT CONFIG INTERFACE
// ============================================

export interface V2EffectConfig {
    logoDirectEffect?: string | null;
    logoIndirectEffect?: string | null;
    logoFrameShape?: string | null;
    logoFrameAnimation?: string | null;
    logoFrameColor?: string | null;
    logoFrameThickness?: number | null;
    animationSpeed?: 'slow' | 'normal' | 'fast' | string | null;
    animationIntensity?: 'subtle' | 'normal' | 'strong' | 'intense' | string | null;
    effectPrimaryColor?: string | null;
    effectSecondaryColor?: string | null;
    logoAnimation?: string | null;
    [key: string]: unknown;
}

// ============================================
// TYPES (Legacy + V2)
// ============================================

export interface AnimatedMediaProps {
    svgCode?: string | null;
    imageUrl?: string | null;
    effectConfig?: V2EffectConfig | null;
    // Legacy
    animationType?: string | null;
    primaryColor?: string;
    accentColor?: string;
    showElectricEffect?: boolean;
    size?: number | string | null;
    alt?: string;
    className?: string;
    fallback?: ReactNode;
}

interface AnimationConfig {
    animate: TargetAndTransition;
    transition: Transition;
    style?: CSSProperties;
    className?: string;
}

// ============================================
// V2 DEFAULT VALUES
// ============================================

const V2_DEFAULTS = {
    logoDirectEffect: 'none',
    logoIndirectEffect: 'none',
    logoFrameShape: 'none',
    logoFrameAnimation: 'none',
    logoFrameColor: 'cyan',
    logoFrameThickness: 2,
    animationSpeed: 'normal',
    animationIntensity: 'normal',
    effectPrimaryColor: 'cyan',
    effectSecondaryColor: 'purple',
};

// ============================================
// SPEED & INTENSITY MULTIPLIERS
// ============================================

const SPEED_MULTIPLIERS: Record<string, number> = {
    'slow': 2,
    'normal': 1,
    'fast': 0.5,
};

const INTENSITY_MULTIPLIERS: Record<string, number> = {
    'subtle': 0.5,
    'normal': 1,
    'strong': 1.5,
    'intense': 2,
};

// ============================================
// NORMALIZATION
// ============================================

function normalizeAnimationType(raw: string | null | undefined): string {
    if (!raw) return 'none';
    // Simplified normalization for V5 transplant
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleaned.includes('techhud') || cleaned.includes('hud')) return 'tech_hud';
    if (cleaned.includes('electric') || cleaned.includes('lightning')) return 'electric';
    if (cleaned.includes('spin')) return 'spin';
    if (cleaned.includes('pulse')) return 'pulse';
    return cleaned || 'none';
}

// ============================================
// V2 ANIMATION CONFIG GENERATOR
// ============================================

function getV2AnimationConfig(
    directEffect: string,
    speed: string,
    intensity: string
): AnimationConfig {
    const speedMult = SPEED_MULTIPLIERS[speed] || 1;
    const intensityMult = INTENSITY_MULTIPLIERS[intensity] || 1;

    switch (directEffect) {
        case 'float':
            return {
                animate: { y: [0, -10 * intensityMult, 0] },
                transition: { duration: 3 * speedMult, repeat: Infinity, ease: 'easeInOut' },
                className: '',
            };
        case 'pulse':
            return {
                animate: { scale: [1, 1 + (0.08 * intensityMult), 1] },
                transition: { duration: 2 * speedMult, repeat: Infinity },
                className: 'animate-pulse-fast',
            };
        case 'spin':
        case 'rotation':
            return {
                animate: { rotate: 360 },
                transition: { duration: 8 * speedMult, repeat: Infinity, ease: 'linear' },
                className: 'animate-spin-slow',
            };
        case 'electric':
            // Electric handled by separate component usually, but here we can add shake
            return {
                animate: { x: [-1, 1, -1] },
                transition: { duration: 0.2, repeat: Infinity },
                style: {
                    filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.6))',
                },
                className: 'animate-electric-flicker',
            };
        default:
            return { animate: {}, transition: {} };
    }
}

// ============================================
// V2 FRAME WRAPPER COMPONENT
// ============================================

interface V2FrameProps {
    children: React.ReactNode;
    config: V2EffectConfig;
    size: number;
}

function V2Frame({ children, config, size }: V2FrameProps) {
    const shape = config.logoFrameShape || V2_DEFAULTS.logoFrameShape;
    const animation = config.logoFrameAnimation || V2_DEFAULTS.logoFrameAnimation;
    const color = config.logoFrameColor || config.effectPrimaryColor || V2_DEFAULTS.logoFrameColor;
    const thickness = config.logoFrameThickness || V2_DEFAULTS.logoFrameThickness;
    const frameStyles = getFrameStyles(shape || undefined, color || undefined, thickness || undefined);
    const frameAnimClass = getFrameAnimationClass(animation || undefined);

    if (shape === 'none') {
        return (
            <div style={{ width: `${size}px`, height: `${size}px` }} className="relative">
                {children}
            </div>
        );
    }

    return (
        <div
            className={`relative ${frameAnimClass}`}
            style={{
                width: '100%',
                maxWidth: `${size}px`,
                aspectRatio: '1 / 1',
                flexShrink: 0,
                ...frameStyles,
                borderColor: resolveColor(color, '#22d3ee'),
            }}
        >
            {children}
        </div>
    );
}

// ============================================
// V2 ELECTRIC EFFECT COMPONENT
// ============================================

interface V2ElectricEffectProps { config: V2EffectConfig }

function V2ElectricEffect({ config }: V2ElectricEffectProps) {
    const primaryColor = resolveColor(config.effectPrimaryColor || undefined, '#22d3ee');
    const secondaryColor = resolveColor(config.effectSecondaryColor || undefined, '#a78bfa');

    return (
        <motion.div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{ border: `2px solid ${primaryColor}`, opacity: 0.5 }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
        />
    );
}


// ============================================
// MAIN COMPONENT
// ============================================

export default function AnimatedMedia({
    svgCode,
    imageUrl,
    effectConfig,
    animationType,
    primaryColor,
    accentColor,
    showElectricEffect = false,
    size = 200,
    alt = 'Logo',
    className = '',
    fallback,
}: AnimatedMediaProps) {

    const config: V2EffectConfig = {
        ...V2_DEFAULTS,
        ...(effectConfig || {}),
        ...(animationType ? { logoAnimation: animationType } : {}),
        ...(primaryColor ? { effectPrimaryColor: primaryColor } : {}),
    };

    const legacyAnimation = config.logoAnimation || animationType;
    const normalizedAnimation = normalizeAnimationType(legacyAnimation);
    const directEffect = config.logoDirectEffect !== 'none' ? config.logoDirectEffect : normalizedAnimation;

    const isElectric = directEffect === 'electric' || showElectricEffect;
    const hasFrame = config.logoFrameShape && config.logoFrameShape !== 'none';
    const numericSize = typeof size === 'string' ? parseInt(size, 10) || 200 : size || 200;

    const hasContent = Boolean(svgCode || imageUrl || fallback);
    if (!hasContent) return null;

    const animConfig = getV2AnimationConfig(directEffect || 'none', (config.animationSpeed as string) || 'normal', (config.animationIntensity as string) || 'normal');
    const indirectStyles = getIndirectEffectStyles(config);

    const renderContent = () => {
        if (svgCode) {
            return <div className="w-full h-full object-contain" style={indirectStyles} dangerouslySetInnerHTML={{ __html: svgCode }} />;
        } else if (imageUrl) {
            return <img src={imageUrl} alt={alt} className="w-full h-full object-contain" style={indirectStyles} />;
        }
        return <div className="w-full h-full flex items-center justify-center font-bold">{fallback}</div>;
    };

    if (directEffect === 'tech_hud') {
        return (
            <div style={{ width: numericSize, height: numericSize }} className={`relative ${className}`}>
                <TechHUDWrapper active={true}>
                    <div className="w-full h-full flex items-center justify-center p-4">
                        {renderContent()}
                    </div>
                </TechHUDWrapper>
            </div>
        );
    }

    const coreContent = (
        <>
            {isElectric && <V2ElectricEffect config={config} />}
            <motion.div
                className={`relative z-10 w-full h-full flex items-center justify-center ${animConfig.className || ''}`}
                animate={animConfig.animate}
                transition={animConfig.transition}
                style={animConfig.style}
            >
                {renderContent()}
            </motion.div>
        </>
    );

    if (hasFrame) {
        return (
            <div style={{ width: numericSize, height: numericSize }} className={`relative ${className}`}>
                <V2Frame config={config} size={numericSize}>
                    {coreContent}
                </V2Frame>
            </div>
        );
    }

    return (
        <div style={{ width: numericSize, height: numericSize }} className={`relative ${className}`}>
            {coreContent}
        </div>
    );
}
