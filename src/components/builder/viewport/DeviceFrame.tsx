// ============================================================================
// PHASE 8: DEVICE FRAME
// ============================================================================

'use client';

import React from 'react';
import { Monitor, Tablet, Smartphone, Maximize2 } from 'lucide-react';
import { useElementStore } from '@/store/element.store';
import { getDeviceFrameDimensions } from '@/lib/styles/responsive-utils';

const DEVICE_OPTIONS = [
  { device: 'none' as const, label: 'Full', icon: Maximize2 },
  { device: 'mobile' as const, label: 'Mobile', icon: Smartphone },
  { device: 'tablet' as const, label: 'Tablet', icon: Tablet },
  { device: 'desktop' as const, label: 'Desktop', icon: Monitor },
];

export function DeviceFrame() {
  const { viewport, setDeviceFrame } = useElementStore();
  const currentDevice = viewport.deviceFrame;

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
      {DEVICE_OPTIONS.map(({ device, label, icon: Icon }) => {
        const isActive = currentDevice === device;
        const dimensions = device !== 'none' ? getDeviceFrameDimensions(device) : null;

        return (
          <button
            key={device}
            onClick={() => setDeviceFrame(device)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors
              ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            title={dimensions ? `${label} (${dimensions.width}×${dimensions.height})` : label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
