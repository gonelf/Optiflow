// ============================================================================
// PHASE 8: LAYOUT PANEL
// ============================================================================

'use client';

import React from 'react';
import { ElementStyles } from '@/types/styles';

interface LayoutPanelProps {
  styles: Partial<ElementStyles>;
  onChange: (updates: Partial<ElementStyles>) => void;
}

const DISPLAY_OPTIONS = [
  { value: 'block', label: 'Block' },
  { value: 'flex', label: 'Flex' },
  { value: 'grid', label: 'Grid' },
  { value: 'inline-block', label: 'Inline Block' },
  { value: 'none', label: 'None' },
];

const POSITION_OPTIONS = [
  { value: 'static', label: 'Static' },
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'sticky', label: 'Sticky' },
];

export function LayoutPanel({ styles, onChange }: LayoutPanelProps) {
  const currentDisplay = styles.display || 'block';

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Layout</h4>

      {/* Display Mode */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Display
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DISPLAY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ display: value as any })}
              className={`
                px-3 py-2 text-sm rounded border
                ${
                  currentDisplay === value
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

      {/* Flexbox Controls */}
      {currentDisplay === 'flex' && (
        <FlexboxControls styles={styles} onChange={onChange} />
      )}

      {/* Grid Controls */}
      {currentDisplay === 'grid' && (
        <GridControls styles={styles} onChange={onChange} />
      )}

      {/* Position */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Position
        </label>
        <select
          value={styles.position || 'static'}
          onChange={(e) => onChange({ position: e.target.value as any })}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        >
          {POSITION_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Position Offsets (for absolute, fixed, sticky) */}
      {styles.position && ['absolute', 'fixed', 'sticky'].includes(styles.position) && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Position Offsets
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Top</label>
              <input
                type="text"
                value={styles.top || ''}
                onChange={(e) => onChange({ top: e.target.value })}
                placeholder="auto"
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Right</label>
              <input
                type="text"
                value={styles.right || ''}
                onChange={(e) => onChange({ right: e.target.value })}
                placeholder="auto"
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Bottom</label>
              <input
                type="text"
                value={styles.bottom || ''}
                onChange={(e) => onChange({ bottom: e.target.value })}
                placeholder="auto"
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Left</label>
              <input
                type="text"
                value={styles.left || ''}
                onChange={(e) => onChange({ left: e.target.value })}
                placeholder="auto"
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Z-Index */}
      {styles.position && styles.position !== 'static' && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Z-Index
          </label>
          <input
            type="number"
            value={styles.zIndex || ''}
            onChange={(e) => onChange({ zIndex: parseInt(e.target.value) || 0 })}
            placeholder="auto"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
        </div>
      )}
    </div>
  );
}

// Flexbox Controls Sub-component
function FlexboxControls({ styles, onChange }: LayoutPanelProps) {
  return (
    <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded">
      <h5 className="text-xs font-semibold text-blue-700 dark:text-blue-300">
        Flexbox
      </h5>

      {/* Direction */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Direction
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['row', 'column', 'row-reverse', 'column-reverse'].map((dir) => (
            <button
              key={dir}
              onClick={() => onChange({ flexDirection: dir as any })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.flexDirection === dir
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>

      {/* Justify Content */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Justify Content
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['start', 'center', 'end', 'between', 'around', 'evenly'].map((justify) => (
            <button
              key={justify}
              onClick={() => onChange({ justifyContent: justify as any })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.justifyContent === justify
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {justify}
            </button>
          ))}
        </div>
      </div>

      {/* Align Items */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Align Items
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['start', 'center', 'end', 'stretch', 'baseline'].map((align) => (
            <button
              key={align}
              onClick={() => onChange({ alignItems: align as any })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.alignItems === align
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {/* Gap */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Gap
        </label>
        <input
          type="text"
          value={styles.gap || ''}
          onChange={(e) => onChange({ gap: e.target.value })}
          placeholder="0"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {/* Wrap */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Wrap
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['nowrap', 'wrap', 'wrap-reverse'].map((wrap) => (
            <button
              key={wrap}
              onClick={() => onChange({ flexWrap: wrap as any })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.flexWrap === wrap
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {wrap}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Grid Controls Sub-component
function GridControls({ styles, onChange }: LayoutPanelProps) {
  return (
    <div className="space-y-3 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded">
      <h5 className="text-xs font-semibold text-purple-700 dark:text-purple-300">
        Grid
      </h5>

      {/* Template Columns */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Template Columns
        </label>
        <input
          type="text"
          value={styles.gridTemplateColumns || ''}
          onChange={(e) => onChange({ gridTemplateColumns: e.target.value })}
          placeholder="repeat(3, 1fr)"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 font-mono"
        />
      </div>

      {/* Template Rows */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Template Rows
        </label>
        <input
          type="text"
          value={styles.gridTemplateRows || ''}
          onChange={(e) => onChange({ gridTemplateRows: e.target.value })}
          placeholder="auto"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 font-mono"
        />
      </div>

      {/* Gap */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Gap
        </label>
        <input
          type="text"
          value={styles.gap || ''}
          onChange={(e) => onChange({ gap: e.target.value })}
          placeholder="1rem"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {/* Auto Flow */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Auto Flow
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['row', 'column', 'dense', 'row dense', 'column dense'].map((flow) => (
            <button
              key={flow}
              onClick={() => onChange({ gridAutoFlow: flow as any })}
              className={`
                px-2 py-1.5 text-xs rounded border
                ${
                  styles.gridAutoFlow === flow
                    ? 'bg-purple-100 dark:bg-purple-900 border-purple-500'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {flow}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Quick Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onChange({ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' })}
            className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            2 Columns
          </button>
          <button
            onClick={() => onChange({ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' })}
            className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            3 Columns
          </button>
        </div>
      </div>
    </div>
  );
}
