// ============================================================================
// PHASE 8: BORDER & EFFECTS PANEL
// ============================================================================

'use client';

import React from 'react';
import { ElementStyles } from '@/types/styles';

interface BorderPanelProps {
  styles: Partial<ElementStyles>;
  onChange: (updates: Partial<ElementStyles>) => void;
}

const BORDER_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'none', label: 'None' },
];

const RADIUS_PRESETS = [
  { value: '0', label: 'None' },
  { value: '0.125rem', label: 'SM' },
  { value: '0.375rem', label: 'MD' },
  { value: '0.5rem', label: 'LG' },
  { value: '9999px', label: 'Full' },
];

export function BorderPanel({ styles, onChange }: BorderPanelProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Border & Effects</h4>

      {/* Border Width */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Border Width
        </label>
        <input
          type="text"
          value={styles.borderWidth || ''}
          onChange={(e) => onChange({ borderWidth: e.target.value })}
          placeholder="0"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {/* Border Style */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Border Style
        </label>
        <div className="grid grid-cols-4 gap-2">
          {BORDER_STYLES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ borderStyle: value as any })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.borderStyle === value
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

      {/* Border Color */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Border Color
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={styles.borderColor || '#000000'}
            onChange={(e) => onChange({ borderColor: e.target.value })}
            className="w-12 h-10 rounded border border-gray-300 dark:border-gray-700"
          />
          <input
            type="text"
            value={styles.borderColor || ''}
            onChange={(e) => onChange({ borderColor: e.target.value })}
            placeholder="#000000"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 font-mono"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4" />

      {/* Border Radius */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Border Radius
        </label>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {RADIUS_PRESETS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ borderRadius: value })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.borderRadius === value
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
          value={styles.borderRadius || ''}
          onChange={(e) => onChange({ borderRadius: e.target.value })}
          placeholder="0"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {/* Individual Corner Radius */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Individual Corners
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Top Left</label>
            <input
              type="text"
              value={styles.borderTopLeftRadius || ''}
              onChange={(e) => onChange({ borderTopLeftRadius: e.target.value })}
              placeholder="0"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Top Right</label>
            <input
              type="text"
              value={styles.borderTopRightRadius || ''}
              onChange={(e) => onChange({ borderTopRightRadius: e.target.value })}
              placeholder="0"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Bottom Left</label>
            <input
              type="text"
              value={styles.borderBottomLeftRadius || ''}
              onChange={(e) => onChange({ borderBottomLeftRadius: e.target.value })}
              placeholder="0"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Bottom Right</label>
            <input
              type="text"
              value={styles.borderBottomRightRadius || ''}
              onChange={(e) => onChange({ borderBottomRightRadius: e.target.value })}
              placeholder="0"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4" />

      {/* Opacity */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Opacity
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={styles.opacity || 1}
            onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
            className="flex-1"
          />
          <span className="text-sm font-medium w-12 text-right">
            {Math.round((styles.opacity || 1) * 100)}%
          </span>
        </div>
      </div>

      {/* Box Shadow */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Box Shadow
        </label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {[
            { label: 'None', value: 'none' },
            { label: 'SM', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
            { label: 'MD', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
            { label: 'LG', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => {
                if (value === 'none') {
                  onChange({ boxShadow: [] });
                } else {
                  // Parse shadow string into ShadowValue (simplified)
                  onChange({ boxShadow: undefined as any }); // For now, use string
                }
              }}
              className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cursor */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Cursor
        </label>
        <select
          value={styles.cursor || 'auto'}
          onChange={(e) => onChange({ cursor: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        >
          <option value="auto">Auto</option>
          <option value="pointer">Pointer</option>
          <option value="not-allowed">Not Allowed</option>
          <option value="wait">Wait</option>
          <option value="text">Text</option>
          <option value="move">Move</option>
          <option value="grab">Grab</option>
        </select>
      </div>
    </div>
  );
}
