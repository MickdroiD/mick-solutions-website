'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ArchitectureDetectorProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ArchitectureDetector - Détecte si Factory V2 est configuré
 * et redirige vers /admin/v2 si c'est le cas.
 * 
 * Usage dans /admin/page.tsx:
 * <ArchitectureDetector>
 *   <LegacyAdminContent />
 * </ArchitectureDetector>
 */
export function ArchitectureDetector({ children, fallback }: ArchitectureDetectorProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isV2, setIsV2] = useState(false);

  useEffect(() => {
    async function checkArchitecture() {
      try {
        // Appel API pour vérifier quelle architecture est utilisée
        const res = await fetch('/api/admin/config', {
          method: 'GET',
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          
          // Si l'API retourne version: 'v2', rediriger vers /admin/v2
          if (data.version === 'v2') {
            setIsV2(true);
            router.replace('/admin/v2');
            return;
          }
        }
      } catch (error) {
        console.error('[ArchitectureDetector] Error:', error);
      } finally {
        setIsChecking(false);
      }
    }

    // Vérifier seulement après authentification (on vérifie si l'URL contient pin ou si on a un cookie)
    checkArchitecture();
  }, [router]);

  // Pendant la vérification, afficher le fallback ou un spinner
  if (isChecking) {
    return (
      <>{fallback || (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-500 border-t-transparent mx-auto mb-4" />
            <p className="text-slate-400">Détection de l&apos;architecture...</p>
          </div>
        </div>
      )}</>
    );
  }

  // Si V2 détecté, ne rien afficher (la redirection est en cours)
  if (isV2) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent mx-auto mb-4" />
          <p className="text-emerald-400">Redirection vers Admin V2...</p>
        </div>
      </div>
    );
  }

  // Sinon, afficher le contenu legacy
  return <>{children}</>;
}

/**
 * Hook pour vérifier l'architecture depuis n'importe quel composant
 */
export function useArchitectureVersion() {
  const [version, setVersion] = useState<'legacy' | 'v2' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/admin/config', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setVersion(data.version === 'v2' ? 'v2' : 'legacy');
        }
      } catch {
        setVersion('unknown');
      } finally {
        setIsLoading(false);
      }
    }
    check();
  }, []);

  return { version, isLoading };
}

