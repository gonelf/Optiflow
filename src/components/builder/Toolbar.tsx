'use client';

import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/store/builder.store';
import {
  Save,
  Undo,
  Redo,
  Eye,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

interface ToolbarProps {
  onSave: () => void;
  onPreview: () => void;
  onSettings: () => void;
  onBack?: () => void;
  mode?: 'default' | 'ab-test';
  title?: string;
  isSaving?: boolean;
}

export function Toolbar({
  onSave,
  onPreview,
  onSettings,
  onBack,
  mode = 'default',
  title,
  isSaving: propsIsSaving
}: ToolbarProps) {
  const { undo, redo, canUndo, canRedo, isSaving: storeIsSaving, metadata } = useBuilderStore();
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  const displayTitle = title || metadata.title || 'Untitled Page';
  const isSaving = propsIsSaving !== undefined ? propsIsSaving : storeIsSaving;

  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-4">
      {/* Left section - Page info */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </Button>
        )}
        <h1 className="text-lg font-semibold">{displayTitle}</h1>
        {isSaving && (
          <span className="text-sm text-muted-foreground">Saving...</span>
        )}
      </div>

      {/* Center section - Viewport controls */}
      <div className="flex items-center gap-1 rounded-lg border bg-gray-50 p-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(viewport === 'desktop' && 'bg-white shadow-sm')}
          onClick={() => setViewport('desktop')}
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(viewport === 'tablet' && 'bg-white shadow-sm')}
          onClick={() => setViewport('tablet')}
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(viewport === 'mobile' && 'bg-white shadow-sm')}
          onClick={() => setViewport('mobile')}
        >
          <Smartphone className="h-4 w-4" />
        </Button>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button variant="outline" size="sm" onClick={onSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : (mode === 'ab-test' ? 'Save & Return' : 'Save')}
        </Button>
      </div>
    </div>
  );
}
