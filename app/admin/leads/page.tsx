// ============================================
// ADMIN LEADS PAGE - Factory V5 (Visual Transplant)
// ============================================

'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Download, Trash2, Mail, Phone,
    Calendar, Search, X, Loader2, User
} from 'lucide-react';
import { getLeads, updateLeadStatus, updateLeadNotes, deleteLead } from '@/features/admin/server/leads';

// Types
interface Lead {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    message: string | null;
    source: string | null;
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
    notes: string | null;
    createdAt: string;
    convertedAt: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    NEW: { label: 'Nouveau', color: '#22d3ee', bg: 'rgba(34,211,238,0.15)' },
    CONTACTED: { label: 'Contacté', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    QUALIFIED: { label: 'Qualifié', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    CONVERTED: { label: 'Converti', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    LOST: { label: 'Perdu', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

export default function LeadsPage() {
    const router = useRouter();
    // Using hardcoded demo tenant for visual transplant until Auth provider is fully unified
    const tenantId = 'demo-tenant';

    const [leads, setLeads] = useState<Lead[]>([]);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [notes, setNotes] = useState('');
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        loadData();
    }, [tenantId]);

    const loadData = async () => {
        setLoading(true);
        const res = await getLeads(tenantId);
        if (res.success && res.leads) {
            setLeads(res.leads as any); // Cast for date strings
            setTotal(res.total || 0);
            setStats(res.stats || {});
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (leadId: string, newStatus: string) => {
        startTransition(async () => {
            await updateLeadStatus(leadId, newStatus as any);
            // Optimistic update
            setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus as any } : l));
            if (selectedLead?.id === leadId) {
                setSelectedLead({ ...selectedLead, status: newStatus as any });
            }
            loadData(); // Sync
        });
    };

    const handleUpdateNotes = async (leadId: string) => {
        startTransition(async () => {
            await updateLeadNotes(leadId, notes);
            // Optimistic update
            setLeads(leads.map(l => l.id === leadId ? { ...l, notes } : l));
            if (selectedLead) setSelectedLead({ ...selectedLead, notes });
        });
    };

    const handleDelete = async (leadId: string) => {
        if (!confirm('Supprimer ce lead définitivement ?')) return;
        startTransition(async () => {
            await deleteLead(leadId);
            setLeads(leads.filter(l => l.id !== leadId));
            setSelectedLead(null);
            loadData();
        });
    };

    const filteredLeads = leads.filter((lead) => {
        if (filterStatus && lead.status !== filterStatus) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            lead.email.toLowerCase().includes(q) ||
            (lead.name && lead.name.toLowerCase().includes(q)) ||
            (lead.phone && lead.phone.includes(q))
        );
    });

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('fr-CH', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0f',
            color: '#fff',
            display: 'flex',
            fontFamily: 'system-ui, sans-serif'
        }}>
            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(10, 10, 15, 0.8)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => router.push('/admin')}
                            style={{
                                background: 'transparent', border: 'none', color: '#9ca3af',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                fontSize: '0.875rem'
                            }}
                        >
                            <ArrowLeft size={18} /> Retour
                        </button>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Leads ({total})
                        </h1>
                    </div>
                    <button
                        onClick={() => window.open(`/api/leads/export?tenantId=${tenantId}`, '_blank')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.625rem 1rem',
                            background: 'rgba(34,211,238,0.1)',
                            border: '1px solid #22d3ee',
                            borderRadius: '0.5rem',
                            color: '#22d3ee',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>

                {/* Stats Bar */}
                <div style={{
                    padding: '1rem 2rem',
                    display: 'flex', gap: '0.75rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    overflowX: 'auto'
                }}>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: filterStatus === key ? config.bg : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${filterStatus === key ? config.color : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '9999px',
                                color: filterStatus === key ? config.color : '#9ca3af',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {config.label} ({stats[key] || 0})
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div style={{ padding: '1rem 2rem' }}>
                    <div style={{ position: 'relative', maxWidth: '400px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                color: '#fff',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#22d3ee'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>
                </div>

                {/* Leads List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 2rem 2rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#22d3ee' }}>
                            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto' }} />
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
                            <User size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Aucun lead trouvé</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {filteredLeads.map((lead) => {
                                const statusConfig = STATUS_CONFIG[lead.status];
                                const isSelected = selectedLead?.id === lead.id;
                                return (
                                    <div
                                        key={lead.id}
                                        onClick={() => {
                                            setSelectedLead(lead);
                                            setNotes(lead.notes || '');
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '1rem 1.25rem',
                                            background: isSelected ? 'rgba(34,211,238,0.05)' : 'rgba(255,255,255,0.02)',
                                            borderRadius: '0.75rem',
                                            border: `1px solid ${isSelected ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? 'rgba(34,211,238,0.05)' : 'rgba(255,255,255,0.02)'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '2.5rem', height: '2.5rem',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, fontSize: '0.875rem',
                                                color: '#fff',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                                {(lead.name || lead.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                                                    {lead.name || 'Anonyme'}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {lead.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: statusConfig.bg,
                                                color: statusConfig.color,
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                            }}>
                                                {statusConfig.label}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                {formatDate(lead.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Details Sidebar */}
            {selectedLead && (
                <div style={{
                    width: '400px',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(10, 10, 15, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                    zIndex: 10
                }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Détails</h2>
                        <button onClick={() => setSelectedLead(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        {/* Contact Info */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ color: '#22d3ee', fontSize: '0.75rem', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Contact</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {selectedLead.name && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0', fontSize: '0.9375rem' }}>
                                        <User size={16} color="#64748b" /> {selectedLead.name}
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0', fontSize: '0.9375rem' }}>
                                    <Mail size={16} color="#64748b" />
                                    <a href={`mailto:${selectedLead.email}`} style={{ color: '#22d3ee', textDecoration: 'none' }}>{selectedLead.email}</a>
                                </div>
                                {selectedLead.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0', fontSize: '0.9375rem' }}>
                                        <Phone size={16} color="#64748b" />
                                        <a href={`tel:${selectedLead.phone}`} style={{ color: '#22d3ee', textDecoration: 'none' }}>{selectedLead.phone}</a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Message */}
                        {selectedLead.message && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ color: '#22d3ee', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Message</h3>
                                <p style={{
                                    color: '#cbd5e1', fontSize: '0.9375rem', lineHeight: '1.5',
                                    background: 'rgba(255,255,255,0.03)', padding: '1rem',
                                    borderRadius: '0.5rem', margin: 0,
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    {selectedLead.message}
                                </p>
                            </div>
                        )}

                        {/* Status */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ color: '#22d3ee', fontSize: '0.75rem', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Statut</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleUpdateStatus(selectedLead.id, key)}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            background: selectedLead.status === key ? config.bg : 'transparent',
                                            border: `1px solid ${selectedLead.status === key ? config.color : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: '0.375rem',
                                            color: selectedLead.status === key ? config.color : '#64748b',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {config.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ color: '#22d3ee', fontSize: '0.75rem', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Notes Interne</h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ajouter des notes..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                    fontSize: '0.875rem',
                                    resize: 'vertical',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#22d3ee'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button
                                    onClick={() => handleUpdateNotes(selectedLead.id)}
                                    disabled={isPending}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: '#22d3ee',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        color: '#0f172a',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        opacity: isPending ? 0.7 : 1
                                    }}
                                >
                                    {isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                                </button>
                            </div>
                        </div>

                        {/* Meta */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#22d3ee', fontSize: '0.75rem', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Méta</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                <div><Calendar size={12} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-top' }} />Créé le {formatDate(selectedLead.createdAt)}</div>
                                {selectedLead.source && <div>Source: {selectedLead.source}</div>}
                                {selectedLead.id && <div style={{ opacity: 0.5 }}>ID: {selectedLead.id}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={() => handleDelete(selectedLead.id)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: '0.5rem',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600
                            }}
                        >
                            <Trash2 size={16} /> Supprimer ce lead
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

