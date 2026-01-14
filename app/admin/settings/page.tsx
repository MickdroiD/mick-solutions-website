// ============================================
// ADMIN SETTINGS PAGE - Factory V5
// Configuration globale du site
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HexColorPicker } from 'react-colorful';
import { ArrowLeft, Save, Loader2, Check, Image, Sparkles } from 'lucide-react';

interface SiteConfig {
    id: string;
    tenantId: string;
    nomSite: string;
    slogan: string | null;
    initialesLogo: string | null;
    theme: string;
    couleurPrimaire: string;
    couleurAccent: string;
    couleurBackground: string;
    couleurText: string;
    metaTitre: string | null;
    metaDescription: string | null;
    siteUrl: string | null;
    email: string | null;
    telephone: string | null;
    adresse: string | null;
    lienLinkedin: string | null;
    lienInstagram: string | null;
    lienTwitter: string | null;
    lienYoutube: string | null;
    lienGithub: string | null;
    headerSiteTitle: string | null;
    headerLogoUrl: string | null;
    headerCtaText: string | null;
    headerCtaUrl: string | null;
    showHeaderCta: boolean;
    stickyHeader: boolean;
    copyrightTexte: string | null;
    footerCtaText: string | null;
    footerCtaUrl: string | null;
    showFooterPoweredBy: boolean;
    enableAnimations: boolean;
}

type TabType = 'identity' | 'branding' | 'seo' | 'contact' | 'header' | 'footer' | 'advanced';

