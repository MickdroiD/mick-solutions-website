'use client';

import { useState, useCallback, memo, useRef, useEffect } from 'react';

// ============================================
// TYPES
// ============================================

interface LocalInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  hint?: string;
  type?: 'text' | 'url' | 'email' | 'number';
  className?: string;
  disabled?: boolean;
}

interface LocalTextareaProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  hint?: string;
  rows?: number;
  className?: string;
  monospace?: boolean;
}

interface LocalColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  hint?: string;
}

// ============================================
// LOCAL INPUT - 100% ÉTANCHE
// ============================================

/**
 * LocalInput - Input avec état local pour éviter les re-renders globaux
 * 
 * ⚠️ SOLUTION AU PROBLÈME DE FOCUS:
 * - L'état est géré UNIQUEMENT localement pendant la frappe
 * - AUCUNE synchronisation avec le parent sur onChange
 * - Communication avec le parent UNIQUEMENT sur onBlur
 * - Protection contre la re-sync quand l'input est focusé
 */
function LocalInputComponent({
  value: externalValue,
  onChange: externalOnChange,
  label,
  placeholder,
  hint,
  type = 'text',
  className = '',
  disabled = false,
}: LocalInputProps) {
  // État local pour la valeur pendant la frappe
  const [localValue, setLocalValue] = useState(externalValue);
  
  // 🔒 REF CRITIQUE: empêche la sync externe quand on est focusé
  const isFocusedRef = useRef(false);
  
  // Ref pour garder la dernière valeur externe connue
  const lastExternalValueRef = useRef(externalValue);

  // Sync quand la valeur externe change SEULEMENT si pas focusé
  useEffect(() => {
    // Ne sync que si:
    // 1. L'input n'est pas focusé
    // 2. La valeur externe a vraiment changé
    if (!isFocusedRef.current && externalValue !== lastExternalValueRef.current) {
      setLocalValue(externalValue);
      lastExternalValueRef.current = externalValue;
    }
  }, [externalValue]);

  // Handler pour les changements locaux - NE FAIT RIEN D'AUTRE
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    // ❌ JAMAIS d'appel à externalOnChange ici
  }, []);

  // Marquer le focus
  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
  }, []);

  // Sync avec le parent UNIQUEMENT au blur
  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    // Sync seulement si la valeur a changé
    if (localValue !== lastExternalValueRef.current) {
      externalOnChange(localValue);
      lastExternalValueRef.current = localValue;
    }
  }, [localValue, externalOnChange]);

  // Sync aussi sur Enter (optionnel mais pratique)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Déclenche handleBlur
    }
  }, []);

  return (
    <div className="space-y-1">
      <label className="text-white font-medium text-sm">{label}</label>
      {hint && <p className="text-slate-500 text-xs">{hint}</p>}
      <input
        type={type}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      />
    </div>
  );
}

// ============================================
// LOCAL TEXTAREA - 100% ÉTANCHE
// ============================================

