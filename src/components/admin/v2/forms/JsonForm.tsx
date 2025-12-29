'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Check, AlertCircle, Save } from 'lucide-react';
import type { Section } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface JsonFormProps {
  section: Section & { _rowId?: number };
  onUpdate: (updates: Partial<Section>) => void;
}

// ============================================
// JSON FORM COMPONENT
// ============================================

function JsonFormComponent({ section, onUpdate }: JsonFormProps) {
  const [contentJson, setContentJson] = useState('');
  const [designJson, setDesignJson] = useState('');
  const [contentError, setContentError] = useState<string | null>(null);
  const [designError, setDesignError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'content' | 'design' | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize JSON strings
  useEffect(() => {
    setContentJson(JSON.stringify(section.content, null, 2));
    setDesignJson(JSON.stringify(section.design, null, 2));
    setHasChanges(false);
  }, [section.content, section.design]);

  // Validate JSON
  const validateJson = useCallback((json: string): { valid: boolean; error?: string; data?: unknown } => {
    try {
      const data = JSON.parse(json);
      return { valid: true, data };
    } catch (e) {
      return { valid: false, error: e instanceof Error ? e.message : 'JSON invalide' };
    }
  }, []);

  // Handle content change
  const handleContentChange = useCallback((value: string) => {
    setContentJson(value);
    const result = validateJson(value);
    setContentError(result.valid ? null : result.error || 'Erreur');
    setHasChanges(true);
  }, [validateJson]);

  // Handle design change
  const handleDesignChange = useCallback((value: string) => {
    setDesignJson(value);
    const result = validateJson(value);
    setDesignError(result.valid ? null : result.error || 'Erreur');
    setHasChanges(true);
  }, [validateJson]);

  // Save changes
  const handleSave = useCallback(() => {
    const contentResult = validateJson(contentJson);
    const designResult = validateJson(designJson);

    if (!contentResult.valid || !designResult.valid) {
      return;
    }

    // Use unknown cast to bypass discriminated union type checking
    onUpdate({
      content: contentResult.data,
      design: designResult.data,
    } as unknown as Partial<Section>);
    
    setHasChanges(false);
  }, [contentJson, designJson, validateJson, onUpdate]);

  // Copy to clipboard
  const handleCopy = useCallback((type: 'content' | 'design') => {
    const text = type === 'content' ? contentJson : designJson;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, [contentJson, designJson]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-amber-400 font-medium">Éditeur JSON avancé</h4>
          <p className="text-amber-300/70 text-sm mt-1">
            Ce formulaire n&apos;a pas encore d&apos;interface dédiée. Vous pouvez éditer le JSON directement.
            <br />
            Type de section : <code className="bg-amber-500/20 px-1 rounded">{section.type}</code>
          </p>
        </div>
      </motion.div>

      {/* Content Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Content</h3>
              <p className="text-slate-400 text-xs">Données et textes de la section</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCopy('content')}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {copied === 'content' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={contentJson}
            onChange={(e) => handleContentChange(e.target.value)}
            rows={12}
            className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white font-mono text-sm focus:outline-none transition-colors ${
              contentError ? 'border-red-500' : 'border-white/10 focus:border-cyan-500'
            }`}
            spellCheck={false}
          />
          {contentError && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {contentError}
            </p>
          )}
        </div>
      </motion.div>

      {/* Design Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-violet-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Design</h3>
              <p className="text-slate-400 text-xs">Style et animations de la section</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCopy('design')}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {copied === 'design' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={designJson}
            onChange={(e) => handleDesignChange(e.target.value)}
            rows={8}
            className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white font-mono text-sm focus:outline-none transition-colors ${
              designError ? 'border-red-500' : 'border-white/10 focus:border-cyan-500'
            }`}
            spellCheck={false}
          />
          {designError && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {designError}
            </p>
          )}
        </div>
      </motion.div>

      {/* Save Button */}
      {hasChanges && !contentError && !designError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4"
        >
          <button
            type="button"
            onClick={handleSave}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Appliquer les modifications JSON
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const JsonForm = memo(JsonFormComponent);

