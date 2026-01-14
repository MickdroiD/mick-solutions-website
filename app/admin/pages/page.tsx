// ============================================
// ADMIN PAGES MANAGEMENT - Factory V5
// CRUD pour les pages du site
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Edit3, Eye, GripVertical, FileText, Loader2 } from 'lucide-react';

interface Page {
    id: string;
    name: string;
    slug: string;
    seoTitle: string | null;
    seoDescription: string | null;
    isPublished: boolean;
    order: number;
    _count?: { sections: number };
}

export default function PagesAdminPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const tenantId = (session?.user as any)?.tenantId || '';

    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', seoTitle: '', seoDescription: '' });

    useEffect(() => {
        fetchPages();
    }, [tenantId]);

    const fetchPages = async () => {
        try {
            const res = await fetch(`/api/pages?tenantId=${tenantId}`);
            const data = await res.json();
            setPages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur chargement pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const createPage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    name: formData.name,
                    slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                    seoTitle: formData.seoTitle || null,
                    seoDescription: formData.seoDescription || null,
                }),
            });
            setFormData({ name: '', slug: '', seoTitle: '', seoDescription: '' });
            setShowCreateForm(false);
            fetchPages();
        } catch (error) {
            console.error('Erreur création page:', error);
        }
    };

    const updatePage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPage) return;

        try {
            await fetch(`/api/pages/${editingPage.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    slug: formData.slug,
                    seoTitle: formData.seoTitle || null,
                    seoDescription: formData.seoDescription || null,
                }),
            });
            setEditingPage(null);
            setFormData({ name: '', slug: '', seoTitle: '', seoDescription: '' });
            fetchPages();
        } catch (error) {
            console.error('Erreur mise à jour page:', error);
        }
    };

    const deletePage = async (id: string) => {
        if (!confirm('Supprimer cette page et toutes ses sections ?')) return;

        try {
            await fetch(`/api/pages/${id}`, { method: 'DELETE' });
            fetchPages();
        } catch (error) {
            console.error('Erreur suppression page:', error);
        }
    };

    const togglePublished = async (page: Page) => {
        try {
            await fetch(`/api/pages/${page.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublished: !page.isPublished }),
            });
            fetchPages();
        } catch (error) {
            console.error('Erreur toggle publication:', error);
        }
    };

    const startEdit = (page: Page) => {
        setEditingPage(page);
        setFormData({
            name: page.name,
            slug: page.slug,
            seoTitle: page.seoTitle || '',
            seoDescription: page.seoDescription || '',
        });
        setShowCreateForm(false);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} color="#22d3ee" className="animate-spin" />
            </div>
        );
    }

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
                        Gestion des Pages
                    </h1>
                </div>
                <button
                    onClick={() => {
                        setShowCreateForm(!showCreateForm);
                        setEditingPage(null);
                        setFormData({ name: '', slug: '', seoTitle: '', seoDescription: '' });
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: showCreateForm ? 'rgba(255,255,255,0.1)' : 'linear-gradient(to right, #22d3ee, #a855f7)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    <Plus size={18} />
                    {showCreateForm ? 'Annuler' : 'Nouvelle Page'}
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                {/* Create/Edit Form */}
                {(showCreateForm || editingPage) && (
                    <form
                        onSubmit={editingPage ? updatePage : createPage}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '1.5rem',
                            borderRadius: '0.75rem',
                            marginBottom: '2rem',
                            border: '1px solid rgba(34,211,238,0.2)',
                        }}
                    >
                        <h3 style={{ color: '#22d3ee', marginTop: 0, marginBottom: '1.5rem' }}>
                            {editingPage ? `Modifier: ${editingPage.name}` : 'Nouvelle Page'}
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                                    Nom de la page *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Ex: À propos"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                                    Slug (URL)
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="ex: a-propos"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                                Titre SEO
                            </label>
                            <input
                                type="text"
                                value={formData.seoTitle}
                                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                                placeholder="Titre pour les moteurs de recherche"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                                Description SEO
                            </label>
                            <textarea
                                value={formData.seoDescription}
                                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                                rows={2}
                                placeholder="Description pour les moteurs de recherche"
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(to right, #22d3ee, #a855f7)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {editingPage ? 'Mettre à jour' : 'Créer la page'}
                            </button>
                            {editingPage && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingPage(null);
                                        setFormData({ name: '', slug: '', seoTitle: '', seoDescription: '' });
                                    }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'transparent',
                                        color: '#9ca3af',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Annuler
                                </button>
                            )}
                        </div>
                    </form>
                )}

                {/* Pages List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pages.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '0.75rem',
                            border: '1px dashed rgba(255,255,255,0.1)',
                        }}>
                            <FileText size={48} color="#4b5563" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#6b7280', margin: 0 }}>
                                Aucune page. Créez votre première page !
                            </p>
                        </div>
                    ) : (
                        pages.map((page) => (
                            <div
                                key={page.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem 1.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '0.75rem',
                                    border: `1px solid ${page.isPublished ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.1)'}`,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <GripVertical size={18} color="#4b5563" style={{ cursor: 'grab' }} />
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, color: '#fff' }}>{page.name}</span>
                                            <span style={{
                                                padding: '0.125rem 0.5rem',
                                                background: page.isPublished ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                                color: page.isPublished ? '#22c55e' : '#ef4444',
                                                fontSize: '0.75rem',
                                                borderRadius: '9999px',
                                            }}>
                                                {page.isPublished ? 'Publié' : 'Brouillon'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                            /{page.slug} • {(page as any)._count?.sections || 0} sections
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {/* Copier le lien */}
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/${page.slug}`);
                                            alert('Lien copié !');
                                        }}
                                        style={{
                                            ...iconButtonStyle,
                                            background: 'rgba(34,211,238,0.1)',
                                            color: '#22d3ee',
                                        }}
                                        title="Copier le lien"
                                    >
                                        🔗
                                    </button>
                                    <button
                                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                                        style={iconButtonStyle}
                                        title="Voir"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => startEdit(page)}
                                        style={iconButtonStyle}
                                        title="Modifier"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => togglePublished(page)}
                                        style={{
                                            ...iconButtonStyle,
                                            background: page.isPublished ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                                            color: page.isPublished ? '#ef4444' : '#22c55e',
                                        }}
                                        title={page.isPublished ? 'Dépublier' : 'Publier'}
                                    >
                                        {page.isPublished ? '🔒' : '🔓'}
                                    </button>
                                    <button
                                        onClick={() => deletePage(page.id)}
                                        style={{ ...iconButtonStyle, color: '#ef4444' }}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '0.5rem',
    color: '#fff',
    fontSize: '1rem',
};

const iconButtonStyle: React.CSSProperties = {
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.375rem',
    color: '#9ca3af',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};
