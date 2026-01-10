/**
 * ============================================
 * PAGE ZOOM INFINI DÉDIÉE
 * ============================================
 * 
 * Page standalone pour l'expérience Zoom Infini en plein écran.
 * Peut être liée depuis la navigation ou utilisée comme landing page créative.
 * 
 * URL: /zoom
 */

import { Metadata } from 'next';
import InfiniteZoomSection from '@/components/InfiniteZoomSection';
import {
    isFactoryV2Configured,
    getFactoryData,
} from '@/lib/factory-client';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    if (!isFactoryV2Configured()) {
        return { title: 'Zoom Infini' };
    }

    try {
        const factoryData = await getFactoryData('home');
        return {
            title: `Explorez | ${factoryData.global.identity.nomSite}`,
            description: 'Une expérience visuelle immersive - naviguez dans les images avec le scroll',
        };
    } catch {
        return { title: 'Zoom Infini' };
    }
}

export default async function ZoomPage() {
    // Vérifier si Factory V2 est configuré
    if (!isFactoryV2Configured()) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white">Configuration requise</p>
            </div>
        );
    }

    try {
        const factoryData = await getFactoryData('home');

        // Chercher une section infinite-zoom dans les données
        const zoomSection = factoryData.sections.find(s => s.type === 'infinite-zoom');

        // Si une section est configurée, utiliser ses données
        if (zoomSection && zoomSection.type === 'infinite-zoom') {
            const content = zoomSection.content as {
                titre: string;
                sousTitre?: string;
                instructionText?: string;
                layers: Array<{
                    id: string;
                    imageUrl: string;
                    title?: string;
                    description?: string;
                    focalPointX?: number;
                    focalPointY?: number;
                }>;
            };
            const design = zoomSection.design as {
                variant?: 'fullscreen' | 'contained' | 'hero';
                transitionDuration?: number;
                zoomIntensity?: number;
                enableSound?: boolean;
                showIndicators?: boolean;
                showProgress?: boolean;
            };

            return (
                <InfiniteZoomSection
                    layers={content.layers?.map(layer => ({
                        id: layer.id,
                        imageUrl: layer.imageUrl,
                        title: layer.title || undefined,
                        description: layer.description || undefined,
                        focalPointX: layer.focalPointX,
                        focalPointY: layer.focalPointY,
                    })) || []}
                    title={content.titre}
                    subtitle={content.sousTitre || undefined}
                    instructionText={content.instructionText}
                    variant="fullscreen"
                    transitionDuration={design.transitionDuration}
                    zoomIntensity={design.zoomIntensity}
                    enableSound={design.enableSound}
                    showIndicators={design.showIndicators}
                    showProgress={design.showProgress}
                />
            );
        }

        // Sinon, afficher avec les images de démo
        return (
            <InfiniteZoomSection
                layers={[]}
                title={`Explorez ${factoryData.global.identity.nomSite}`}
                subtitle="Une expérience visuelle immersive"
                variant="fullscreen"
            />
        );
    } catch (error) {
        console.error('Zoom page error:', error);
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white">Erreur de chargement</p>
            </div>
        );
    }
}
