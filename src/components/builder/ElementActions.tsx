'use client';

import { useBuilderStore } from '@/store/builder.store';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, BookmarkPlus } from 'lucide-react';

interface ElementActionsProps {
  elementId: string | null;
  element?: any;
  onActionComplete?: (action: 'delete' | 'duplicate' | 'save') => void;
}

export function ElementActions({ elementId, element, onActionComplete }: ElementActionsProps) {
  const {
    deleteElement,
    duplicateElement,
    saveToPool,
    saveElementToPool,
  } = useBuilderStore();

  if (!elementId) return null;

  const handleDelete = () => {
    if (elementId) {
      deleteElement(elementId);
      onActionComplete?.('delete');
    }
  };

  const handleDuplicate = () => {
    if (elementId) {
      duplicateElement(elementId);
      onActionComplete?.('duplicate');
    }
  };

  const handleSaveToPool = () => {
    if (element) {
      saveElementToPool(element);
      onActionComplete?.('save');
    } else if (elementId) {
      saveToPool(elementId);
      onActionComplete?.('save');
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
        title="Delete element"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete element</span>
      </Button>

      {/* Duplicate */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleDuplicate}
        title="Duplicate element"
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Duplicate element</span>
      </Button>

      {/* Save to Pool */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleSaveToPool}
        title="Save to pool"
      >
        <BookmarkPlus className="h-4 w-4" />
        <span className="sr-only">Save to pool</span>
      </Button>
    </div>
  );
}