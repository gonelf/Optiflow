// ============================================================================
// PHASE 8: BOX MODEL EDITOR
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Link2, Link2Off } from 'lucide-react';
import { ElementStyles } from '@/types/styles';

interface BoxModelEditorProps {
  styles: Partial<ElementStyles>;
  onChange: (updates: Partial<ElementStyles>) => void;
}

type BoxSide = 'top' | 'right' | 'bottom' | 'left';

export function BoxModelEditor({ styles, onChange }: BoxModelEditorProps) {
  const [marginLinked, setMarginLinked] = useState(true);
  const [paddingLinked, setPaddingLinked] = useState(true);

  // Parse values
  const parseValue = (value: string | undefined): number => {
    if (!value) return 0;
    return parseInt(value.replace(/[^\d.-]/g, '')) || 0;
  };

  const margin = {
    top: parseValue(styles.marginTop),
    right: parseValue(styles.marginRight),
    bottom: parseValue(styles.marginBottom),
    left: parseValue(styles.marginLeft),
  };

  const padding = {
    top: parseValue(styles.paddingTop),
    right: parseValue(styles.paddingRight),
    bottom: parseValue(styles.paddingBottom),
    left: parseValue(styles.paddingLeft),
  };

  const handleMarginChange = (side: BoxSide, value: string) => {
    const numValue = parseInt(value) || 0;

    if (marginLinked) {
      onChange({
        marginTop: `${numValue}px`,
        marginRight: `${numValue}px`,
        marginBottom: `${numValue}px`,
        marginLeft: `${numValue}px`,
      });
    } else {
      onChange({
        [`margin${side.charAt(0).toUpperCase()}${side.slice(1)}`]: `${numValue}px`,
      });
    }
  };

  const handlePaddingChange = (side: BoxSide, value: string) => {
    const numValue = parseInt(value) || 0;

    if (paddingLinked) {
      onChange({
        paddingTop: `${numValue}px`,
        paddingRight: `${numValue}px`,
        paddingBottom: `${numValue}px`,
        paddingLeft: `${numValue}px`,
      });
    } else {
      onChange({
        [`padding${side.charAt(0).toUpperCase()}${side.slice(1)}`]: `${numValue}px`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Box Model</h4>

      {/* Visual Box Model */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        {/* Margin */}
        <div className="p-4 bg-orange-100 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
              Margin
            </span>
            <button
              onClick={() => setMarginLinked(!marginLinked)}
              className="p-1 hover:bg-orange-200 dark:hover:bg-orange-800 rounded"
              title={marginLinked ? 'Unlink sides' : 'Link sides'}
            >
              {marginLinked ? (
                <Link2 className="w-3 h-3 text-orange-700 dark:text-orange-300" />
              ) : (
                <Link2Off className="w-3 h-3 text-orange-700 dark:text-orange-300" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <div />
            <input
              type="number"
              value={margin.top}
              onChange={(e) => handleMarginChange('top', e.target.value)}
              className="w-full px-2 py-1 text-xs text-center border border-orange-300 dark:border-orange-700 rounded bg-white dark:bg-gray-800"
              placeholder="0"
            />
            <div />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="number"
              value={margin.left}
              onChange={(e) => handleMarginChange('left', e.target.value)}
              className="w-full px-2 py-1 text-xs text-center border border-orange-300 dark:border-orange-700 rounded bg-white dark:bg-gray-800"
              placeholder="0"
            />

            {/* Padding */}
            <div className="p-3 bg-green-100 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  Padding
                </span>
                <button
                  onClick={() => setPaddingLinked(!paddingLinked)}
                  className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded"
                  title={paddingLinked ? 'Unlink sides' : 'Link sides'}
                >
                  {paddingLinked ? (
                    <Link2 className="w-3 h-3 text-green-700 dark:text-green-300" />
                  ) : (
                    <Link2Off className="w-3 h-3 text-green-700 dark:text-green-300" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1 mb-1">
                <div />
                <input
                  type="number"
                  value={padding.top}
                  onChange={(e) => handlePaddingChange('top', e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-center border border-green-300 dark:border-green-700 rounded bg-white dark:bg-gray-800"
                  placeholder="0"
                />
                <div />
              </div>

              <div className="grid grid-cols-3 gap-1 mb-1">
                <input
                  type="number"
                  value={padding.left}
                  onChange={(e) => handlePaddingChange('left', e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-center border border-green-300 dark:border-green-700 rounded bg-white dark:bg-gray-800"
                  placeholder="0"
                />

                {/* Content */}
                <div className="flex items-center justify-center bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded text-xs text-blue-700 dark:text-blue-300 py-2">
                  Content
                </div>

                <input
                  type="number"
                  value={padding.right}
                  onChange={(e) => handlePaddingChange('right', e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-center border border-green-300 dark:border-green-700 rounded bg-white dark:bg-gray-800"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-3 gap-1">
                <div />
                <input
                  type="number"
                  value={padding.bottom}
                  onChange={(e) => handlePaddingChange('bottom', e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-center border border-green-300 dark:border-green-700 rounded bg-white dark:bg-gray-800"
                  placeholder="0"
                />
                <div />
              </div>
            </div>

            <input
              type="number"
              value={margin.right}
              onChange={(e) => handleMarginChange('right', e.target.value)}
              className="w-full px-2 py-1 text-xs text-center border border-orange-300 dark:border-orange-700 rounded bg-white dark:bg-gray-800"
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div />
            <input
              type="number"
              value={margin.bottom}
              onChange={(e) => handleMarginChange('bottom', e.target.value)}
              className="w-full px-2 py-1 text-xs text-center border border-orange-300 dark:border-orange-700 rounded bg-white dark:bg-gray-800"
              placeholder="0"
            />
            <div />
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Quick Presets
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onChange({
              marginTop: '0px',
              marginRight: '0px',
              marginBottom: '0px',
              marginLeft: '0px',
              paddingTop: '0px',
              paddingRight: '0px',
              paddingBottom: '0px',
              paddingLeft: '0px',
            })}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Reset All
          </button>
          <button
            onClick={() => onChange({
              paddingTop: '16px',
              paddingRight: '16px',
              paddingBottom: '16px',
              paddingLeft: '16px',
            })}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Padding 16px
          </button>
        </div>
      </div>
    </div>
  );
}