export default function SettingsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const tenantId = (session?.user as any)?.tenantId || 'demo-tenant';

    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('identity');
    const [colorPicker, setColorPicker] = useState<string | null>(null);
    const [faviconGenerating, setFaviconGenerating] = useState(false);
    const [faviconResult, setFaviconResult] = useState<{ success: boolean; message: string; files?: string[] } | null>(null);
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        fetchConfig();
    }, [tenantId]);

    const fetchConfig = async () => {
        try {
            const res = await fetch(`/api/config?tenantId=${tenantId}`);
            const data = await res.json();
            setConfig(data);
        } catch (error) {
            console.error('Erreur chargement config:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async () => {
        if (!config) return;
        setSaving(true);
        setSaved(false);

        try {
            await fetch(`/api/config?tenantId=${tenantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (key: keyof SiteConfig, value: any) => {
        if (!config) return;
        setConfig({ ...config, [key]: value });
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} color="#22d3ee" className="animate-spin" />
            </div>
        );
    }

    if (!config) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '2rem', textAlign: 'center' }}>
                Erreur lors du chargement de la configuration
            </div>
        );
    }

    const tabs: { key: TabType; label: string }[] = [
        { key: 'identity', label: '🏷️ Identité' },
        { key: 'branding', label: '🎨 Branding' },
        { key: 'seo', label: '🔍 SEO' },
        { key: 'contact', label: '📞 Contact' },
        { key: 'header', label: '📌 Header' },
        { key: 'footer', label: '🦶 Footer' },
        { key: 'advanced', label: '⚙️ Avancé' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
            {/* Header */}
            <div style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => router.push('/admin')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <ArrowLeft size={20} />
                        Retour
                    </button>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        Configuration du Site
                    </h1>
                </div>
                <button
                    onClick={saveConfig}
                    disabled={saving}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: saved ? '#22c55e' : 'linear-gradient(to right, #22d3ee, #a855f7)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: saving ? 'wait' : 'pointer',
                    }}
                >
                    {saving ? (
                        <><Loader2 size={18} className="animate-spin" /> Sauvegarde...</>
                    ) : saved ? (
                        <><Check size={18} /> Sauvegardé !</>
                    ) : (
                        <><Save size={18} /> Sauvegarder</>
                    )}
                </button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '1rem 2rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                overflowX: 'auto',
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: activeTab === tab.key ? 'rgba(34,211,238,0.2)' : 'transparent',
                            border: activeTab === tab.key ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.5rem',
                            color: activeTab === tab.key ? '#22d3ee' : '#9ca3af',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                {activeTab === 'identity' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#22d3ee', margin: 0 }}>Identité du Site</h2>
                        <Field
                            label="Nom du site"
                            value={config.nomSite}
                            onChange={(v) => updateField('nomSite', v)}
                        />
                        <Field
                            label="Slogan"
                            value={config.slogan || ''}
                            onChange={(v) => updateField('slogan', v)}
                        />
                        <Field
                            label="Initiales Logo"
                            value={config.initialesLogo || ''}
                            onChange={(v) => updateField('initialesLogo', v)}
                            maxLength={3}
                        />
                    </div>
                )}

                {activeTab === 'branding' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#22d3ee', margin: 0 }}>Couleurs & Style</h2>
                        <ColorField
                            label="Couleur Primaire"
                            value={config.couleurPrimaire}
                            onChange={(v) => updateField('couleurPrimaire', v)}
                            isOpen={colorPicker === 'primary'}
                            onToggle={() => setColorPicker(colorPicker === 'primary' ? null : 'primary')}
                        />
                        <ColorField
                            label="Couleur Accent"
                            value={config.couleurAccent}
                            onChange={(v) => updateField('couleurAccent', v)}
                            isOpen={colorPicker === 'accent'}
                            onToggle={() => setColorPicker(colorPicker === 'accent' ? null : 'accent')}
                        />
                        <ColorField
                            label="Couleur Background"
                            value={config.couleurBackground}
                            onChange={(v) => updateField('couleurBackground', v)}
                            isOpen={colorPicker === 'background'}
                            onToggle={() => setColorPicker(colorPicker === 'background' ? null : 'background')}
                        />
                        <ColorField
                            label="Couleur Texte"
                            value={config.couleurText}
                            onChange={(v) => updateField('couleurText', v)}
                            isOpen={colorPicker === 'text'}
                            onToggle={() => setColorPicker(colorPicker === 'text' ? null : 'text')}
                        />
                        <Toggle
                            label="Activer les animations"
                            value={config.enableAnimations}
                            onChange={(v) => updateField('enableAnimations', v)}
                        />
                    </div>
                )}

                {activeTab === 'seo' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#22d3ee', margin: 0 }}>SEO & Métadonnées</h2>
                        <Field
                            label="Titre SEO"
                            value={config.metaTitre || ''}
                            onChange={(v) => updateField('metaTitre', v)}
                        />
                        <TextArea
                            label="Description SEO"
                            value={config.metaDescription || ''}
                            onChange={(v) => updateField('metaDescription', v)}
                        />
                        <Field
                            label="URL du site"
                            value={config.siteUrl || ''}
                            onChange={(v) => updateField('siteUrl', v)}
                            placeholder="https://monsite.ch"
                        />
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#22d3ee', margin: 0 }}>Informations de Contact</h2>
                        <Field
                            label="Email"
                            value={config.email || ''}
                            onChange={(v) => updateField('email', v)}
                            type="email"
                        />
                        <Field
                            label="Téléphone"
                            value={config.telephone || ''}
                            onChange={(v) => updateField('telephone', v)}
                            type="tel"
                        />
                        <TextArea
                            label="Adresse"
                            value={config.adresse || ''}
                            onChange={(v) => updateField('adresse', v)}
                        />
                        <h3 style={{ fontSize: '1rem', color: '#9ca3af', margin: '1rem 0 0' }}>Réseaux Sociaux</h3>
                        <Field
                            label="LinkedIn"
                            value={config.lienLinkedin || ''}
                            onChange={(v) => updateField('lienLinkedin', v)}
                            placeholder="https://linkedin.com/in/..."
                        />
                        <Field
                            label="Instagram"
                            value={config.lienInstagram || ''}
                            onChange={(v) => updateField('lienInstagram', v)}
                            placeholder="https://instagram.com/..."
                        />
                        <Field
                            label="Twitter/X"
                            value={config.lienTwitter || ''}
                            onChange={(v) => updateField('lienTwitter', v)}
                        />
                        <Field
                            label="YouTube"
                            value={config.lienYoutube || ''}
                            onChange={(v) => updateField('lienYoutube', v)}
                        />
                        <Field
                            label="GitHub"
                            value={config.lienGithub || ''}
                            onChange={(v) => updateField('lienGithub', v)}
                        />
                    </div>
                )}

                {activeTab === 'header' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#22d3ee', margin: 0 }}>Configuration Header</h2>
                        <Field
                            label="Titre dans le Header"
                            value={config.headerSiteTitle || ''}
                            onChange={(v) => updateField('headerSiteTitle', v)}
                        />
                        <Field
                            label="URL du Logo Header"
                            value={config.headerLogoUrl || ''}
                            onChange={(v) => updateField('headerLogoUrl', v)}
                            placeholder="/api/assets/mon-logo.png"
                        />
                        <Toggle
                            label="Header sticky (fixé en haut)"
                            value={config.stickyHeader}
                            onChange={(v) => updateField('stickyHeader', v)}
                        />
                        <h3 style={{ fontSize: '1rem', color: '#9ca3af', margin: '1rem 0 0' }}>Bouton CTA</h3>
                        <Toggle
                            label="Afficher le bouton CTA"
                            value={config.showHeaderCta}
                            onChange={(v) => updateField('showHeaderCta', v)}
                        />
                        <Field
                            label="Texte du CTA"
                            value={config.headerCtaText || ''}
                            onChange={(v) => updateField('headerCtaText', v)}
                        />
                        <Field
                            label="URL du CTA"
                            value={config.headerCtaUrl || ''}
                            onChange={(v) => updateField('headerCtaUrl', v)}
                        />
                    </div>
                )}

                {activeTab === 'footer' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#22d3ee', margin: 0 }}>Configuration Footer</h2>
                        <Field
                            label="Texte Copyright"
                            value={config.copyrightTexte || ''}
                            onChange={(v) => updateField('copyrightTexte', v)}
                            placeholder="© 2026 Mon Site. Tous droits réservés."
                        />
                        <Toggle
                            label="Afficher 'Powered by Factory'"
                            value={config.showFooterPoweredBy}
                            onChange={(v) => updateField('showFooterPoweredBy', v)}
                        />
                        <h3 style={{ fontSize: '1rem', color: '#9ca3af', margin: '1rem 0 0' }}>Bouton CTA Footer</h3>
                        <Field
                            label="Texte du CTA"
                            value={config.footerCtaText || ''}
                            onChange={(v) => updateField('footerCtaText', v)}
                        />
                        <Field
                            label="URL du CTA"
                            value={config.footerCtaUrl || ''}
                            onChange={(v) => updateField('footerCtaUrl', v)}
                        />
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#22d3ee', margin: 0 }}>Options Avancées</h2>

                        {/* Favicon Generator */}
                        <div style={{
                            padding: '1.5rem',
                            background: 'rgba(139,92,246,0.1)',
                            border: '1px solid rgba(139,92,246,0.3)',
                            borderRadius: '0.75rem',
                        }}>
                            <h3 style={{ color: '#a855f7', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} />
                                Générateur de Favicon
                            </h3>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0 0 1rem' }}>
                                Génère automatiquement toutes les icônes nécessaires (favicon, apple-touch-icon, etc.) à partir d'une image.
                            </p>

                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="URL de l'image (ex: https://... ou /api/assets/...)"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '0.5rem',
                                        color: '#fff',
                                    }}
                                />
                                <button
                                    onClick={async () => {
                                        if (!logoUrl) return;
                                        setFaviconGenerating(true);
                                        setFaviconResult(null);
                                        try {
                                            const res = await fetch('/api/favicon', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ logoUrl }),
                                            });
                                            const data = await res.json();
                                            setFaviconResult(data);
                                        } catch (err) {
                                            setFaviconResult({ success: false, message: 'Erreur de génération' });
                                        } finally {
                                            setFaviconGenerating(false);
                                        }
                                    }}
                                    disabled={!logoUrl || faviconGenerating}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: faviconGenerating ? '#6b7280' : 'linear-gradient(to right, #a855f7, #ec4899)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontWeight: 600,
                                        cursor: faviconGenerating ? 'wait' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    {faviconGenerating ? (
                                        <><Loader2 size={18} className="animate-spin" /> Génération...</>
                                    ) : (
                                        <><Image size={18} /> Générer</>
                                    )}
                                </button>
                            </div>

                            {faviconResult && (
                                <div style={{
                                    padding: '1rem',
                                    background: faviconResult.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                    borderRadius: '0.5rem',
                                    color: faviconResult.success ? '#22c55e' : '#ef4444',
                                }}>
                                    <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>
                                        {faviconResult.success ? '✅ ' : '❌ '}{faviconResult.message}
                                    </p>
                                    {faviconResult.files && (
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                                            {faviconResult.files.map(f => <li key={f}>{f}</li>)}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// =====================
// Composants UI locaux
// =====================

function Field({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    maxLength,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    maxLength?: number;
}) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '1rem',
                }}
            />
        </div>
    );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                {label}
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '1rem',
                    resize: 'vertical',
                }}
            />
        </div>
    );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#d1d5db' }}>{label}</span>
            <button
                onClick={() => onChange(!value)}
                style={{
                    width: '3rem',
                    height: '1.5rem',
                    borderRadius: '9999px',
                    border: 'none',
                    background: value ? '#22d3ee' : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '0.125rem',
                        left: value ? '1.625rem' : '0.125rem',
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left 0.2s',
                    }}
                />
            </button>
        </div>
    );
}

function ColorField({
    label,
    value,
    onChange,
    isOpen,
    onToggle,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                {label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                    onClick={onToggle}
                    style={{
                        width: '3rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        border: '2px solid rgba(255,255,255,0.2)',
                        background: value,
                        cursor: 'pointer',
                    }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontFamily: 'monospace',
                    }}
                />
            </div>
            {isOpen && (
                <div style={{ marginTop: '0.75rem' }}>
                    <HexColorPicker color={value} onChange={onChange} />
                </div>
            )}
        </div>
    );
}
