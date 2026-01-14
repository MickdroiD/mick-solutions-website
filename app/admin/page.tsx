'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { verifySession } from '@/features/admin/server/actions';
import SectionEditor from '@/features/admin/components/SectionEditor';
import { createPage, deletePage } from '@/features/admin/server/pages';
import { createSection, deleteSection, updateSection } from '@/features/admin/server/sections';

// Auth Helper
function useAdminAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const isValid = await verifySession();
                setIsAuthenticated(isValid);
            } catch (e) {
                console.error(e);
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    return isAuthenticated;
}

export default function AdminPage() {
    const isAuthenticated = useAdminAuth();
    const router = useRouter();

    // Authentication Gate
    useEffect(() => {
        if (isAuthenticated === false) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, router]);

    // State
    const [pages, setPages] = useState<any[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [activeZone, setActiveZone] = useState<'HEADER' | 'BODY' | 'FOOTER'>('BODY');

    // We keep 'sections' as the master list of everything on the page
    const [sections, setSections] = useState<any[]>([]);

    // editingSection is the one loaded in the right sidebar
    const [editingSection, setEditingSection] = useState<any | null>(null);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Fetch Pages
    const loadPages = async () => {
        try {
            const tenantId = 'demo-tenant';
            const res = await fetch(`/api/pages?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setPages(data);
                if (data.length > 0 && !selectedPageId) setSelectedPageId(data[0].id);
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (isAuthenticated) loadPages();
    }, [isAuthenticated]);

    // Fetch Sections
    const loadSections = async () => {
        if (selectedPageId) {
            try {
                const tenantId = 'demo-tenant';
                // Fetch ALL sections for the page (Body) AND Global sections (Header/Footer for this tenant)
                // Note: API might need adjustment to return global sections if not attached to page. 
                // For V5 architecture, we assume Header/Footer might be attached to Page or we fetch them separately.
                // Simplified: We fetch Page sections. API should return everything.
                const res = await fetch(`/api/sections?tenantId=${tenantId}&pageId=${selectedPageId}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    if (Array.isArray(data)) {
                        // STRICT SORTING: Header -> Body (ordered) -> Footer
                        const headers = data.filter((s: any) => s.type === 'HEADER');
                        const footers = data.filter((s: any) => s.type === 'FOOTER');
                        const body = data.filter((s: any) => s.type !== 'HEADER' && s.type !== 'FOOTER')
                            .sort((a: any, b: any) => a.order - b.order);

                        // Combine in strict visual order
                        const sorted = [...headers, ...body, ...footers];
                        setSections(sorted);

                        // Auto-select logic: Prioritize Body for editing first, but respect semantic structure
                        if (!editingSection) {
                            const firstBody = body.length > 0 ? body[0] : null;
                            const firstHeader = headers.length > 0 ? headers[0] : null;
                            // Default to first body section if exists (most common edit), else Header
                            if (firstBody) setEditingSection(firstBody);
                            else if (firstHeader) setEditingSection(firstHeader);
                        }
                    }
                }
            } catch (e) { console.error(e); }
        } else {
            setSections([]);
        }
    };

    // Load sections when page changes
    useEffect(() => {
        loadSections();
    }, [selectedPageId]);

    // Sync FULL PAGE to Preview when sections change
    useEffect(() => {
        if (iframeRef.current?.contentWindow && sections.length > 0) {
            iframeRef.current.contentWindow.postMessage({
                type: 'PREVIEW_LOAD_PAGE',
                sections: sections
            }, '*');
        }
    }, [sections]);

    // Debounced Save Ref
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedSave = (sectionId: string, content: any) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            console.log("Auto-saving section:", sectionId);
            await updateSection(sectionId, content);
        }, 1000); // 1 second debounce
    };

    // Listen for Preview Events (Focus, Ready)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PREVIEW_READY') {
                console.log("Preview Ready - Syncing Full Page");
                if (sections.length > 0 && iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'PREVIEW_LOAD_PAGE',
                        sections: sections
                    }, '*');
                }
            }
            if (event.data?.type === 'PREVIEW_FOCUS') {
                const secId = event.data.sectionId;
                const target = sections.find(s => s.id === secId);
                if (target) {
                    setEditingSection(target);
                    // Determine Zone
                    if (target.type === 'HEADER') setActiveZone('HEADER');
                    else if (target.type === 'FOOTER') setActiveZone('FOOTER');
                    else setActiveZone('BODY');
                }
            }
            if (event.data?.type === 'PREVIEW_UPDATE_CONTENT') {
                const { sectionId, content } = event.data;
                console.log("Received Content Update from Preview:", sectionId);

                // Update 'sections' master list
                setSections(prev => prev.map(s => s.id === sectionId ? { ...s, content } : s));

                // Update 'editingSection' if it's the one currently selected
                if (editingSection?.id === sectionId) {
                    setEditingSection((prev: any) => ({ ...prev, content }));
                }

                // IMMEDIATE SAVE for DND interactions
                updateSection(sectionId, content).then(res => {
                    if (res.success) console.log("DND Change Saved");
                });
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [sections]);

    // Sync Active Zone -> Editing Section
    useEffect(() => {
        if (!sections.length) return;

        // If we already have an editing section that Matches the active zone, do nothing
        // (This prevents override loops when clicking in preview)
        if (editingSection) {
            const currentType = editingSection.type;
            const mappedZone = currentType === 'HEADER' ? 'HEADER' : currentType === 'FOOTER' ? 'FOOTER' : 'BODY';
            if (mappedZone === activeZone) return;
        }

        // Otherwise, find the first relevant section for this zone
        let target;
        if (activeZone === 'HEADER') {
            target = sections.find(s => s.type === 'HEADER');
        } else if (activeZone === 'FOOTER') {
            target = sections.find(s => s.type === 'FOOTER');
        } else {
            target = sections.find(s => s.type !== 'HEADER' && s.type !== 'FOOTER');
        }

        if (target) {
            setEditingSection(target);
        } else {
            setEditingSection(null); // No section for this zone
        }

    }, [activeZone, sections]);

    // Handlers
    const handleAddPage = async () => {
        const name = prompt("Nom de la page (ex: Accueil) ?");
        if (!name) return;
        const slug = prompt("Slug URL (ex: home, contact, about) ?");
        if (!slug) return;

        const res = await createPage(name, slug);
        if (res.success) {
            await loadPages();
            if (res.page) setSelectedPageId(res.page.id);
        } else {
            alert("Erreur création page");
        }
    };

    // Function to add a block-wrapper section (since user wants "Blocks" not "Sections" visible)
    // We will still create a SECTION under the hood, but transparently.
    const handleAddBlockSection = async (zone: 'HEADER' | 'BODY' | 'FOOTER') => {
        if (!selectedPageId) return;

        let type = 'CUSTOM';
        if (zone === 'HEADER') type = 'HEADER'; // Should typically only be one
        if (zone === 'FOOTER') type = 'FOOTER';

        // Check if Header/Footer already exists?
        // For V5 we allow multiple for flexibility, but usually one.

        // @ts-ignore
        const res = await createSection(selectedPageId, type);
        if (res.success) {
            await loadSections();
            if (res.section) setEditingSection(res.section);
        }
    };

    const handleDeleteSection = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Supprimer cette section ?")) return;
        await deleteSection(id);
        await loadSections();
        if (editingSection?.id === id) setEditingSection(null);
    };

    // Filter displayed sections by Zone
    const zoneSections = sections.filter(s => {
        if (activeZone === 'HEADER') return s.type === 'HEADER';
        if (activeZone === 'FOOTER') return s.type === 'FOOTER';
        return s.type !== 'HEADER' && s.type !== 'FOOTER';
    });

    if (isAuthenticated === null) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#6b7280' }}>Chargement...</div>;
    if (isAuthenticated === false) return null;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr 400px', // Right Sidebar for Editor
            height: '100vh',
            background: '#0a0a0f',
            fontFamily: 'Inter, sans-serif',
            overflow: 'hidden'
        }}>
            {/* LEFT SIDEBAR - NAVIGATION */}
            <div style={{
                background: '#111118',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                color: 'white'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/branding-logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff', lineHeight: '1.1' }}>Console Admin</h1>
                        <div style={{ fontSize: '0.5rem', fontWeight: 700, background: 'linear-gradient(to right, #22d3ee, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>POWERED BY MICK-SOLUTIONS</div>
                    </div>
                </div>

                {/* Pages List */}
                <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.75rem', fontWeight: 600, paddingLeft: '0.5rem' }}>PAGES</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {pages.map(page => (
                            <button
                                key={page.id}
                                onClick={() => setSelectedPageId(page.id)}
                                style={{
                                    textAlign: 'left',
                                    padding: '0.5rem 0.75rem',
                                    background: selectedPageId === page.id ? 'rgba(34,211,238,0.1)' : 'transparent',
                                    borderLeft: selectedPageId === page.id ? '2px solid #22d3ee' : '2px solid transparent',
                                    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                                    borderRadius: '0 0.25rem 0.25rem 0',
                                    color: selectedPageId === page.id ? '#22d3ee' : '#9ca3af',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {page.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Zone Switcher (Bottom Left) */}
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>ZONE D'ÉDITION</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {['HEADER', 'BODY', 'FOOTER'].map(zone => (
                            <button
                                key={zone}
                                onClick={() => setActiveZone(zone as any)}
                                style={{
                                    padding: '0.5rem',
                                    background: activeZone === zone ? '#22d3ee' : 'rgba(255,255,255,0.05)',
                                    color: activeZone === zone ? 'black' : 'white',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {zone === 'BODY' ? 'CONTENU PRINCIPAL' : zone === 'HEADER' ? 'EN-TÊTE' : 'PIED DE PAGE'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CENTER - PREVIEW CANVAS */}
            <div style={{ background: '#050505', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{
                    position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)', padding: '0.5rem 1rem', borderRadius: '2rem',
                    border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', zIndex: 50,
                    display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#888'
                }}>
                    <span style={{ color: '#fff' }}>Page: {pages.find(p => p.id === selectedPageId)?.name}</span>
                    <span>•</span>
                    <span style={{ color: '#22d3ee' }}>Zone: {activeZone}</span>
                </div>

                <div style={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                    <div style={{
                        width: '100%', maxWidth: '1400px', height: '100%',
                        background: 'white', borderRadius: '8px', overflow: 'hidden',
                        boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                    }}>
                        <iframe
                            ref={iframeRef}
                            src="/admin/preview"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="Preview"
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT SIDEBAR - EDITOR */}
            <div style={{ background: '#111118', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {editingSection ? (
                    <SectionEditor
                        key={editingSection.id}
                        initialConfig={editingSection.content}
                        onSave={async (cfg) => {
                            const result = await updateSection(editingSection.id, cfg);
                            if (result.success) {
                                // Update local state
                                const updated = { ...editingSection, content: cfg };
                                setEditingSection(updated);
                                setSections(prev => prev.map(s => s.id === updated.id ? updated : s));
                            }
                        }}
                        onChange={(cfg) => {
                            // Live Preview specific component update
                            if (iframeRef.current?.contentWindow) {
                                iframeRef.current.contentWindow.postMessage({
                                    type: 'PREVIEW_UPDATE',
                                    sectionId: editingSection.id,
                                    sectionType: editingSection.type,
                                    content: cfg
                                }, '*');
                            }

                            // AUTO-SAVE (Debounced)
                            debouncedSave(editingSection.id, cfg);
                        }}
                        onCancel={() => { }} // No cancel, strictly auto-save or explicit save
                    />
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <p>Sélectionnez une zone ou un élément sur l'aperçu pour commencer.</p>
                        {activeZone && (
                            <button
                                onClick={() => handleAddBlockSection(activeZone)}
                                style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#22d3ee', color: '#000', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                {activeZone === 'HEADER' ? 'Créer mon En-tête' : activeZone === 'FOOTER' ? 'Créer mon Pied de page' : 'Ajouter un Bloc de Contenu'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
