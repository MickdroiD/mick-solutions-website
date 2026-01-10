
import { useState } from 'react';
import { useAdminV2 } from './AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Edit2, ExternalLink,
    Search, FileText, Globe, Save, X
} from 'lucide-react';
import type { FactoryPage } from '@/lib/schemas/factory';

export function PagesManager() {
    const { pages, addPage, updatePage, deletePage, selectedPage, setSelectedPage } = useAdminV2();

    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<FactoryPage>>({
        name: '',
        slug: '',
        seoTitle: '',
        seoDescription: '',
    });

    const resetForm = () => {
        setFormData({ name: '', slug: '', seoTitle: '', seoDescription: '' });
        setIsCreating(false);
        setEditingId(null);
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.slug) return alert('Nom et Slug requis');

        // Simple slugify if slug is empty but name exists? 
        // Usually handled by user input, but better to enforce valid slug.

        await addPage({
            name: formData.name,
            slug: formData.slug,
            seoTitle: formData.seoTitle,
            seoDescription: formData.seoDescription,
        });
        resetForm();
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        await updatePage(editingId, formData);
        resetForm();
    };

    const startEdit = (page: FactoryPage) => {
        setFormData(page);
        setEditingId(page.id);
        setIsCreating(false);
    };

    const handleDelete = async (id: number) => {
        await deletePage(id);
    };

    // Filtered pages
    const filteredPages = pages.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Gestion des Pages</h2>
                    <p className="text-slate-400">Créez des pages pour votre site multi-pages.</p>
                </div>

                {!isCreating && !editingId && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvelle Page
                    </button>
                )}
            </div>

            {/* Editor (Create/Edit) */}
            <AnimatePresence>
                {(isCreating || editingId) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    {isCreating ? <Plus className="w-5 h-5 text-cyan-400" /> : <Edit2 className="w-5 h-5 text-cyan-400" />}
                                    {isCreating ? 'Nouvelle Page' : 'Modifier la Page'}
                                </h3>
                                <button onClick={resetForm} className="p-2 hover:bg-white/5 rounded-lg text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Nom de la page</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => {
                                            const name = e.target.value;
                                            // Auto-slugify if creating
                                            if (isCreating) {
                                                const slug = name.toLowerCase()
                                                    .replace(/[^a-z0-9]+/g, '-')
                                                    .replace(/^-+|-+$/g, '');
                                                setFormData(prev => ({ ...prev, name, slug }));
                                            } else {
                                                setFormData(prev => ({ ...prev, name }));
                                            }
                                        }}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                        placeholder="Ex: À Propos"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Slug URL</label>
                                    <div className="flex">
                                        <span className="flex items-center px-4 bg-slate-700/50 border border-white/10 border-r-0 rounded-l-xl text-slate-500 text-sm">/</span>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-r-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all font-mono text-sm"
                                            placeholder="a-propos"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <h4 className="text-sm font-medium text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> SEO Metadata
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Titre SEO (Meta Title)</label>
                                        <input
                                            type="text"
                                            value={formData.seoTitle || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            placeholder="Titre affiché dans Google"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Description SEO</label>
                                        <textarea
                                            value={formData.seoDescription || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all h-[52px] resize-none"
                                            placeholder="Description courte pour les moteurs de recherche"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button onClick={resetForm} className="px-6 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-medium transition-colors">
                                    Annuler
                                </button>
                                <button
                                    onClick={isCreating ? handleCreate : handleUpdate}
                                    className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isCreating ? 'Créer la Page' : 'Enregistrer'}
                                </button>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pages List */}
            <div className="grid grid-cols-1 gap-3">
                {/* Search */}
                <div className="relative mb-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Rechercher une page..."
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                </div>

                {filteredPages.map(page => (
                    <motion.div
                        layout
                        key={page.id}
                        className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${selectedPage === page.slug
                                ? 'bg-cyan-500/10 border-cyan-500/30'
                                : 'bg-slate-800/30 border-white/5 hover:border-white/10'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${page.slug === 'home' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'
                                }`}>
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    {page.name}
                                    {page.slug === 'home' && (
                                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                            Accueil
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <span className="flex items-center gap-1 font-mono">
                                        <Globe className="w-3 h-3" /> /{page.slug === 'home' ? '' : page.slug}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Switch context button */}
                            <button
                                onClick={() => setSelectedPage(page.slug)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${selectedPage === page.slug
                                        ? 'bg-cyan-500 text-white border-cyan-500'
                                        : 'bg-slate-700/50 text-slate-400 border-transparent hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                {selectedPage === page.slug ? 'Sélectionnée' : 'Sélectionner'}
                            </button>

                            <div className="w-px h-6 bg-white/10 mx-2" />

                            <button
                                onClick={() => startEdit(page)}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                title="Modifier"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>

                            {page.slug !== 'home' && (
                                <button
                                    onClick={() => handleDelete(page.id!)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            <a
                                href={page.slug === 'home' ? '/' : `/${page.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                                title="Voir"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
