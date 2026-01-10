'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { GlobalConfig, Section, HeroSection, FactoryPage } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface FactoryV2Data {
  version: 'v2';
  global: GlobalConfig;
  sections: Section[];
  allSections: (Section & { _rowId?: number })[];
  pages: FactoryPage[]; // 🆕 Pages Data
}

interface AdminV2ContextValue {
  // Data
  globalConfig: GlobalConfig | null;
  sections: (Section & { _rowId?: number })[];
  allSections: (Section & { _rowId?: number })[];
  isLoading: boolean;
  error: string | null;

  // 🔧 NEW: Dernière erreur d'opération (pour affichage toast/notification)
  lastError: string | null;
  clearError: () => void;

  updateGlobal: (updates: Partial<GlobalConfig>) => Promise<void>;

  // Actions - Pages 🆕
  pages: FactoryPage[];
  selectedPage: string; // Slug
  setSelectedPage: (slug: string) => void;
  addPage: (page: Omit<FactoryPage, 'id'>) => Promise<number | null>;
  updatePage: (id: number, updates: Partial<FactoryPage>) => Promise<void>;
  deletePage: (id: number) => Promise<void>;

  // Actions - Sections
  updateSection: (rowId: number, updates: Partial<Section>) => Promise<void>;
  addSection: (section: Omit<Section, 'id'>) => Promise<number | null>;
  deleteSection: (rowId: number) => Promise<void>;
  reorderSections: (orderedIds: number[]) => Promise<void>;
  toggleSectionActive: (rowId: number, isActive: boolean) => Promise<void>;

  // Refetch
  refresh: () => Promise<void>;

  // UI State
  hasUnsavedChanges: boolean;
  saveAll: () => Promise<void>;
  isSaving: boolean;
}

// ============================================
// CONTEXT
// ============================================

const AdminV2Context = createContext<AdminV2ContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface AdminV2ProviderProps {
  children: ReactNode;
}

