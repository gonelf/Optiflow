// ============================================================================
// PHASE 8: ELEMENT TREE NODE
// ============================================================================

'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  MoreVertical,
  Copy,
  Trash2,
  Move,
} from 'lucide-react';
import { ElementTreeNode as TreeNode } from '@/types/builder';
import { PRIMITIVE_CONFIGS } from '@/types/primitives';
import { useElementStore } from '@/store/element.store';

interface ElementTreeNodeProps {
  node: TreeNode;
  depth: number;
  onExpand?: (id: string) => void;
  onCollapse?: (id: string) => void;
}

export function ElementTreeNode({
  node,
  depth,
  onExpand,
  onCollapse,
}: ElementTreeNodeProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { element, children, isExpanded, isSelected } = node;

  const {
    selectElement,
    updateElement,
    deleteElement,
    duplicateElement,
    selection,
  } = useElementStore();

  const hasChildren = children.length > 0;
  const isHovered = selection.hoveredElementId === element.id;

  // Get icon from primitive config
  const primitiveConfig = PRIMITIVE_CONFIGS[element.type as keyof typeof PRIMITIVE_CONFIGS];
  const iconName = primitiveConfig?.icon || 'Box';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpanded && onCollapse) {
      onCollapse(element.id);
    } else if (!isExpanded && onExpand) {
      onExpand(element.id);
    }
  };

  const handleSelect = () => {
    selectElement(element.id);
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, { hidden: !element.hidden });
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, { locked: !element.locked });
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateElement(element.id);
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete ${element.name}${hasChildren ? ' and all children' : ''}?`)) {
      deleteElement(element.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <div
        className={`
          flex items-center gap-2 px-2 py-1.5 cursor-pointer
          hover:bg-gray-100 dark:hover:bg-gray-800
          ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
          ${isHovered ? 'ring-1 ring-blue-400' : ''}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Element Type Icon */}
        <div className="text-gray-500">
          <span className="text-xs">{iconName}</span>
        </div>

        {/* Element Name */}
        <div className="flex-1 text-sm truncate">
          {element.name}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Visibility Toggle */}
          <button
            onClick={handleToggleVisibility}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100"
            title={element.hidden ? 'Show' : 'Hide'}
          >
            {element.hidden ? (
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-gray-600" />
            )}
          </button>

          {/* Lock Toggle */}
          {element.locked && (
            <button
              onClick={handleToggleLock}
              className="p-1"
              title="Locked"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            </button>
          )}

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                  <button
                    onClick={handleDuplicate}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {children.map((childNode) => (
            <ElementTreeNode
              key={childNode.element.id}
              node={childNode}
              depth={depth + 1}
              onExpand={onExpand}
              onCollapse={onCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
}
