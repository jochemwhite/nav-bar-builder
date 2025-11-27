
import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { AvailablePage } from '../types';
import { 
  FileText, Link as LinkIcon, Box, Type, Layout, Search, GripVertical 
} from 'lucide-react';
import { generateId } from '../utils/treeUtils';

interface SidebarProps {
  pages: AvailablePage[];
}

const DraggableSidebarItem = ({ 
  id, 
  data, 
  label, 
  icon: Icon,
  type
}: { 
  id: string, 
  data: any, 
  label: string, 
  icon: any,
  type: string
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: { ...data, isSidebarItem: true },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-3 p-3 mb-2 bg-white border border-slate-200 rounded-lg cursor-grab hover:border-blue-300 hover:shadow-sm transition-all
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="text-slate-400">
        <GripVertical size={16} />
      </div>
      <div className={`p-1.5 rounded ${type === 'page' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{label}</p>
        <p className="text-xs text-slate-400 truncate">{data.type}</p>
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ pages }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pages' | 'custom'>('pages');

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    page.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 border-r border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="font-semibold text-slate-800 mb-4">Library</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button 
            onClick={() => setActiveTab('pages')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${activeTab === 'pages' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pages
          </button>
          <button 
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${activeTab === 'custom' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'pages' ? (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Available Pages</h3>
            {filteredPages.map(page => (
              <DraggableSidebarItem 
                key={page.id} 
                id={`sidebar-page-${page.id}`}
                label={page.title}
                icon={FileText}
                type="page"
                data={{
                  type: 'link', // Converts to link when dropped
                  label: page.title,
                  url: page.path,
                  isPage: true
                }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Custom Items</h3>
            <DraggableSidebarItem 
              id="sidebar-custom-link"
              label="Custom Link"
              icon={LinkIcon}
              type="custom"
              data={{ type: 'link', label: 'New Link', url: '#' }}
            />
            <DraggableSidebarItem 
              id="sidebar-custom-dropdown"
              label="Dropdown Group"
              icon={Box}
              type="custom"
              data={{ type: 'dropdown', label: 'Dropdown', url: '' }}
            />
            <DraggableSidebarItem 
              id="sidebar-custom-mega"
              label="Mega Menu"
              icon={Layout}
              type="custom"
              data={{ type: 'mega-menu', label: 'Mega Menu', url: '' }}
            />
            <DraggableSidebarItem 
              id="sidebar-custom-divider"
              label="Divider"
              icon={Type}
              type="custom"
              data={{ type: 'divider', label: 'Divider' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
