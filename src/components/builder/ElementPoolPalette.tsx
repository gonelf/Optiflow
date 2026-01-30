'use client';

import { useBuilderStore } from '@/store/builder.store';
import { Button } from '@/components/ui/button';
import { Bookmark, X, Plus } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface ElementPoolPaletteProps {
  onAddToCanvas: (element: any) => void;
}

function DraggablePoolItem({ element, onAdd, onRemove }: {
  element: any;
  onAdd: (element: any) => void;
  onRemove: (elementId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pool-${element.id}`,
    data: {
      type: element.type,
      isPrimitive: true,
      isFromPool: true,
      element: element,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'group relative border rounded-lg p-3 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-primary ring-offset-1'
      )}
    >
      {/* Element Preview */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium capitalize bg-muted px-2 py-0.5 rounded">
              {element.type}
            </span>
          </div>
          <p className="text-sm font-medium truncate">{element.name}</p>
          {element.content && typeof element.content === 'object' && 'content' in element.content && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {(element.content as any).content || (element.content as any).src || ''}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
            title="Add to canvas"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(element);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Remove from pool"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(element.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Add hint */}
      <div className="mt-2 text-xs text-muted-foreground">
        Click or drag to add to canvas
      </div>
    </div>
  );
}

export function ElementPoolPalette({ onAddToCanvas }: ElementPoolPaletteProps) {
  const {
    elementPool,
    removeFromPool,
    clearPool,
  } = useBuilderStore();

  if (elementPool.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No saved elements</p>
        <p className="text-xs mt-1">
          Select an element and click the bookmark icon to save it here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            Saved Elements
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {elementPool.length} saved
          </p>
        </div>
        {elementPool.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-destructive hover:text-destructive"
            onClick={clearPool}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Element List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {elementPool.map((element) => (
          <DraggablePoolItem
            key={element.id}
            element={element}
            onAdd={onAddToCanvas}
            onRemove={removeFromPool}
          />
        ))}
      </div>
    </div>
  );
}