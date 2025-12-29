'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Users, Mail, Phone, MessageSquare, Calendar,
  ChevronDown, Trash2, RefreshCw, Check, AlertCircle,
  ArrowLeft, Search, Filter
} from 'lucide-react';
import Link from 'next/link';

// ============================================
// TYPES
// ============================================

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  source: string | null;
  createdAt: string | null;
}

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Closed' | 'Lost';

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG: Record<LeadStatus, { color: string; bgColor: string; label: string }> = {
  New: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', label: '🆕 Nouveau' },
  Contacted: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: '📞 Contacté' },
  Qualified: { color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: '✅ Qualifié' },
  Closed: { color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: '🎉 Conclu' },
  Lost: { color: 'text-red-400', bgColor: 'bg-red-500/20', label: '❌ Perdu' },
};

const ALL_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'];

// ============================================
// STATUS DROPDOWN
// ============================================

interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (status: LeadStatus) => void;
  disabled?: boolean;
}

function StatusDropdown({ currentStatus, onStatusChange, disabled }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = STATUS_CONFIG[currentStatus as LeadStatus] || STATUS_CONFIG.New;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${config.bgColor} ${config.color} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
      >
        {config.label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 z-50 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[160px]"
            >
              {ALL_STATUSES.map((status) => {
                const statusConfig = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      onStatusChange(status);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                    {currentStatus === status && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// LEAD ROW COMPONENT
// ============================================

interface LeadRowProps {
  lead: Lead;
  onStatusChange: (leadId: number, status: LeadStatus) => void;
  onDelete: (leadId: number) => void;
  isUpdating: boolean;
}

function LeadRow({ lead, onStatusChange, onDelete, isUpdating }: LeadRowProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-CH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors"
    >
      {/* Main Row */}
      <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
        {/* Name & Email */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">
                {lead.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-semibold truncate">{lead.name}</h3>
              <a
                href={`mailto:${lead.email}`}
                className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                {lead.email}
              </a>
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className="md:w-36">
          {lead.phone ? (
            <a
              href={`tel:${lead.phone}`}
              className="text-slate-300 text-sm hover:text-white flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              {lead.phone}
            </a>
          ) : (
            <span className="text-slate-500 text-sm">-</span>
          )}
        </div>

        {/* Date */}
        <div className="md:w-40 text-slate-400 text-sm flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(lead.createdAt)}
        </div>

        {/* Status */}
        <div className="md:w-40">
          <StatusDropdown
            currentStatus={lead.status}
            onStatusChange={(status) => onStatusChange(lead.id, status)}
            disabled={isUpdating}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {lead.message && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className={`p-2 rounded-lg transition-colors ${expanded ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
              title="Voir le message"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm('Supprimer ce lead ?')) {
                onDelete(lead.id);
              }
            }}
            className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Message */}
      <AnimatePresence>
        {expanded && lead.message && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 px-4 py-3 bg-slate-900/50"
          >
            <p className="text-slate-300 text-sm whitespace-pre-wrap">{lead.message}</p>
            {lead.source && (
              <p className="text-slate-500 text-xs mt-2">Source: {lead.source}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Show notification
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/leads');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Filter leads
  useEffect(() => {
    let filtered = leads;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.phone?.toLowerCase().includes(query) ||
          lead.message?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchQuery, statusFilter]);

  // Update status
  const handleStatusChange = useCallback(async (leadId: number, status: LeadStatus) => {
    setUpdatingIds((prev) => new Set(prev).add(leadId));

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Update failed');
      }

      // Update local state
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
      );

      showNotification('success', 'Statut mis à jour');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Erreur');
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
    }
  }, [showNotification]);

  // Delete lead
  const handleDelete = useCallback(async (leadId: number) => {
    try {
      const response = await fetch(`/api/admin/leads?leadId=${leadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Delete failed');
      }

      setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      showNotification('success', 'Lead supprimé');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Erreur');
    }
  }, [showNotification]);

  // Stats
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'New').length,
    contacted: leads.filter((l) => l.status === 'Contacted').length,
    qualified: leads.filter((l) => l.status === 'Qualified').length,
    closed: leads.filter((l) => l.status === 'Closed').length,
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white" />
            )}
            <span className="text-white font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/v2"
                className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-black rounded-xl p-1.5">
                  <Image src="/admin-logo.svg" width={40} height={40} alt="Logo" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    CRM Lite - Leads
                  </h1>
                  <p className="text-slate-400 text-sm">Gestion des prospects</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchLeads}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <p className="text-slate-400 text-sm">Total</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-sm">Nouveaux</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.new}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-yellow-400 text-sm">Contactés</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.contacted}</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <p className="text-blue-400 text-sm">Qualifiés</p>
            <p className="text-3xl font-bold text-blue-400">{stats.qualified}</p>
          </div>
          <div className="bg-slate-500/10 rounded-xl p-4 border border-slate-500/20">
            <p className="text-slate-400 text-sm">Conclus</p>
            <p className="text-3xl font-bold text-slate-400">{stats.closed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
              className="px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Tous les statuts</option>
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_CONFIG[status].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-500 border-t-transparent mx-auto mb-4" />
            <p className="text-slate-400">Chargement des leads...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Erreur</h2>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchLeads}
              className="px-6 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">
              {leads.length === 0 ? 'Aucun lead' : 'Aucun résultat'}
            </h2>
            <p className="text-slate-400">
              {leads.length === 0
                ? 'Les leads apparaîtront ici après soumission du formulaire de contact.'
                : 'Essayez de modifier vos filtres de recherche.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredLeads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  isUpdating={updatingIds.has(lead.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

