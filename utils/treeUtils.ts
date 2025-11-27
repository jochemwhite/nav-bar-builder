
import { NestedMenuItem } from '../types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Find a node and its parent path
export function findNode(
  nodes: NestedMenuItem[], 
  id: string
): { node: NestedMenuItem; index: number; parent: NestedMenuItem | null; path: number[] } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      return { node: nodes[i], index: i, parent: null, path: [i] };
    }
    if (nodes[i].children && nodes[i].children.length > 0) {
      const result = findNode(nodes[i].children, id);
      if (result) {
        return { 
          ...result, 
          parent: nodes[i],
          path: [i, ...result.path]
        };
      }
    }
  }
  return null;
}

// Remove a node from the tree
export function removeNode(nodes: NestedMenuItem[], id: string): NestedMenuItem[] {
  return nodes.filter(node => {
    if (node.id === id) return false;
    if (node.children) {
      node.children = removeNode(node.children, id);
    }
    return true;
  });
}

// Insert a node at a specific path or into a parent
export function insertNode(
  nodes: NestedMenuItem[], 
  parentNodeId: string | null, 
  index: number, 
  newNode: NestedMenuItem
): NestedMenuItem[] {
  if (parentNodeId === null) {
    const newNodes = [...nodes];
    newNodes.splice(index, 0, newNode);
    return newNodes;
  }

  return nodes.map(node => {
    if (node.id === parentNodeId) {
      const newChildren = [...(node.children || [])];
      newChildren.splice(index, 0, newNode);
      return { ...node, children: newChildren };
    }
    if (node.children) {
      return { ...node, children: insertNode(node.children, parentNodeId, index, newNode) };
    }
    return node;
  });
}

// Move a node within the tree
export function moveNode(
  nodes: NestedMenuItem[], 
  activeId: string, 
  overId: string,
  projectedParentId: string | null
): NestedMenuItem[] {
  // 1. Find the active node
  const activeInfo = findNode(nodes, activeId);
  if (!activeInfo) return nodes;

  // 2. Remove it from old position
  let newNodes = removeNode(nodes, activeId);

  // 3. Find insertion point
  // If we have a projected parent (nested drop), insert there.
  // Otherwise, we are likely reordering near 'overId'.
  
  // Note: This logic depends heavily on how dnd-kit reports 'over'. 
  // In a tree, 'over' is usually the item we are hovering.
  
  // Simplified logic for this specific builder:
  // If dropping on an item (nesting), projectedParentId should be that item's ID.
  
  const nodeToInsert = activeInfo.node;

  // Re-insert
  if (projectedParentId === null) {
      // Root level reorder or insert
      // Find index of overId
      const overInfo = findNode(newNodes, overId);
      const insertIndex = overInfo ? overInfo.index : newNodes.length;
      newNodes.splice(insertIndex, 0, nodeToInsert);
  } else {
      newNodes = insertNode(newNodes, projectedParentId, 0, nodeToInsert); // Append to start or find index?
      // Complex sorting logic omitted for brevity, focusing on "drop into" vs "reorder".
      // For accurate index, we'd need to know if we dropped 'before' or 'after' the target in the sub-list.
  }
  
  return newNodes;
}

export const countNodes = (nodes: NestedMenuItem[]): number => {
    return nodes.reduce((acc, node) => acc + 1 + countNodes(node.children), 0);
};
