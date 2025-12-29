'use client';

import { useState, useCallback, memo, ReactNode } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp, 
  Copy, AlertCircle
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface ListItem {
  id: string;
  [key: string]: unknown;
}

interface ListEditorProps<T extends ListItem> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  renderForm: (
    item: T,
    index: number,
    onChange: (item: T) => void
  ) => ReactNode;
  createItem: () => T;
  label: string;
  addItemLabel?: string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  maxItems?: number;
  minItems?: number;
  allowDuplicate?: boolean;
  confirmDelete?: boolean;
}

// ============================================
// LIST ITEM WRAPPER
// ============================================

interface ListItemWrapperProps<T extends ListItem> {
  item: T;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  renderItem: (item: T, index: number) => ReactNode;
  renderForm: (
    item: T,
    index: number,
    onChange: (item: T) => void
  ) => ReactNode;
  onItemChange: (item: T) => void;
  showDeleteConfirm: boolean;
}

function ListItemWrapper<T extends ListItem>({
  item,
  index,
  isExpanded,
  onToggle,
  onDelete,
  onDuplicate,
  renderItem,
  renderForm,
  onItemChange,
  showDeleteConfirm,
}: ListItemWrapperProps<T>) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDelete = useCallback(() => {
    if (showDeleteConfirm && !confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    onDelete();
  }, [showDeleteConfirm, confirmingDelete, onDelete]);

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden"
    >
      {/* Header (always visible) */}
      <div className="flex items-center gap-2 p-3">
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-white transition-colors">
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Item Preview */}
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 flex items-center gap-3 text-left hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
        >
          <div className="flex-1 min-w-0">
            {renderItem(item, index)}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              title="Dupliquer"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-all ${
              confirmingDelete
                ? 'bg-red-500 text-white'
                : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
            }`}
            title={confirmingDelete ? 'Cliquer pour confirmer' : 'Supprimer'}
          >
            {confirmingDelete ? (
              <AlertCircle className="w-4 h-4 animate-pulse" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-white/5 space-y-4">
              {renderForm(item, index, onItemChange)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

// ============================================
// LIST EDITOR COMPONENT
// ============================================

function ListEditorComponent<T extends ListItem>({
  items,
  onChange,
  renderItem,
  renderForm,
  createItem,
  label,
  addItemLabel = 'Ajouter un élément',
  emptyMessage = 'Aucun élément',
  emptyIcon,
  maxItems,
  minItems = 0,
  allowDuplicate = true,
  confirmDelete = true,
}: ListEditorProps<T>) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ========== HANDLERS ==========
  const handleReorder = useCallback((newItems: T[]) => {
    onChange(newItems);
  }, [onChange]);

  const handleAdd = useCallback(() => {
    const newItem = createItem();
    onChange([...items, newItem]);
    setExpandedId(newItem.id);
  }, [items, onChange, createItem]);

  const handleDelete = useCallback((id: string) => {
    if (items.length <= minItems) return;
    const newItems = items.filter(item => item.id !== id);
    onChange(newItems);
    if (expandedId === id) {
      setExpandedId(null);
    }
  }, [items, onChange, minItems, expandedId]);

  const handleDuplicate = useCallback((item: T) => {
    if (maxItems && items.length >= maxItems) return;
    const newItem = {
      ...item,
      id: `${item.id}_copy_${Date.now()}`,
    };
    const index = items.findIndex(i => i.id === item.id);
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    onChange(newItems);
    setExpandedId(newItem.id);
  }, [items, onChange, maxItems]);

  const handleItemChange = useCallback((index: number, updatedItem: T) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    onChange(newItems);
  }, [items, onChange]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // ========== RENDER ==========
  const canAdd = !maxItems || items.length < maxItems;
  const canDelete = items.length > minItems;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          {label}
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-medium">
            {items.length}
          </span>
        </h3>
        
        {canAdd && (
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {addItemLabel}
          </button>
        )}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-slate-800/30 rounded-xl border-2 border-dashed border-white/10"
        >
          <div className="text-slate-500 mb-3">
            {emptyIcon || <Plus className="w-10 h-10 mx-auto opacity-30" />}
          </div>
          <p className="text-slate-400 mb-4">{emptyMessage}</p>
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 text-sm font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {addItemLabel}
          </button>
        </motion.div>
      ) : (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={handleReorder}
          className="space-y-3"
        >
          <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <ListItemWrapper
                key={item.id}
                item={item}
                index={index}
                isExpanded={expandedId === item.id}
                onToggle={() => toggleExpand(item.id)}
                onDelete={() => canDelete && handleDelete(item.id)}
                onDuplicate={allowDuplicate ? () => handleDuplicate(item) : undefined}
                renderItem={renderItem}
                renderForm={renderForm}
                onItemChange={(updatedItem) => handleItemChange(index, updatedItem)}
                showDeleteConfirm={confirmDelete}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Max items warning */}
      {maxItems && items.length >= maxItems && (
        <p className="text-amber-400 text-sm text-center">
          Nombre maximum d&apos;éléments atteint ({maxItems})
        </p>
      )}
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const ListEditor = memo(ListEditorComponent) as typeof ListEditorComponent;