export function AdminV2Provider({ children }: AdminV2ProviderProps) {
  const router = useRouter();

  // State
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig | null>(null);
  const [sections, setSections] = useState<(Section & { _rowId?: number })[]>([]);
  const [allSections, setAllSections] = useState<(Section & { _rowId?: number })[]>([]);

  // 🆕 Pages State
  const [pages, setPages] = useState<FactoryPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('home'); // Default to home

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 🔧 NEW: État pour la dernière erreur d'opération
  const [lastError, setLastError] = useState<string | null>(null);
  const clearError = useCallback(() => setLastError(null), []);

  // Pending changes queue
  const pendingGlobalChanges = useRef<Partial<GlobalConfig>>({});
  // Use Record<string, unknown> for flexible section updates
  const pendingSectionChanges = useRef<Map<number, Record<string, unknown>>>(new Map());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ============================================
  // FETCH DATA
  // ============================================

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/admin/config', { cache: 'no-store' });

      // Redirect to login if not authenticated
      if (res.status === 401) {
        console.log('[AdminV2] Not authenticated, redirecting to /admin');
        router.push('/admin?redirect=/admin/v2');
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data: FactoryV2Data = await res.json();

      if (data.version !== 'v2') {
        throw new Error('Admin V2 requires Factory V2 architecture');
      }

      setGlobalConfig(data.global);

      // 🆕 Handle Pages
      setPages(data.pages || []); // data.pages needs to be added to API response

      // 🆕 Store ALL sections, but filtering happens in UI or derived state usually.
      // However, current implementation holds `sections` and `allSections` separately?
      // `sections` seems to be the "active views" or something?
      // Actually `data.sections` comes from API.

      // We will override `sections` state to only return sections for SELECTED PAGE.
      // But we can't do it inside fetchData because it depends on state.
      // So we store RAW data in `allSections`.
      setAllSections(data.allSections || data.sections);
      // We don't set `sections` here directly anymore, or we set it to filtered default.

    } catch (err) {
      console.error('[AdminV2Context] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🆕 Filter Sections when Selected Page Changes
  useEffect(() => {
    if (!allSections.length) return;

    // Filter sections for current page
    // Logic: 
    // 1. If section has `page` (string/slug) matching selectedPage
    // 2. Or is Relational (link row) -> Check if Link Array contains Page ID matching selectedPage slug

    const pageObj = pages.find(p => p.slug === selectedPage);
    const pageId = pageObj ? pageObj.id : -1;

    const filtered = allSections.filter(section => {
      // Compatibility with Legacy 'home' assumption if no page field
      if (!section.page && selectedPage === 'home') return true;

      // String match (legacy or simple)
      if (typeof section.page === 'string' && section.page === selectedPage) return true;

      // Relational match (New)
      // Checks if section has a Page link_row matching the selected page ID
      const s = section as typeof section & { Page?: { id: number; value: string }[] | null };
      if (Array.isArray(s.Page) && pageId !== -1) {
        return s.Page.some((link: { id: number }) => link.id === pageId);
      }

      // If none matches
      return false;
    });

    setSections(filtered);
  }, [selectedPage, allSections, pages]);

  // ============================================
  // UPDATE GLOBAL CONFIG (Optimistic + API)
  // ============================================

  const updateGlobal = useCallback(async (updates: Partial<GlobalConfig>) => {
    if (!globalConfig) return;

    // Optimistic UI: Update local state immediately
    setGlobalConfig(prev => {
      if (!prev) return prev;

      // Deep merge
      const merged = { ...prev };

      for (const [key, value] of Object.entries(updates)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          (merged as Record<string, unknown>)[key] = {
            ...(prev as Record<string, unknown>)[key] as object,
            ...value,
          };
        } else {
          (merged as Record<string, unknown>)[key] = value;
        }
      }

      return merged as GlobalConfig;
    });

    // Queue changes
    pendingGlobalChanges.current = {
      ...pendingGlobalChanges.current,
      ...updates,
    };
    setHasUnsavedChanges(true);

    // API call
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'global',
          data: updates,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      // Clear pending on success
      pendingGlobalChanges.current = {};
      setHasUnsavedChanges(pendingSectionChanges.current.size > 0);

    } catch (err) {
      console.error('[AdminV2Context] Update global error:', err);
      // Don't revert optimistic update - let user retry
    }
  }, [globalConfig]);

  // ============================================
  // UPDATE SECTION (Optimistic + API)
  // ============================================

  const updateSection = useCallback(async (rowId: number, updates: Partial<Section>) => {
    // Optimistic UI
    setAllSections(prev =>
      prev.map(s => s._rowId === rowId ? { ...s, ...updates } as Section & { _rowId?: number } : s)
    );
    setSections(prev =>
      prev.map(s => s._rowId === rowId ? { ...s, ...updates } as Section & { _rowId?: number } : s)
    );

    // Queue changes
    const existing = pendingSectionChanges.current.get(rowId) || {};
    pendingSectionChanges.current.set(rowId, { ...existing, ...updates });
    setHasUnsavedChanges(true);

    // API call
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          sectionId: rowId,
          data: updates,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      // Clear pending on success
      pendingSectionChanges.current.delete(rowId);
      setHasUnsavedChanges(
        Object.keys(pendingGlobalChanges.current).length > 0 ||
        pendingSectionChanges.current.size > 0
      );

    } catch (err) {
      console.error('[AdminV2Context] Update section error:', err);
    }
  }, []);

  // ============================================
  // PAGES CRUD 🆕
  // ============================================

  const addPage = useCallback(async (page: Omit<FactoryPage, 'id'>) => {
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });
      if (!res.ok) throw new Error('Failed to create page');
      await fetchData(); // Refresh everything
      return (await res.json()).id;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [fetchData]);

  const updatePage = useCallback(async (id: number, updates: Partial<FactoryPage>) => {
    // Optimistic
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (e) {
      console.error(e);
      await fetchData(); // Revert
    }
  }, [fetchData]);

  const deletePage = useCallback(async (id: number) => {
    if (confirm('Are you sure? This will orphan sections.')) {
      // Optimistic
      setPages(prev => prev.filter(p => p.id !== id));
      try {
        await fetch(`/api/admin/pages?id=${id}`, { method: 'DELETE' });
        if (selectedPage === pages.find(p => p.id === id)?.slug) {
          setSelectedPage('home');
        }
      } catch (e) { console.error(e); await fetchData(); }
    }
  }, [fetchData, selectedPage, pages]);

  // ============================================
  // ADD SECTION
  // ============================================

  const addSection = useCallback(async (section: Omit<Section, 'id'>): Promise<number | null> => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          data: section,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur création section');
      }

      const { id } = await res.json();

      // Refresh to get new section
      await fetchData();

      return id;
    } catch (err) {
      console.error('[AdminV2Context] Add section error:', err);
      return null;
    }
  }, [fetchData]);

  // ============================================
  // DELETE SECTION
  // ============================================

  const deleteSection = useCallback(async (rowId: number) => {
    // Optimistic UI
    setAllSections(prev => prev.filter(s => s._rowId !== rowId));
    setSections(prev => prev.filter(s => s._rowId !== rowId));

    try {
      const res = await fetch(`/api/admin/config?sectionId=${rowId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Erreur suppression');
      }
    } catch (err) {
      console.error('[AdminV2Context] Delete section error:', err);
      // Revert
      await fetchData();
    }
  }, [fetchData]);

  // ============================================
  // TOGGLE SECTION ACTIVE
  // ============================================

  const toggleSectionActive = useCallback(async (rowId: number, isActive: boolean) => {
    await updateSection(rowId, { isActive });
  }, [updateSection]);

  // ============================================
  // REORDER SECTIONS (with rollback)
  // ============================================

  const reorderSections = useCallback(async (orderedIds: number[]) => {
    // Update order for each section
    const updates = orderedIds.map((id, index) => ({
      rowId: id,
      order: index,
    }));

    // 🔧 FIX: Sauvegarder l'état original pour rollback
    const originalSections = [...allSections];

    // Optimistic UI
    setAllSections(prev => {
      const copy = [...prev];
      for (const { rowId, order } of updates) {
        const section = copy.find(s => s._rowId === rowId);
        if (section) {
          section.order = order;
        }
      }
      return copy.sort((a, b) => a.order - b.order);
    });

    // 🔧 FIX: Tracker les erreurs et rollback si nécessaire
    const errors: string[] = [];

    for (const { rowId, order } of updates) {
      try {
        const res = await fetch('/api/admin/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'section',
            sectionId: rowId,
            data: { order },
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          errors.push(`Section ${rowId}: ${errorData.error || res.status}`);
        }
      } catch (err) {
        console.error(`[AdminV2Context] Reorder error for ${rowId}:`, err);
        errors.push(`Section ${rowId}: ${err instanceof Error ? err.message : 'Erreur réseau'}`);
      }
    }

    // 🔧 FIX: Si des erreurs, rollback + notification
    if (errors.length > 0) {
      console.error('[AdminV2Context] Reorder failed, rolling back:', errors);
      setAllSections(originalSections);
      setSections(originalSections.filter(s => s.isActive));
      setLastError(`Erreur de réorganisation: ${errors[0]}${errors.length > 1 ? ` (+${errors.length - 1} autres)` : ''}`);
    }
  }, [allSections]);

  // ============================================
  // SAVE ALL (Batch pending changes)
  // ============================================

  const saveAll = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);

    try {
      // Save global if pending
      if (Object.keys(pendingGlobalChanges.current).length > 0) {
        await fetch('/api/admin/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'global',
            data: pendingGlobalChanges.current,
          }),
        });
        pendingGlobalChanges.current = {};
      }

      // Save sections if pending
      for (const [rowId, changes] of Array.from(pendingSectionChanges.current)) {
        await fetch('/api/admin/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'section',
            sectionId: rowId,
            data: changes,
          }),
        });
      }
      pendingSectionChanges.current.clear();

      setHasUnsavedChanges(false);

    } catch (err) {
      console.error('[AdminV2Context] Save all error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AdminV2ContextValue = {
    globalConfig,
    sections,
    allSections,
    pages, // 🆕
    selectedPage, // 🆕
    setSelectedPage, // 🆕
    addPage, // 🆕
    updatePage, // 🆕
    deletePage, // 🆕
    isLoading,
    error,
    lastError,
    clearError,
    updateGlobal,
    updateSection,
    addSection,
    deleteSection,
    reorderSections,
    toggleSectionActive,
    refresh: fetchData,
    hasUnsavedChanges,
    saveAll,
    isSaving,
  };

  return (
    <AdminV2Context.Provider value={value}>
      {children}
    </AdminV2Context.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAdminV2() {
  const context = useContext(AdminV2Context);
  if (!context) {
    throw new Error('useAdminV2 must be used within AdminV2Provider');
  }
  return context;
}

// ============================================
// TYPE HELPERS
// ============================================

export function isHeroSection(section: Section): section is HeroSection {
  return section.type === 'hero';
}

