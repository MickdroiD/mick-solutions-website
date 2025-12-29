'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { GlobalConfig, Section, HeroSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface FactoryV2Data {
  version: 'v2';
  global: GlobalConfig;
  sections: Section[];
  allSections: (Section & { _rowId?: number })[];
}

interface AdminV2ContextValue {
  // Data
  globalConfig: GlobalConfig | null;
  sections: (Section & { _rowId?: number })[];
  allSections: (Section & { _rowId?: number })[];
  isLoading: boolean;
  error: string | null;
  
  // Actions - Global
  updateGlobal: (updates: Partial<GlobalConfig>) => Promise<void>;
  
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
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
      setSections(data.sections);
      setAllSections(data.allSections || data.sections);
      
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
  // REORDER SECTIONS
  // ============================================

  const reorderSections = useCallback(async (orderedIds: number[]) => {
    // Update order for each section
    const updates = orderedIds.map((id, index) => ({
      rowId: id,
      order: index,
    }));
    
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
    
    // API calls (batch would be better but not implemented)
    for (const { rowId, order } of updates) {
      try {
        await fetch('/api/admin/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'section',
            sectionId: rowId,
            data: { order },
          }),
        });
      } catch (err) {
        console.error(`[AdminV2Context] Reorder error for ${rowId}:`, err);
      }
    }
  }, []);

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
    isLoading,
    error,
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

