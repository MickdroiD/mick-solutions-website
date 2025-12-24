'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';

interface DynamicLogoProps {
  /** Code SVG brut personnalisé (optionnel) */
  svgCode: string | null;
  /** URL de l'image logo fallback */
  logoUrl: string;
  /** Nom du site pour l'attribut alt */
  alt: string;
  /** Largeur en pixels */
  width?: number;
  /** Hauteur en pixels */
  height?: number;
  /** Classes CSS additionnelles */
  className?: string;
  /** Priorité de chargement (true pour le header) */
  priority?: boolean;
}

/**
 * Composant de logo dynamique.
 * Affiche un SVG personnalisé si fourni, sinon utilise l'image standard.
 * Le SVG est sanitisé via DOMPurify pour éviter les attaques XSS.
 */
export default function DynamicLogo({
  svgCode,
  logoUrl,
  alt,
  width = 48,
  height = 48,
  className = '',
  priority = false,
}: DynamicLogoProps) {
  // Sanitiser le SVG pour éviter les attaques XSS
  const sanitizedSvg = useMemo(() => {
    if (!svgCode) return null;
    
    // Configuration stricte pour DOMPurify (SVG uniquement)
    const cleanSvg = DOMPurify.sanitize(svgCode, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ['animate', 'animateTransform', 'animateMotion', 'set'],
      ADD_ATTR: [
        'attributeName', 'begin', 'dur', 'end', 'min', 'max', 
        'restart', 'repeatCount', 'repeatDur', 'fill', 'calcMode',
        'values', 'keyTimes', 'keySplines', 'from', 'to', 'by',
        'type', 'additive', 'accumulate', 'xmlns', 'viewBox',
        'preserveAspectRatio', 'transform-origin'
      ],
    });
    
    return cleanSvg;
  }, [svgCode]);

  // Si on a un SVG personnalisé valide, l'afficher
  if (sanitizedSvg) {
    return (
      <div 
        className={`flex items-center justify-center [&>svg]:h-full [&>svg]:w-auto ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
        aria-label={alt}
        role="img"
      />
    );
  }

  // Sinon, afficher l'image standard
  return (
    <Image
      src={logoUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}

