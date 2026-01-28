// ============================================================================
// PHASE 8: BREAKPOINT SELECTOR
// ============================================================================

'use client';

import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { useElementStore } from '@/store/element.store';
import { Breakpoint } from '@/types/styles';
import { DEFAULT_BREAKPOINTS } from '@/lib/styles/responsive-utils';

const BREAKPOINT_OPTIONS: Array<{
  breakpoint: Breakpoint;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  width: string;
}> = [
  { breakpoint: 'base', label: 'Mobile', icon: Smartphone, width: '375px' },
  { breakpoint: 'sm', label: 'SM', icon: Smartphone, width: '640px' },
  { breakpoint: 'md', label: 'MD', icon: Tablet, width: '768px' },
  { breakpoint: 'lg', label: 'LG', icon: Tablet, width: '1024px' },
  { breakpoint: 'xl', label: 'XL', icon: Monitor, width: '1280px' },
  { breakpoint: '2xl', label: '2XL', icon: Monitor, width: '1536px' },
];

export function BreakpointSelector() {
  const { viewport, setBreakpoint } = useElementStore();
  const currentBreakpoint = viewport.breakpoint;

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
      {BREAKPOINT_OPTIONS.map(({ breakpoint, label, icon: Icon, width }) => {
        const isActive = currentBreakpoint === breakpoint;

        return (
          <button
            key={breakpoint}
            onClick={() => setBreakpoint(breakpoint)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors
              ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            title={`${label} (${width})`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
