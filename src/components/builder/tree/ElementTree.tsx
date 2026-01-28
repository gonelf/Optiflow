// ============================================================================
// PHASE 8: ELEMENT TREE
// ============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, FolderTree } from 'lucide-react';
import { ElementTreeNode } from './ElementTreeNode';
import { useElementStore } from '@/store/element.store';
import { ElementTreeNode as TreeNode } from '@/types/builder';

export function ElementTree() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { elements, buildElementTree } = useElementStore();

  // Build tree structure
  const tree = useMemo(() => buildElementTree(), [elements]);

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchQuery) return tree;

    const query = searchQuery.toLowerCase();
    const filterNode = (node: TreeNode): TreeNode | null => {
      const matches = node.element.name.toLowerCase().includes(query);
      const filteredChildren = node.children
        .map(filterNode)
        .filter((n): n is TreeNode => n !== null);

      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
          isExpanded: true, // Auto-expand when searching
        };
      }

      return null;
    };

    return tree.map(filterNode).filter((n): n is TreeNode => n !== null);
  }, [tree, searchQuery]);

  // Automatically expand matching nodes when searching
  React.useEffect(() => {
    if (searchQuery) {
      const newExpandedIds = new Set<string>();
      const expandMatching = (node: TreeNode) => {
        if (node.children.length > 0) {
          newExpandedIds.add(node.element.id);
          node.children.forEach(expandMatching);
        }
      };
      filteredTree.forEach(expandMatching);
      setExpandedIds(newExpandedIds);
    }
  }, [searchQuery, filteredTree]);

  const handleExpand = (id: string) => {
    setExpandedIds((prev) => new Set(prev).add(id));
  };

  const handleCollapse = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Merge expanded state into tree nodes
  const treeWithExpandState = useMemo(() => {
    const applyExpandState = (node: TreeNode): TreeNode => ({
      ...node,
      isExpanded: searchQuery ? true : expandedIds.has(node.element.id),
      children: node.children.map(applyExpandState),
    });

    return filteredTree.map(applyExpandState);
  }, [filteredTree, expandedIds, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold">Elements</h3>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        {treeWithExpandState.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <FolderTree className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No matching elements' : 'No elements yet'}
            </p>
            {!searchQuery && (
              <p className="text-xs text-gray-400 mt-1">
                Add elements from the components palette
              </p>
            )}
          </div>
        ) : (
          <div className="py-2 group">
            {treeWithExpandState.map((node) => (
              <ElementTreeNode
                key={node.element.id}
                node={node}
                depth={0}
                onExpand={handleExpand}
                onCollapse={handleCollapse}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {elements.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500">
          {elements.length} element{elements.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
