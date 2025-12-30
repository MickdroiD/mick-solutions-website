'use client';

import { useEffect } from 'react';

/**
 * PWAProvider - Enregistre le Service Worker pour la PWA
 * Ce composant s'assure que le SW est enregistré côté client
 */
export default function PWAProvider() {
  useEffect(() => {
    // Enregistrer le Service Worker uniquement en production ou si explicitement activé
    if ('serviceWorker' in navigator) {
      // Attendre que la page soit chargée
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ [PWA] Service Worker enregistré:', registration.scope);
            
            // Vérifier les mises à jour
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Nouvelle version disponible
                    console.log('🔄 [PWA] Nouvelle version disponible');
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('❌ [PWA] Erreur enregistrement SW:', error);
          });
      });
    }
  }, []);

  return null;
}

