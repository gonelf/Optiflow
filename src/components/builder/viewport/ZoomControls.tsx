// ============================================================================
// PHASE 8: ZOOM CONTROLS
// ============================================================================

'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useElementStore } from '@/store/element.store';

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export function ZoomControls() {
  const { viewport, setZoom, resetViewport } = useElementStore();
  const currentZoom = viewport.zoom;

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(currentZoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(currentZoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const handleReset = () => {
    setZoom(1);
  };

  const canZoomIn = currentZoom < ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
  const canZoomOut = currentZoom > ZOOM_LEVELS[0];

  return (
    <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
      <button
        onClick={handleZoomOut}
        disabled={!canZoomOut}
        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        onClick={handleReset}
        className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded min-w-[60px]"
        title="Reset Zoom"
      >
        {Math.round(currentZoom * 100)}%
      </button>

      <button
        onClick={handleZoomIn}
        disabled={!canZoomIn}
        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      <button
        onClick={resetViewport}
        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Fit to Screen"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}
