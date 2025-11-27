
import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  DragStartEvent, 
  DragOverEvent, 
  DragEndEvent, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor,
  closestCorners, // Better for variable sized items
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import { 
  SortableContext, 
  horizontalListSortingStrategy, 
  sortableKeyboardCoordinates,
  arrayMove
} from '@dnd-kit/sortable';
import { NestedMenuItem, AvailablePage } from '../types';
import { generateId, findNode, insertNode, removeNode } from '../utils/treeUtils';
import { Sidebar } from './Sidebar';
import { SortableTreeItem } from './SortableTreeItem';
import { Save, Code, AlertCircle } from 'lucide-react';

// MOCK DATA
const AVAILABLE_PAGES: AvailablePage[] = [
  { id: 'p1', title: 'Home', path: '/', type: 'page' },
  { id: 'p2', title: 'About Us', path: '/about', type: 'page' },
  { id: 'p3', title: 'Services', path: '/services', type: 'page' },
  { id: 'p4', title: 'Contact', path: '/contact', type: 'page' },
  { id: 'p5', title: 'Blog', path: '/blog', type: 'page' },
  { id: 'p6', title: 'Products', path: '/products', type: 'collection' },
  { id: 'p7', title: 'Careers', path: '/careers', type: 'page' },
];

const INITIAL_TREE: NestedMenuItem[] = [
  { id: '1', label: 'Home', type: 'link', url: '/', children: [] },
  { 
    id: '2', 
    label: 'Products', 
    type: 'dropdown', 
    url: '/products', 
    children: [
      { id: '21', label: 'New Arrivals', type: 'link', url: '/products/new', children: [] },
      { id: '22', label: 'Best Sellers', type: 'link', url: '/products/best', children: [] },
    ] 
  },
  { id: '3', label: 'About', type: 'link', url: '/about', children: [] },
];

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export const NavigationBuilder: React.FC = () => {
  const [items, setItems] = useState<NestedMenuItem[]>(INITIAL_TREE);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<any>(null); // Can be NestedMenuItem or SidebarItem data
  const [showJson, setShowJson] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // Prevent accidental drags
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    if (active.data.current?.isSidebarItem) {
      setActiveItem(active.data.current);
    } else {
      // Find item in tree
      const found = findNode(items, active.id as string);
      if (found) setActiveItem(found.node);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // We don't need complex real-time tree mutation for visual feedback 
    // if we trust DndKit's SortableContext to handle the placeholders.
    // However, when dragging from Sidebar, we need to handle it.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    // Case 1: Dragging from Sidebar
    if (active.data.current?.isSidebarItem) {
        const newItem: NestedMenuItem = {
            id: generateId(),
            label: active.data.current.label,
            type: active.data.current.type,
            url: active.data.current.url,
            children: []
        };

        // If dropped on the root container (placeholder or container id)
        if (over.id === 'root-container') {
            setItems([...items, newItem]);
            return;
        }

        // If dropped over a sortable item in the tree
        const overFound = findNode(items, over.id as string);
        if (overFound) {
            // Check if we dropped INTO a container (not fully implemented in UI but logic helps)
            // For now, we just insert adjacent to the item we dropped on
            // If dropping on a dropdown, maybe append to children? 
            // Simplified: Insert AFTER the item we dropped on (at same level)
            if (overFound.parent) {
                setItems(prev => {
                   const newTree = insertNode(prev, overFound.parent!.id, overFound.index + 1, newItem);
                   return newTree;
                });
            } else {
                setItems(prev => {
                   const newTree = [...prev];
                   newTree.splice(overFound.index + 1, 0, newItem);
                   return newTree;
                });
            }
        }
        return;
    }

    // Case 2: Reordering within Tree
    if (active.id !== over.id) {
        const activeFound = findNode(items, active.id as string);
        const overFound = findNode(items, over.id as string);

        if (activeFound && overFound) {
             // 1. Move within same container (simple reorder)
             if (activeFound.parent?.id === overFound.parent?.id) {
                 if (activeFound.parent) {
                      // Nested reorder
                      setItems(prev => {
                           const parent = findNode(prev, activeFound.parent!.id)!.node;
                           const newChildren = arrayMove(parent.children, activeFound.index, overFound.index);
                           // Immutably update tree
                           // This is lazy, strictly should traverse. 
                           // But findNode returns ref to node in 'items' if we didn't clone? 
                           // No, findNode traverses.
                           // Let's use remove/insert logic for safety or specific update.
                           const tempTree = removeNode(prev, active.id as string);
                           return insertNode(tempTree, activeFound.parent!.id, overFound.index, activeFound.node);
                      });
                 } else {
                      // Root reorder
                      setItems(prev => arrayMove(prev, activeFound.index, overFound.index));
                 }
             } else {
                 // 2. Move to different container
                 // active moves to over's position
                 setItems(prev => {
                      const tempTree = removeNode(prev, active.id as string);
                      // If over is root level
                      if (!overFound.parent) {
                          const newTree = [...tempTree];
                          // Adjust index if we removed something before it?
                          // removeNode returns a new tree. Indexes change.
                          // Safe approach: find overId in new tree.
                          const newOver = findNode(newTree, over.id as string);
                          const idx = newOver ? newOver.index : newTree.length;
                          newTree.splice(idx, 0, activeFound.node);
                          return newTree;
                      } else {
                          // Insert into over's parent at over's index
                          // If dropping ON a dropdown, we might want to nest?
                          // Current logic: Dropping ON an item replaces/shifts it.
                          // To Nest: user must drag into the "children area" which is a separate SortableContext.
                          // If the children area is empty/hidden, it's hard. 
                          // But we rendered children container even if empty for dropdowns.
                          
                          // Assuming we are dropping onto the item itself -> Insert adjacent.
                          const newOver = findNode(tempTree, over.id as string);
                          if (newOver && newOver.parent) {
                             return insertNode(tempTree, newOver.parent.id, newOver.index, activeFound.node);
                          } else if (newOver) {
                             // Should not happen if overFound.parent existed, unless tree changed drastically
                             return insertNode(tempTree, null, newOver.index, activeFound.node);
                          }
                          return tempTree;
                      }
                 });
             }
        }
    }
  };

  const handleRemove = (id: string) => {
    setItems(prev => removeNode(prev, id));
  };

  const handleUpdate = (id: string, data: Partial<NestedMenuItem>) => {
    const updateRecursive = (nodes: NestedMenuItem[]): NestedMenuItem[] => {
      return nodes.map(node => {
        if (node.id === id) return { ...node, ...data };
        if (node.children) return { ...node, children: updateRecursive(node.children) };
        return node;
      });
    };
    setItems(prev => updateRecursive(prev));
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            {/* Left Sidebar - 30% */}
            <div className="w-[30%] min-w-[280px] max-w-[360px] h-full z-10 shadow-xl">
               <Sidebar pages={AVAILABLE_PAGES} />
            </div>

            {/* Main Builder Area - 70% */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
               {/* Toolbar */}
               <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                  <h1 className="font-bold text-slate-800">Menu Builder</h1>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => setShowJson(!showJson)}
                        className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-sm font-medium"
                     >
                        <Code size={16} /> JSON
                     </button>
                     <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 text-sm font-medium shadow-sm transition-all">
                        <Save size={16} /> Save
                     </button>
                  </div>
               </div>

               {/* Canvas */}
               <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
                   <div 
                      className="min-h-[200px] border-2 border-dashed border-slate-200 rounded-xl p-8 bg-white/50 relative transition-all hover:border-blue-200"
                   >
                        {/* Root Drop Zone Label */}
                        <div className="absolute top-0 left-0 px-3 py-1 bg-slate-100 text-[10px] text-slate-400 font-bold tracking-wider rounded-br-lg uppercase">
                            Main Navigation Bar
                        </div>
                        
                        {items.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                                <AlertCircle size={32} className="mb-2 opacity-20" />
                                <p className="font-medium">Drag items here to start</p>
                            </div>
                        )}

                        {/* Horizontal Sortable List */}
                        <div 
                          id="root-container"
                          className="flex flex-row gap-4 items-start flex-wrap"
                        >
                           <SortableContext 
                              items={items.map(i => i.id)} 
                              strategy={horizontalListSortingStrategy}
                           >
                               {items.map((item) => (
                                  <SortableTreeItem 
                                    key={item.id} 
                                    item={item} 
                                    depth={0} 
                                    onRemove={handleRemove}
                                    onUpdate={handleUpdate}
                                  />
                               ))}
                           </SortableContext>
                        </div>
                   </div>

                   {/* JSON Drawer */}
                   {showJson && (
                       <div className="mt-8 p-4 bg-slate-900 rounded-lg shadow-lg text-slate-300 font-mono text-xs overflow-auto max-h-64 border border-slate-700">
                           <pre>{JSON.stringify(items, null, 2)}</pre>
                       </div>
                   )}
               </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay dropAnimation={dropAnimationConfig}>
                {activeItem ? (
                   <div className="opacity-90 rotate-2 cursor-grabbing">
                        {/* Simplified representation for overlay */}
                        <div className="bg-white p-3 rounded-lg shadow-xl border border-blue-500 w-[200px] flex items-center gap-3">
                           <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                              <AlertCircle size={16} />
                           </div>
                           <span className="font-medium text-slate-900">{activeItem.label}</span>
                        </div>
                   </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    </div>
  );
};
