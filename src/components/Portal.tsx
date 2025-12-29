'use client';

// ============================================
// PORTAL COMPONENT - Render outside DOM hierarchy
// ============================================
// Permet de rendre un modal en dehors du contexte
// d'empilement (transform/overflow) du parent

import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  containerId?: string;
}

export default function Portal({ children, containerId = 'modal-root' }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Chercher ou créer le container dans document.body
    let element = document.getElementById(containerId);
    
    if (!element) {
      element = document.createElement('div');
      element.id = containerId;
      element.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 99999;';
      document.body.appendChild(element);
    }
    
    setContainer(element);
    setMounted(true);

    return () => {
      // Cleanup: ne pas supprimer si d'autres portals l'utilisent
      // Le container persiste pour éviter les flickering
    };
  }, [containerId]);

  if (!mounted || !container) return null;

  return createPortal(
    <div style={{ pointerEvents: 'auto' }}>
      {children}
    </div>,
    container
  );
}

