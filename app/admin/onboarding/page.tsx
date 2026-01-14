// ============================================
// TENANT ONBOARDING WIZARD - Factory V5
// Wizard de création de site multi-étapes
// ============================================

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HexColorPicker } from 'react-colorful';
import { ArrowRight, ArrowLeft, Check, Sparkles, Palette, Layout, Rocket } from 'lucide-react';

type Step = 'identity' | 'branding' | 'template' | 'complete';

interface OnboardingData {
    nomSite: string;
    slogan: string;
    initialesLogo: string;
    couleurPrimaire: string;
    couleurAccent: string;
    template: 'blank' | 'business' | 'portfolio' | 'minimal';
}

const THEME_PRESETS = [
    { name: 'Electric', primary: '#22d3ee', accent: '#a855f7' },
    { name: 'Ocean', primary: '#3b82f6', accent: '#06b6d4' },
    { name: 'Forest', primary: '#22c55e', accent: '#84cc16' },
    { name: 'Sunset', primary: '#f97316', accent: '#ec4899' },
    { name: 'Midnight', primary: '#6366f1', accent: '#8b5cf6' },
    { name: 'Rose', primary: '#ec4899', accent: '#f43f5e' },
];

const TEMPLATES = [
    {
        id: 'blank' as const,
        name: 'Page Vierge',
        description: 'Commencez de zéro avec une section Hero basique',
        icon: '📝',
    },
    {
        id: 'business' as const,
        name: 'Business',
        description: 'Hero + Services + Contact - Parfait pour les entreprises',
        icon: '💼',
    },
    {
        id: 'portfolio' as const,
        name: 'Portfolio',
        description: 'Hero + Galerie + À propos - Idéal pour les créatifs',
        icon: '🎨',
    },
    {
        id: 'minimal' as const,
        name: 'Minimal',
        description: 'Hero simple avec contenu textuel uniquement',
        icon: '✨',
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const tenantId = (session?.user as any)?.tenantId || 'demo-tenant';

    const [currentStep, setCurrentStep] = useState<Step>('identity');
    const [showColorPicker, setShowColorPicker] = useState<'primary' | 'accent' | null>(null);
    const [saving, setSaving] = useState(false);

    const [data, setData] = useState<OnboardingData>({
        nomSite: '',
        slogan: '',
        initialesLogo: '',
        couleurPrimaire: '#22d3ee',
        couleurAccent: '#a855f7',
        template: 'blank',
    });

    const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
        { key: 'identity', label: 'Identité', icon: <Sparkles size={18} /> },
        { key: 'branding', label: 'Branding', icon: <Palette size={18} /> },
        { key: 'template', label: 'Template', icon: <Layout size={18} /> },
        { key: 'complete', label: 'Terminé', icon: <Rocket size={18} /> },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

    const goNext = () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setCurrentStep(steps[nextIndex].key);
        }
    };

    const goBack = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(steps[prevIndex].key);
        }
    };

    const completeOnboarding = async () => {
        setSaving(true);

        try {
            // 1. Sauvegarder la config du site
            await fetch(`/api/config?tenantId=${tenantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nomSite: data.nomSite,
                    slogan: data.slogan,
                    initialesLogo: data.initialesLogo || data.nomSite.substring(0, 2).toUpperCase(),
                    couleurPrimaire: data.couleurPrimaire,
                    couleurAccent: data.couleurAccent,
                }),
            });

            // 2. Créer la page d'accueil
            const pageRes = await fetch('/api/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    name: 'Accueil',
                    slug: 'home',
                    isPublished: true,
                }),
            });
            const page = await pageRes.json();

            // 3. Créer la section Hero selon le template
            const heroConfig = {
                layout: { type: 'single-column', alignment: 'center', verticalAlign: 'center' },
                sizing: { height: 'fullscreen', paddingX: 'lg', paddingY: 'lg' },
                blocks: [
                    {
                        id: 'heading-1',
                        type: 'heading',
                        order: 0,
                        content: { text: data.nomSite || 'Bienvenue', level: 1 },
                        style: { fontSize: '4rem', gradient: true, gradientFrom: data.couleurPrimaire, gradientTo: data.couleurAccent, align: 'center' },
                    },
                    {
                        id: 'text-1',
                        type: 'text',
                        order: 1,
                        content: { text: data.slogan || 'Votre slogan ici' },
                        style: { fontSize: '1.25rem', color: '#9ca3af', align: 'center' },
                    },
                    {
                        id: 'button-1',
                        type: 'button',
                        order: 2,
                        content: { text: 'Découvrir' },
                        style: { variant: 'gradient', size: 'lg', shape: 'rounded' },
                        link: { type: 'section', target: '#services' },
                    },
                ],
                design: {
                    background: { type: 'solid', color: '#0a0a0f' },
                },
            };

            await fetch('/api/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    pageId: page.id,
                    type: 'CUSTOM',
                    name: 'Hero',
                    order: 0,
                    isActive: true,
                    content: heroConfig,
                    design: {},
                }),
            });

            // Passer à l'étape finale
            setCurrentStep('complete');
        } catch (error) {
            console.error('Erreur onboarding:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Progress Bar */}
            <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    {steps.map((step, idx) => (
                        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: idx <= currentStepIndex ? `linear-gradient(to right, ${data.couleurPrimaire}, ${data.couleurAccent})` : 'rgba(255,255,255,0.1)',
                                color: '#fff',
                            }}>
                                {idx < currentStepIndex ? <Check size={18} /> : step.icon}
                            </div>
                            {idx < steps.length - 1 && (
                                <div style={{
                                    flex: 1,
                                    height: '2px',
                                    background: idx < currentStepIndex ? data.couleurPrimaire : 'rgba(255,255,255,0.1)',
                                    marginLeft: '0.5rem',
                                    marginRight: '0.5rem',
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '0 2rem 2rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                {/* Step 1: Identity */}
                {currentStep === 'identity' && (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            🎯 Donnez vie à votre site
                        </h1>
                        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                            Comment s'appelle votre entreprise ou projet ?
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>
                                    Nom du site *
                                </label>
                                <input
                                    type="text"
                                    value={data.nomSite}
                                    onChange={(e) => setData({ ...data, nomSite: e.target.value })}
                                    placeholder="Ex: Mon Super Business"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>
                                    Slogan (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={data.slogan}
                                    onChange={(e) => setData({ ...data, slogan: e.target.value })}
                                    placeholder="Ex: Innovation & Excellence"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>
                                    Initiales pour le logo (2-3 lettres)
                                </label>
                                <input
                                    type="text"
                                    value={data.initialesLogo}
                                    onChange={(e) => setData({ ...data, initialesLogo: e.target.value.toUpperCase().slice(0, 3) })}
                                    placeholder="Ex: MSB"
                                    maxLength={3}
                                    style={{ ...inputStyle, width: '100px' }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Branding */}
                {currentStep === 'branding' && (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            🎨 Choisissez vos couleurs
                        </h1>
                        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                            Sélectionnez un thème ou personnalisez vos couleurs
                        </p>

                        <h3 style={{ color: '#d1d5db', marginBottom: '1rem' }}>Thèmes prédéfinis</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
                            {THEME_PRESETS.map((theme) => (
                                <button
                                    key={theme.name}
                                    onClick={() => setData({ ...data, couleurPrimaire: theme.primary, couleurAccent: theme.accent })}
                                    style={{
                                        padding: '1rem',
                                        background: data.couleurPrimaire === theme.primary ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        border: `2px solid ${data.couleurPrimaire === theme.primary ? theme.primary : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                                        <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: theme.primary }} />
                                        <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: theme.accent }} />
                                    </div>
                                    <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>{theme.name}</span>
                                </button>
                            ))}
                        </div>

                        <h3 style={{ color: '#d1d5db', marginBottom: '1rem' }}>Personnalisé</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                                    Primaire
                                </label>
                                <button
                                    onClick={() => setShowColorPicker(showColorPicker === 'primary' ? null : 'primary')}
                                    style={{
                                        width: '4rem',
                                        height: '3rem',
                                        borderRadius: '0.5rem',
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        background: data.couleurPrimaire,
                                        cursor: 'pointer',
                                    }}
                                />
                                {showColorPicker === 'primary' && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <HexColorPicker color={data.couleurPrimaire} onChange={(c) => setData({ ...data, couleurPrimaire: c })} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                                    Accent
                                </label>
                                <button
                                    onClick={() => setShowColorPicker(showColorPicker === 'accent' ? null : 'accent')}
                                    style={{
                                        width: '4rem',
                                        height: '3rem',
                                        borderRadius: '0.5rem',
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        background: data.couleurAccent,
                                        cursor: 'pointer',
                                    }}
                                />
                                {showColorPicker === 'accent' && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <HexColorPicker color={data.couleurAccent} onChange={(c) => setData({ ...data, couleurAccent: c })} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview */}
                        <div style={{
                            marginTop: '2rem',
                            padding: '1.5rem',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '0.75rem',
                            textAlign: 'center',
                        }}>
                            <h4 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                background: `linear-gradient(to right, ${data.couleurPrimaire}, ${data.couleurAccent})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '0.5rem',
                            }}>
                                {data.nomSite || 'Votre Site'}
                            </h4>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{data.slogan || 'Votre slogan'}</p>
                        </div>
                    </div>
                )}

                {/* Step 3: Template */}
                {currentStep === 'template' && (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            📐 Choisissez un template
                        </h1>
                        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                            Sélectionnez un point de départ pour votre site
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {TEMPLATES.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => setData({ ...data, template: template.id })}
                                    style={{
                                        padding: '1.5rem',
                                        background: data.template === template.id ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.03)',
                                        border: `2px solid ${data.template === template.id ? data.couleurPrimaire : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                    }}
                                >
                                    <span style={{ fontSize: '2rem' }}>{template.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>{template.name}</div>
                                        <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{template.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Complete */}
                {currentStep === 'complete' && (
                    <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                        <div style={{
                            width: '5rem',
                            height: '5rem',
                            borderRadius: '50%',
                            background: `linear-gradient(to right, ${data.couleurPrimaire}, ${data.couleurAccent})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                        }}>
                            <Check size={40} color="#fff" />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            🎉 Félicitations !
                        </h1>
                        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                            Votre site "{data.nomSite}" est prêt à être personnalisé.
                        </p>
                        <button
                            onClick={() => router.push('/admin')}
                            style={{
                                padding: '1rem 2rem',
                                background: `linear-gradient(to right, ${data.couleurPrimaire}, ${data.couleurAccent})`,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                fontSize: '1.125rem',
                                cursor: 'pointer',
                            }}
                        >
                            Aller au Dashboard →
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation */}
            {currentStep !== 'complete' && (
                <div style={{
                    padding: '1.5rem 2rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    maxWidth: '600px',
                    margin: '0 auto',
                    width: '100%',
                }}>
                    <button
                        onClick={goBack}
                        disabled={currentStepIndex === 0}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'transparent',
                            color: currentStepIndex === 0 ? '#4b5563' : '#9ca3af',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '0.5rem',
                            cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </button>
                    <button
                        onClick={currentStep === 'template' ? completeOnboarding : goNext}
                        disabled={(currentStep === 'identity' && !data.nomSite) || saving}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: `linear-gradient(to right, ${data.couleurPrimaire}, ${data.couleurAccent})`,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: (currentStep === 'identity' && !data.nomSite) || saving ? 'not-allowed' : 'pointer',
                            opacity: (currentStep === 'identity' && !data.nomSite) || saving ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        {saving ? 'Création...' : currentStep === 'template' ? 'Créer mon site' : 'Suivant'}
                        <ArrowRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '0.5rem',
    color: '#fff',
    fontSize: '1rem',
};