function LocalTextareaComponent({
  value: externalValue,
  onChange: externalOnChange,
  label,
  placeholder,
  hint,
  rows = 3,
  className = '',
  monospace = false,
}: LocalTextareaProps) {
  const [localValue, setLocalValue] = useState(externalValue);
  const isFocusedRef = useRef(false);
  const lastExternalValueRef = useRef(externalValue);

  useEffect(() => {
    if (!isFocusedRef.current && externalValue !== lastExternalValueRef.current) {
      setLocalValue(externalValue);
      lastExternalValueRef.current = externalValue;
    }
  }, [externalValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    // ❌ JAMAIS d'appel à externalOnChange ici
  }, []);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    if (localValue !== lastExternalValueRef.current) {
      externalOnChange(localValue);
      lastExternalValueRef.current = localValue;
    }
  }, [localValue, externalOnChange]);

  return (
    <div className="space-y-1">
      <label className="text-white font-medium text-sm">{label}</label>
      {hint && <p className="text-slate-500 text-xs">{hint}</p>}
      <textarea
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-all resize-none ${monospace ? 'font-mono text-sm' : ''} ${className}`}
      />
    </div>
  );
}

// ============================================
// LOCAL COLOR PICKER
// ============================================

function LocalColorPickerComponent({
  value: externalValue,
  onChange: externalOnChange,
  label,
  hint,
}: LocalColorPickerProps) {
  const [localValue, setLocalValue] = useState(externalValue || '#000000');
  const isFocusedRef = useRef(false);
  const lastExternalValueRef = useRef(externalValue || '#000000');

  useEffect(() => {
    const newVal = externalValue || '#000000';
    if (!isFocusedRef.current && newVal !== lastExternalValueRef.current) {
      setLocalValue(newVal);
      lastExternalValueRef.current = newVal;
    }
  }, [externalValue]);

  // Pour le color picker (sélecteur visuel), on peut sync immédiatement
  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    externalOnChange(newValue);
    lastExternalValueRef.current = newValue;
  }, [externalOnChange]);

  // Pour le champ texte, on attend le blur
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleTextFocus = useCallback(() => {
    isFocusedRef.current = true;
  }, []);

  const handleTextBlur = useCallback(() => {
    isFocusedRef.current = false;
    if (localValue !== lastExternalValueRef.current) {
      externalOnChange(localValue);
      lastExternalValueRef.current = localValue;
    }
  }, [localValue, externalOnChange]);

  return (
    <div className="space-y-1">
      <label className="text-white font-medium text-sm">{label}</label>
      {hint && <p className="text-slate-500 text-xs">{hint}</p>}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={localValue}
          onChange={handleColorChange}
          className="w-14 h-14 rounded-xl cursor-pointer border-2 border-white/10"
        />
        <input
          type="text"
          value={localValue}
          onChange={handleTextChange}
          onFocus={handleTextFocus}
          onBlur={handleTextBlur}
          placeholder="#000000"
          className="flex-1 px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500 transition-all"
        />
      </div>
    </div>
  );
}

// ============================================
// LOCAL SLIDER - État local + envoi au relâchement
// ============================================

interface LocalSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  unit?: string;
}

/**
 * LocalSlider - Slider avec état local pour éviter les re-renders globaux
 * 
 * ⚠️ SOLUTION AU PROBLÈME DE SPAM API:
 * - L'état est géré UNIQUEMENT localement pendant le drag
 * - Communication avec le parent UNIQUEMENT sur mouseUp/touchEnd
 * - Affichage temps réel de la valeur sans spam API
 */
function LocalSliderComponent({
  value: externalValue,
  onChange: externalOnChange,
  label,
  min = 0,
  max = 100,
  step = 1,
  hint,
  unit = 'px',
}: LocalSliderProps) {
  const [localValue, setLocalValue] = useState(externalValue);
  const isDraggingRef = useRef(false);
  const lastCommittedRef = useRef(externalValue);

  // Sync avec l'externe SEULEMENT si pas en train de drag
  useEffect(() => {
    if (!isDraggingRef.current && externalValue !== lastCommittedRef.current) {
      setLocalValue(externalValue);
      lastCommittedRef.current = externalValue;
    }
  }, [externalValue]);

  // Pendant le drag - mise à jour locale uniquement
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    isDraggingRef.current = true;
    setLocalValue(Number(e.target.value));
    // ❌ JAMAIS d'appel à externalOnChange pendant le drag
  }, []);

  // Au relâchement - commit vers le parent
  const handleCommit = useCallback(() => {
    isDraggingRef.current = false;
    if (localValue !== lastCommittedRef.current) {
      externalOnChange(localValue);
      lastCommittedRef.current = localValue;
    }
  }, [localValue, externalOnChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-white font-medium text-sm">{label}</label>
        <span className="text-cyan-400 font-mono text-sm">{localValue}{unit}</span>
      </div>
      {hint && <p className="text-slate-500 text-xs">{hint}</p>}
      <div className="flex items-center gap-3">
        <span className="text-slate-500 text-xs w-12">{min}{unit}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <span className="text-slate-500 text-xs w-12 text-right">{max}{unit}</span>
      </div>
    </div>
  );
}

// ============================================
// EXPORTS MÉMORISÉS
// ============================================

export const LocalInput = memo(LocalInputComponent);
export const LocalTextarea = memo(LocalTextareaComponent);
export const LocalColorPicker = memo(LocalColorPickerComponent);
export const LocalSlider = memo(LocalSliderComponent);
