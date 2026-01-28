// ============================================================================
// PHASE 8: BACKGROUND PANEL
// ============================================================================

'use client';

import React, { useState } from 'react';
import { ElementStyles } from '@/types/styles';

interface BackgroundPanelProps {
  styles: Partial<ElementStyles>;
  onChange: (updates: Partial<ElementStyles>) => void;
}

const BG_SIZE_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
];

const BG_REPEAT_OPTIONS = [
  { value: 'no-repeat', label: 'No Repeat' },
  { value: 'repeat', label: 'Repeat' },
  { value: 'repeat-x', label: 'Repeat X' },
  { value: 'repeat-y', label: 'Repeat Y' },
];

const BG_POSITION_OPTIONS = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

export function BackgroundPanel({ styles, onChange }: BackgroundPanelProps) {
  const [bgType, setBgType] = useState<'color' | 'gradient' | 'image'>('color');

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Background</h4>

      {/* Background Type Toggle */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setBgType('color')}
          className={`
            px-3 py-2 text-sm rounded border
            ${
              bgType === 'color'
                ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          Color
        </button>
        <button
          onClick={() => setBgType('gradient')}
          className={`
            px-3 py-2 text-sm rounded border
            ${
              bgType === 'gradient'
                ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          Gradient
        </button>
        <button
          onClick={() => setBgType('image')}
          className={`
            px-3 py-2 text-sm rounded border
            ${
              bgType === 'image'
                ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          Image
        </button>
      </div>

      {/* Background Color */}
      {bgType === 'color' && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={styles.backgroundColor || '#ffffff'}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300 dark:border-gray-700"
            />
            <input
              type="text"
              value={styles.backgroundColor || ''}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              placeholder="#ffffff"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 font-mono"
            />
          </div>

          {/* Quick Color Presets */}
          <div className="grid grid-cols-8 gap-2">
            {[
              '#ffffff',
              '#000000',
              '#f3f4f6',
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6',
            ].map((color) => (
              <button
                key={color}
                onClick={() => onChange({ backgroundColor: color })}
                className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-700 hover:border-blue-500"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Background Gradient */}
      {bgType === 'gradient' && (
        <div className="space-y-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded">
            <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
              Gradient Builder
            </p>

            {/* Gradient Type */}
            <div className="space-y-2 mb-3">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Linear
                </button>
                <button
                  className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Radial
                </button>
              </div>
            </div>

            {/* Quick Gradients */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    onChange({
                      backgroundImage:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    })
                  }
                  className="h-10 rounded border border-gray-300 dark:border-gray-700"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                />
                <button
                  onClick={() =>
                    onChange({
                      backgroundImage:
                        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    })
                  }
                  className="h-10 rounded border border-gray-300 dark:border-gray-700"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Custom Gradient Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Custom CSS
            </label>
            <textarea
              value={styles.backgroundImage || ''}
              onChange={(e) => onChange({ backgroundImage: e.target.value })}
              placeholder="linear-gradient(...)"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 font-mono"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Background Image */}
      {bgType === 'image' && (
        <div className="space-y-3">
          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Image URL
            </label>
            <input
              type="text"
              value={styles.backgroundImage?.replace(/^url\(['"]?|['"]?\)$/g, '') || ''}
              onChange={(e) => onChange({ backgroundImage: `url('${e.target.value}')` })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            />
          </div>

          {/* Background Size */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BG_SIZE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onChange({ backgroundSize: value as any })}
                  className={`
                    px-2 py-1.5 text-xs rounded border
                    ${
                      styles.backgroundSize === value
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

          {/* Background Position */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BG_POSITION_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onChange({ backgroundPosition: value })}
                  className={`
                    px-2 py-1.5 text-xs rounded border
                    ${
                      styles.backgroundPosition === value
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

          {/* Background Repeat */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Repeat
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BG_REPEAT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onChange({ backgroundRepeat: value as any })}
                  className={`
                    px-2 py-1.5 text-xs rounded border
                    ${
                      styles.backgroundRepeat === value
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
        </div>
      )}

      {/* Clear Background */}
      <button
        onClick={() =>
          onChange({
            backgroundColor: undefined,
            backgroundImage: undefined,
            backgroundSize: undefined,
            backgroundPosition: undefined,
            backgroundRepeat: undefined,
          })
        }
        className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        Clear Background
      </button>
    </div>
  );
}
