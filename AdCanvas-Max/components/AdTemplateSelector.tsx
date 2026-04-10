import React, { useState, useMemo } from 'react';
import { AdTemplate } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { cn } from '../src/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { deleteCustomTemplate } from '../src/lib/utils';

interface AdTemplateSelectorProps {
  templates: AdTemplate[];
  selectedTemplates: AdTemplate[];
  onSelectTemplate: (template: AdTemplate) => void;
  onAddTemplate: () => void;
  onTemplateDeleted: (id: string) => void;
}

const CATEGORIES = ['All', 'Studio', 'Lifestyle', 'Room', 'Outdoor', 'Themed', 'Creative'];

// Fisher-Yates shuffle — stable per seed so it doesn't re-order on every render
function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Round-robin interleave across categories so no two similar styles bunch together
function interleaveByCategory(templates: AdTemplate[], seed: number): AdTemplate[] {
  const groupMap = new Map<string, AdTemplate[]>();
  for (const t of templates) {
    const cat = t.category || 'Other';
    if (!groupMap.has(cat)) groupMap.set(cat, []);
    groupMap.get(cat)!.push(t);
  }

  // Shuffle within each category group, then shuffle the group order
  const groups = shuffle(
    Array.from(groupMap.values()).map((g, i) => shuffle(g, seed + i)),
    seed
  );

  const result: AdTemplate[] = [];
  const maxLen = Math.max(...groups.map(g => g.length));
  for (let i = 0; i < maxLen; i++) {
    for (const group of groups) {
      if (i < group.length) result.push(group[i]);
    }
  }
  return result;
}

const AdTemplateSelector: React.FC<AdTemplateSelectorProps> = ({
  templates,
  selectedTemplates,
  onSelectTemplate,
  onAddTemplate,
  onTemplateDeleted,
}) => {
  const [activeCategory, setActiveCategory] = useState('All');

  // Seed from template IDs so it's stable across re-renders but updates when templates change
  const seed = useMemo(
    () => templates.reduce((acc, t) => acc + t.id.charCodeAt(0), 0),
    [templates]
  );

  const filteredTemplates = useMemo(() => {
    if (activeCategory !== 'All') {
      return shuffle(templates.filter(t => t.category === activeCategory), seed);
    }
    return interleaveByCategory(templates, seed);
  }, [templates, activeCategory, seed]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Remove this template?')) {
      deleteCustomTemplate(id);
      onTemplateDeleted(id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#717171]">Prompt Library</h2>
        <button
          onClick={onAddTemplate}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#E8541A]/10 text-[#E8541A] px-3 py-1.5 rounded-lg hover:bg-[#E8541A] hover:text-white transition-all"
        >
          <Plus size={11} />
          Add Template
        </button>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
              activeCategory === category
                ? "bg-[#111111] text-white"
                : "bg-[#f0f0f0] text-[#717171] hover:bg-[#e0e0e0] hover:text-[#333]"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Masonry grid — images only */}
      <div className="overflow-y-auto custom-scrollbar pb-10 flex-1">
        {filteredTemplates.length > 0 ? (
          <div className="columns-2 gap-3">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplates.some(t => t.id === template.id);
              return (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative w-full mb-3 rounded-xl overflow-hidden block transition-all duration-200",
                    isSelected
                      ? "ring-2 ring-[#E8541A] ring-offset-1 scale-[0.98]"
                      : "hover:scale-[1.02] hover:shadow-lg hover:shadow-black/10"
                  )}
                >
                  {template.previewUrl ? (
                    <img
                      src={template.previewUrl}
                      alt={template.name}
                      className="w-full h-auto block"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-[#f0f0f0] flex items-center justify-center text-[#717171] text-xs">
                      No preview
                    </div>
                  )}

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-[#E8541A] rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  {/* Hover overlay with name */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-end">
                    <p className="w-full px-2 py-1.5 text-[10px] font-bold text-white translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-gradient-to-t from-black/60 to-transparent">
                      {template.name}
                    </p>
                  </div>

                  {/* Delete button for custom templates */}
                  {template.isCustom && (
                    <button
                      onClick={(e) => handleDelete(e, template.id)}
                      className="absolute top-2 left-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500 text-[#717171]"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-bold text-[#111111]">No templates in this category</p>
            <button onClick={onAddTemplate} className="text-xs text-[#E8541A] font-bold hover:underline flex items-center gap-1">
              <Plus size={12} /> Add one
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdTemplateSelector;
