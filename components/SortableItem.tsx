import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FlatMenuItem, MenuItemType } from '../types';
import { 
  GripVertical, Trash2, Copy, Eye, EyeOff, Settings, ChevronRight, CornerDownRight, 
  Link, Layout, Square, Type, List
} from 'lucide-react';

interface SortableItemProps {
  item: FlatMenuItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onIndent: (id: string) => void;
  onOutdent: (id: string) => void;
  canIndent: boolean;
  canOutdent: boolean;
}

const TypeIcons: Record<MenuItemType, React.ElementType> = {
  link: Link,
  dropdown: List,
  'mega-menu': Layout,
  button: Square,
  divider: Type,
};

export const SortableItem: React.FC<SortableItemProps> = ({
  item,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onIndent,
  onOutdent,
  canIndent,
  canOutdent,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${item.depth * 24}px`,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = TypeIcons[item.type] || Link;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center gap-2 p-2 mb-2 rounded-md border
        ${isSelected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'}
        ${item.hidden ? 'opacity-60 grayscale' : ''}
        transition-all duration-200
      `}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 rounded"
      >
        <GripVertical size={16} />
      </div>

      {/* Visual Indent Guide */}
      {item.depth > 0 && (
        <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 text-slate-300">
           <CornerDownRight size={14} />
        </div>
      )}

      {/* Item Icon & Label */}
      <div 
        className="flex-1 flex items-center gap-3 cursor-pointer"
        onClick={() => onSelect(item.id)}
      >
        <div className={`
          p-1.5 rounded-md 
          ${item.type === 'mega-menu' ? 'bg-purple-100 text-purple-600' : 
            item.type === 'button' ? 'bg-green-100 text-green-600' : 
            item.type === 'dropdown' ? 'bg-orange-100 text-orange-600' : 
            'bg-slate-100 text-slate-600'}
        `}>
          <IconComponent size={16} />
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">
            {item.label || <span className="text-slate-400 italic">Untitled Item</span>}
          </span>
          <span className="text-xs text-slate-500 flex gap-2 items-center">
            <span className="uppercase text-[10px] tracking-wider font-bold opacity-70 border px-1 rounded bg-slate-50">
              {item.type.replace('-', ' ')}
            </span>
            {item.url && <span className="truncate max-w-[150px]">{item.url}</span>}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onOutdent(item.id)}
          disabled={!canOutdent}
          className={`p-1.5 rounded hover:bg-slate-100 ${!canOutdent ? 'text-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          title="Outdent (Move Level Up)"
        >
          <ChevronRight size={14} className="rotate-180" />
        </button>
        <button
          onClick={() => onIndent(item.id)}
          disabled={!canIndent}
          className={`p-1.5 rounded hover:bg-slate-100 ${!canIndent ? 'text-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          title="Indent (Make Child)"
        >
          <ChevronRight size={14} />
        </button>
        
        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button
          onClick={() => onToggleVisibility(item.id)}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
          title={item.hidden ? "Show" : "Hide"}
        >
          {item.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button
          onClick={() => onDuplicate(item.id)}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
          title="Duplicate"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="md:hidden">
          <button 
             onClick={() => onSelect(item.id)}
             className="p-2 text-slate-500"
          >
             <Settings size={16} />
          </button>
      </div>
    </div>
  );
};
