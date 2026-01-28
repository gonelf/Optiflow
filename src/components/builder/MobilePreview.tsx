/**
 * Mobile Preview Component
 * Displays page preview in different device frames
 */

'use client';

import { useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface Device {
  type: DeviceType;
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<{ className?: string }>;
}

const devices: Device[] = [
  {
    type: 'desktop',
    name: 'Desktop',
    width: 1440,
    height: 900,
    icon: Monitor,
  },
  {
    type: 'tablet',
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: Tablet,
  },
  {
    type: 'mobile',
    name: 'Mobile',
    width: 375,
    height: 667,
    icon: Smartphone,
  },
];

interface MobilePreviewProps {
  pageUrl: string;
  className?: string;
}

export function MobilePreview({ pageUrl, className = '' }: MobilePreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);

  const currentDevice = devices.find(d => d.type === selectedDevice) || devices[0];

  const handleDeviceChange = (deviceType: DeviceType) => {
    setSelectedDevice(deviceType);
    setIsLoading(true);
  };

  const calculateScale = () => {
    const containerWidth = 1200; // Max container width
    const deviceWidth = currentDevice.width;

    if (deviceWidth > containerWidth) {
      return containerWidth / deviceWidth;
    }
    return 1;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Device Selector */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          {devices.map(device => {
            const Icon = device.icon;
            return (
              <button
                key={device.type}
                onClick={() => handleDeviceChange(device.type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  selectedDevice === device.type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{device.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {currentDevice.width} × {currentDevice.height}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
            >
              −
            </button>
            <span className="text-sm font-medium w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(Math.min(2, scale + 0.1))}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-8">
        <div
          className="relative bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
          style={{
            width: currentDevice.width,
            height: currentDevice.height,
            transform: `scale(${calculateScale()})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Device Frame for Mobile/Tablet */}
          {selectedDevice !== 'desktop' && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Top Notch (for mobile) */}
              {selectedDevice === 'mobile' && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-3xl" />
              )}

              {/* Device Border */}
              <div className="absolute inset-0 border-8 border-gray-900 rounded-3xl pointer-events-none" />

              {/* Home Indicator (for mobile) */}
              {selectedDevice === 'mobile' && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full" />
              )}
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}

          {/* Preview iframe */}
          <iframe
            src={pageUrl}
            className="w-full h-full"
            onLoad={() => setIsLoading(false)}
            title={`${currentDevice.name} preview`}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>

      {/* Device Info */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            Viewing as: <span className="font-medium">{currentDevice.name}</span>
          </div>
          <div>
            User Agent:{' '}
            <span className="font-mono">
              {selectedDevice === 'mobile' && 'iPhone Safari'}
              {selectedDevice === 'tablet' && 'iPad Safari'}
              {selectedDevice === 'desktop' && 'Desktop Chrome'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple Mobile Preview Toggle
 * Can be used in the builder toolbar
 */
export function MobilePreviewToggle({
  onPreview,
}: {
  onPreview: (device: DeviceType) => void;
}) {
  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      {devices.map(device => {
        const Icon = device.icon;
        return (
          <button
            key={device.type}
            onClick={() => onPreview(device.type)}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title={`Preview on ${device.name}`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
