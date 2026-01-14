// ============================================
// SECTION EDIT PAGE - Factory V5
// Page d'édition WYSIWYG d'une section
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ExternalLink } from 'lucide-react';
import SectionEditor from '@/features/admin/components/SectionEditor';
import type { UniversalSectionConfig } from '@/features/sections/types-universal';
import { DEFAULT_UNIVERSAL_CONFIG, DEFAULT_HEADING_BLOCK, DEFAULT_TEXT_BLOCK, DEFAULT_BUTTON_BLOCK } from '@/features/sections/types-universal';

interface PageProps {
    params: Promise<{ id: string }>;
}

// Génère un ID unique
const generateId = () => Math.random().toString(36).substring(2, 10);

// Convertit une section existante (HERO, etc.) en config Universal
function convertToUniversalConfig(section: any): UniversalSectionConfig {
    const baseConfig: UniversalSectionConfig = {
        ...DEFAULT_UNIVERSAL_CONFIG,
        blocks: [],
    };

    // Si c'est déjà CUSTOM avec du contenu, retourner tel quel
    if (section.type === 'CUSTOM' && section.content?.blocks) {
        return section.content as UniversalSectionConfig;
    }

    // Convertir les types connus en blocks
    const content = section.content || {};

    // Ajouter un heading basé sur le titre existant
    if (content.titre || content.title || section.name) {
        baseConfig.blocks.push({
            ...DEFAULT_HEADING_BLOCK,
            id: generateId(),
            order: 0,
            content: {
                text: content.titre || content.title || section.name || 'Titre',
                level: 1,
            },
        } as any);
    }

    // Ajouter le sous-titre ou description
    if (content.sousTitre || content.subtitle || content.description) {
        baseConfig.blocks.push({
            ...DEFAULT_TEXT_BLOCK,
            id: generateId(),
            order: 1,
            content: {
                text: content.sousTitre || content.subtitle || content.description || '',
            },
        } as any);
    }

    // Ajouter un CTA si présent
    if (content.ctaText || content.ctaPrimaire) {
        baseConfig.blocks.push({
            ...DEFAULT_BUTTON_BLOCK,
            id: generateId(),
            order: 2,
            content: {
                text: content.ctaText || content.ctaPrimaire || 'En savoir plus',
            },
            link: {
                type: 'url',
                target: content.ctaUrl || content.ctaLien || '#',
            },
        } as any);
    }

    // Si aucun block ajouté, mettre des defaults
    if (baseConfig.blocks.length === 0) {
        baseConfig.blocks = [
            { ...DEFAULT_HEADING_BLOCK, id: generateId(), order: 0 } as any,
            { ...DEFAULT_TEXT_BLOCK, id: generateId(), order: 1 } as any,
        ];
    }

    return baseConfig;
}

export default function SectionEditPage({ params }: PageProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [sectionId, setSectionId] = useState<string>('');
    const [section, setSection] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const tenantSlug = (session?.user as any)?.tenantSlug || 'demo';

    useEffect(() => {
        params.then(p => {
            setSectionId(p.id);
            fetchSection(p.id);
        });
    }, [params]);

    const fetchSection = async (id: string) => {
        try {
            const res = await fetch(`/api/sections/${id}`, {
                credentials: 'include', // Ensure cookies are sent
            });
            if (res.ok) {
                const data = await res.json();
                setSection(data);
            } else {
                console.error('Failed to fetch section:', res.status);
            }
        } catch (error) {
            console.error('Failed to fetch section:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (config: UniversalSectionConfig) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/sections/${sectionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Ensure cookies are sent
                body: JSON.stringify({
                    content: config,
                    type: 'CUSTOM',
                }),
            });

            if (res.ok) {
                router.push('/admin');
            } else {
                const error = await res.json();
                console.error('Save failed:', res.status, error);
                alert(`Erreur ${res.status}: ${error.error || 'Sauvegarde échouée'}`);
            }
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Erreur de connexion');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin');
    };

    const handlePreview = () => {
        window.open('/', '_blank');
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22d3ee',
            }}>
                Chargement...
            </div>
        );
    }

    if (!section) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
            }}>
                Section non trouvée
            </div>
        );
    }

    // Convertir automatiquement en Universal config
    const initialConfig = convertToUniversalConfig(section);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0f',
            padding: '1rem',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                padding: '0.5rem 0',
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(to right, #22d3ee, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0,
                }}>
                    Éditer: {section.name}
                </h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {saving && (
                        <span style={{ color: '#22d3ee' }}>Sauvegarde...</span>
                    )}
                    <button
                        onClick={handlePreview}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(34,211,238,0.1)',
                            border: '1px solid rgba(34,211,238,0.3)',
                            borderRadius: '0.5rem',
                            color: '#22d3ee',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                        }}
                    >
                        <ExternalLink size={16} />
                        Aperçu
                    </button>
                </div>
            </div>

            {/* Editor */}
            <SectionEditor
                initialConfig={initialConfig}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </div>
    );
}

