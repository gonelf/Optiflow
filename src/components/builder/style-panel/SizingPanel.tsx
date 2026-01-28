// ============================================================================
// PHASE 8: SIZING PANEL
// ============================================================================

'use client';

import React from 'react';
import { ElementStyles } from '@/types/styles';

interface SizingPanelProps {
  styles: Partial<ElementStyles>;
  onChange: (updates: Partial<ElementStyles>) => void;
}

const SIZE_PRESETS = [
  { value: 'auto', label: 'Auto' },
  { value: '100%', label: '100%' },
  { value: '50%', label: '50%' },
  { value: 'fit-content', label: 'Fit' },
];

const OVERFLOW_OPTIONS = [
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'scroll', label: 'Scroll' },
  { value: 'auto', label: 'Auto' },
];

export function SizingPanel({ styles, onChange }: SizingPanelProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Sizing</h4>

      {/* Width */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Width
        </label>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {SIZE_PRESETS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ width: value })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.width === value
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={styles.width || ''}
          onChange={(e) => onChange({ width: e.target.value })}
          placeholder="auto"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {/* Min Width */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Min Width
        </label>
        <input
          type="text"
          value={styles.minWidth || ''}
          onChange={(e) => onChange({ minWidth: e.target.value })}
          placeholder="0"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {/* Max Width */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Max Width
        </label>
        <input
          type="text"
          value={styles.maxWidth || ''}
          onChange={(e) => onChange({ maxWidth: e.target.value })}
          placeholder="none"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4" />

      {/* Height */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Height
        </label>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {SIZE_PRESETS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ height: value })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.height === value
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={styles.height || ''}
          onChange={(e) => onChange({ height: e.target.value })}
          placeholder="auto"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {/* Min Height */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Min Height
        </label>
        <input
          type="text"
          value={styles.minHeight || ''}
          onChange={(e) => onChange({ minHeight: e.target.value })}
          placeholder="0"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {/* Max Height */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Max Height
        </label>
        <input
          type="text"
          value={styles.maxHeight || ''}
          onChange={(e) => onChange({ maxHeight: e.target.value })}
          placeholder="none"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4" />

      {/* Aspect Ratio */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['auto', '1/1', '16/9', '4/3'].map((ratio) => (
            <button
              key={ratio}
              onClick={() => onChange({ aspectRatio: ratio })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.aspectRatio === ratio
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Overflow */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Overflow
        </label>
        <div className="grid grid-cols-2 gap-2">
          {OVERFLOW_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ overflow: value as any })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.overflow === value
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Object Fit (for images/video) */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Object Fit
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['contain', 'cover', 'fill', 'none', 'scale-down'].map((fit) => (
            <button
              key={fit}
              onClick={() => onChange({ objectFit: fit as any })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.objectFit === fit
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
