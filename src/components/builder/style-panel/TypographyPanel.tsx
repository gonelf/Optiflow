// ============================================================================
// PHASE 8: TYPOGRAPHY PANEL
// ============================================================================

'use client';

import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { ElementStyles } from '@/types/styles';

interface TypographyPanelProps {
  styles: Partial<ElementStyles>;
  onChange: (updates: Partial<ElementStyles>) => void;
}

const FONT_FAMILIES = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'ui-sans-serif, system-ui, sans-serif', label: 'System Sans' },
  { value: 'ui-serif, Georgia, serif', label: 'System Serif' },
  { value: 'ui-monospace, monospace', label: 'Monospace' },
];

const FONT_SIZES = [
  { value: '0.75rem', label: 'XS' },
  { value: '0.875rem', label: 'SM' },
  { value: '1rem', label: 'Base' },
  { value: '1.125rem', label: 'LG' },
  { value: '1.25rem', label: 'XL' },
  { value: '1.5rem', label: '2XL' },
  { value: '1.875rem', label: '3XL' },
  { value: '2.25rem', label: '4XL' },
];

const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extrabold' },
];

const TEXT_TRANSFORMS = [
  { value: 'none', label: 'None' },
  { value: 'uppercase', label: 'ABC' },
  { value: 'lowercase', label: 'abc' },
  { value: 'capitalize', label: 'Abc' },
];

export function TypographyPanel({ styles, onChange }: TypographyPanelProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Typography</h4>

      {/* Font Family */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Font Family
        </label>
        <select
          value={styles.fontFamily || FONT_FAMILIES[0].value}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        >
          {FONT_FAMILIES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Font Size
        </label>
        <div className="grid grid-cols-4 gap-2">
          {FONT_SIZES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ fontSize: value })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.fontSize === value
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
          value={styles.fontSize || ''}
          onChange={(e) => onChange({ fontSize: e.target.value })}
          placeholder="Custom (e.g., 16px)"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Font Weight
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FONT_WEIGHTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ fontWeight: value })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.fontWeight === value
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

      {/* Line Height */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Line Height
        </label>
        <input
          type="text"
          value={styles.lineHeight || ''}
          onChange={(e) => onChange({ lineHeight: e.target.value })}
          placeholder="1.5"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {/* Letter Spacing */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Letter Spacing
        </label>
        <input
          type="text"
          value={styles.letterSpacing || ''}
          onChange={(e) => onChange({ letterSpacing: e.target.value })}
          placeholder="0"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {/* Text Align */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Text Align
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onChange({ textAlign: 'left' })}
            className={`
              flex items-center justify-center p-2 rounded border
              ${
                styles.textAlign === 'left'
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            title="Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChange({ textAlign: 'center' })}
            className={`
              flex items-center justify-center p-2 rounded border
              ${
                styles.textAlign === 'center'
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            title="Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChange({ textAlign: 'right' })}
            className={`
              flex items-center justify-center p-2 rounded border
              ${
                styles.textAlign === 'right'
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            title="Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChange({ textAlign: 'justify' })}
            className={`
              flex items-center justify-center p-2 rounded border
              ${
                styles.textAlign === 'justify'
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Text Transform */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Text Transform
        </label>
        <div className="grid grid-cols-4 gap-2">
          {TEXT_TRANSFORMS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ textTransform: value as any })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.textTransform === value
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

      {/* Text Decoration */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Text Decoration
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['none', 'underline', 'line-through'].map((decoration) => (
            <button
              key={decoration}
              onClick={() => onChange({ textDecoration: decoration })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.textDecoration === decoration
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {decoration}
            </button>
          ))}
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Text Color
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={styles.color || '#000000'}
            onChange={(e) => onChange({ color: e.target.value })}
            className="w-12 h-10 rounded border border-gray-300 dark:border-gray-700"
          />
          <input
            type="text"
            value={styles.color || ''}
            onChange={(e) => onChange({ color: e.target.value })}
            placeholder="#000000"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 font-mono"
          />
        </div>
      </div>
    </div>
  );
}
