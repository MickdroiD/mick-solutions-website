'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Hook pour animer les éléments au scroll.
 * Utilise IntersectionObserver pour détecter quand un élément entre dans le viewport.
 * Les animations sont contrôlées par les CSS variables --anim-duration, --scroll-transform-initial, etc.
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Une fois visible, on arrête d'observer
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return { ref, isVisible };
}

/**
 * Hook pour obtenir les valeurs d'animation depuis les CSS variables.
 * Utile pour Framer Motion ou autres bibliothèques d'animation.
 */
export function useAnimationConfig() {
  const [config, setConfig] = useState({
    duration: 0.3,
    enabled: true,
  });

  useEffect(() => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    
    const durationStr = styles.getPropertyValue('--anim-duration').trim();
    const duration = parseFloat(durationStr) || 0.3;
    
    const enabledStr = styles.getPropertyValue('--anim-enabled').trim();
    const enabled = enabledStr !== '0';

    setConfig({ duration, enabled });
  }, []);

  return config;
}

