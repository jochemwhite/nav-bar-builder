
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { NestedMenuItem } from '../types';
import { 
  GripVertical, ChevronDown, Edit3, Trash2, Link, Type, Layout, Box, 
  Settings, X, Check, ExternalLink
} from 'lucide-react';
import { AVAILABLE_ICONS } from '../constants';
import * as LucideIcons from 'lucide-react';

interface SortableTreeItemProps {
  item: NestedMenuItem;
  depth: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: Partial<NestedMenuItem>) => void;
}

export const SortableTreeItem: React.FC<SortableTreeItemProps> = ({ 
  item, 
  depth, 
  onRemove, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // Default expanded for visual clarity in builder

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef
  } = useSortable({ id: item.id, data: { depth, isContainer: !!item.children } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const IconComponent = item.icon && (LucideIcons as any)[item.icon] 
    ? (LucideIcons as any)[item.icon] 
    : (item.type === 'dropdown' ? Box : (item.type === 'mega-menu' ? Layout : (item.type === 'divider' ? Type : Link)));

  // If divider, render simpler view
  if (item.type === 'divider') {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="relative group my-2"
      >
        <div className="flex items-center gap-2 p-2 bg-slate-50 border border-dashed border-slate-300 rounded text-slate-400">
           <div ref={setActivatorNodeRef} {...attributes} {...listeners} className="cursor-grab hover:text-slate-600">
             <GripVertical size={14} />
           </div>
           <span className="text-xs uppercase font-medium tracking-wider">Divider</span>
           <button onClick={() => onRemove(item.id)} className="ml-auto hover:text-red-500"><X size={14}/></button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`
        relative flex flex-col transition-all
        ${depth === 0 ? 'h-full justify-start' : 'w-full mb-2'}
      `}
    >
      {/* Item Card */}
      <div className={`
        group relative flex items-center gap-2 p-2 border rounded-md shadow-sm transition-all
        ${depth === 0 ? 'bg-white border-slate-200 min-w-[200px]' : 'bg-white border-slate-200'}
        ${isEditing ? 'ring-2 ring-blue-500 border-transparent z-20' : 'hover:border-blue-300'}
      `}>
        {/* Drag Handle */}
        <div 
          ref={setActivatorNodeRef}
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1"
        >
          <GripVertical size={16} />
        </div>

        {/* Content View */}
        {!isEditing ? (
          <>
            <div className={`p-1.5 rounded ${depth === 0 ? 'bg-slate-100' : 'bg-slate-50'} text-slate-600`}>
              <IconComponent size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-slate-700 truncate">{item.label}</div>
              {item.url && <div className="text-[10px] text-slate-400 truncate font-mono">{item.url}</div>}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                 onClick={() => setIsEditing(true)} 
                 className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                 title="Edit Properties"
               >
                 <Edit3 size={14} />
               </button>
               <button 
                 onClick={() => onRemove(item.id)}
                 className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                 title="Remove"
               >
                 <Trash2 size={14} />
               </button>
            </div>

            {/* Expand/Collapse Toggle for Children */}
            {(item.children.length > 0 || item.type === 'dropdown' || item.type === 'mega-menu') && (
               <button 
                 onClick={() => setIsExpanded(!isExpanded)}
                 className={`ml-1 p-0.5 rounded-full hover:bg-slate-100 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
               >
                 <ChevronDown size={14} className="text-slate-400" />
               </button>
            )}
          </>
        ) : (
          /* Inline Editing Form */
          <div className="flex-1 min-w-0 p-1">
             <form onSubmit={handleSave} className="space-y-2">
                <input 
                  autoFocus
                  className="w-full text-sm font-medium border-b border-blue-200 focus:outline-none focus:border-blue-500 px-1 py-0.5"
                  value={item.label}
                  onChange={(e) => onUpdate(item.id, { label: e.target.value })}
                  placeholder="Label"
                />
                <input 
                   className="w-full text-xs text-slate-500 font-mono border-b border-slate-200 focus:outline-none focus:border-blue-500 px-1 py-0.5"
                   value={item.url || ''}
                   onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                   placeholder="URL"
                />
                <div className="flex items-center gap-2 pt-1">
                   <select 
                     className="text-xs border rounded p-1"
                     value={item.target || '_self'}
                     onChange={(e) => onUpdate(item.id, { target: e.target.value as any })}
                   >
                     <option value="_self">Same Tab</option>
                     <option value="_blank">New Tab</option>
                   </select>
                   <button type="submit" className="ml-auto p-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                     <Check size={12} />
                   </button>
                </div>
             </form>
          </div>
        )}
      </div>

      {/* Children Container - Vertical List */}
      <div 
         className={`
           flex flex-col gap-2
           ${depth === 0 ? 'mt-3 pl-4 border-l-2 border-slate-100 ml-4' : 'mt-2 pl-4 border-l-2 border-slate-100 ml-2'}
           ${!isExpanded && item.children.length > 0 ? 'hidden' : ''}
           ${item.children.length === 0 && (item.type === 'dropdown' || item.type === 'mega-menu') && isExpanded ? 'min-h-[40px] border-dashed border border-slate-200 rounded bg-slate-50/50 flex items-center justify-center' : ''}
         `}
      >
        <SortableContext 
          items={item.children.map(c => c.id)} 
          strategy={verticalListSortingStrategy}
        >
          {item.children.map((child) => (
            <SortableTreeItem 
              key={child.id} 
              item={child} 
              depth={depth + 1} 
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </SortableContext>
        
        {/* Empty state hint for dropdowns */}
        {item.children.length === 0 && (item.type === 'dropdown' || item.type === 'mega-menu') && isExpanded && (
           <span className="text-[10px] text-slate-400 text-center w-full px-2">Drop items here</span>
        )}
      </div>
    </div>
  );
};
