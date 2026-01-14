// ============================================
// USE UNDO REDO HOOK - Factory V5
// History management for editor actions
// ============================================

'use client';

import { useState, useCallback, useRef } from 'react';

interface UseUndoRedoOptions<T> {
    maxHistory?: number;
}

interface UseUndoRedoReturn<T> {
    state: T;
    setState: (newState: T) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    historyLength: number;
    currentIndex: number;
    reset: (newState: T) => void;
}

export function useUndoRedo<T>(
    initialState: T,
    options: UseUndoRedoOptions<T> = {}
): UseUndoRedoReturn<T> {
    const { maxHistory = 50 } = options;

    // Store history as a ref to avoid re-renders on every change
    const historyRef = useRef<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [, forceUpdate] = useState({});

    const state = historyRef.current[currentIndex];

    const setState = useCallback((newState: T) => {
        // Remove any future states if we're not at the end
        historyRef.current = historyRef.current.slice(0, currentIndex + 1);

        // Add new state
        historyRef.current.push(newState);

        // Trim history if it exceeds max
        if (historyRef.current.length > maxHistory) {
            historyRef.current = historyRef.current.slice(-maxHistory);
        }

        setCurrentIndex(historyRef.current.length - 1);
        forceUpdate({});
    }, [currentIndex, maxHistory]);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            forceUpdate({});
        }
    }, [currentIndex]);

    const redo = useCallback(() => {
        if (currentIndex < historyRef.current.length - 1) {
            setCurrentIndex(currentIndex + 1);
            forceUpdate({});
        }
    }, [currentIndex]);

    const reset = useCallback((newState: T) => {
        historyRef.current = [newState];
        setCurrentIndex(0);
        forceUpdate({});
    }, []);

    return {
        state,
        setState,
        undo,
        redo,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < historyRef.current.length - 1,
        historyLength: historyRef.current.length,
        currentIndex,
        reset,
    };
}

// Keyboard shortcut hook for undo/redo
export function useUndoRedoKeyboard(
    undo: () => void,
    redo: () => void,
    canUndo: boolean,
    canRedo: boolean
) {
    if (typeof window === 'undefined') return;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Check for Ctrl/Cmd + Z (Undo)
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (canUndo) undo();
        }

        // Check for Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y (Redo)
        if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
            e.preventDefault();
            if (canRedo) redo();
        }
    }, [undo, redo, canUndo, canRedo]);

    // This should be called in useEffect in the component
    return handleKeyDown;
}
