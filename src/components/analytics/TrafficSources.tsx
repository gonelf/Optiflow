'use client';

/**
 * Traffic Sources Component
 * Shows traffic sources and their performance
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrafficSource } from '@/services/analytics/dashboard.service';

interface TrafficSourcesProps {
  workspaceSlug: string;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export function TrafficSources({
  workspaceSlug,
  limit = 10,
  startDate,
  endDate
}: TrafficSourcesProps) {
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const params = new URLSearchParams({
          workspaceSlug,
          type: 'sources',
          limit: limit.toString(),
        });

        if (startDate) {
          params.append('startDate', startDate.toISOString());
        }
        if (endDate) {
          params.append('endDate', endDate.toISOString());
        }

        const response = await fetch(`/api/analytics/stats?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch traffic sources');
        }

        const data: TrafficSource[] = await response.json();
        setSources(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, [workspaceSlug, limit, startDate, endDate]);

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
        <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
          Error: {error}
        </div>
      </Card>
    );
  }

  if (sources.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
        <div className="text-center py-8 text-gray-500">
          No traffic data available
        </div>
      </Card>
    );
  }

  const totalVisitors = sources.reduce((sum, source) => sum + source.visitors, 0);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const getSourceIcon = (source: string): string => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('google')) return '🔍';
    if (lowerSource.includes('facebook')) return '📘';
    if (lowerSource.includes('twitter') || lowerSource.includes('x.com')) return '🐦';
    if (lowerSource.includes('linkedin')) return '💼';
    if (lowerSource.includes('direct')) return '🔗';
    if (lowerSource.includes('email')) return '📧';
    return '🌐';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
      <div className="space-y-4">
        {sources.map((source, index) => {
          const visitorPercentage = totalVisitors > 0
            ? (source.visitors / totalVisitors) * 100
            : 0;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSourceIcon(source.source)}</span>
                  <div>
                    <div className="font-medium text-sm">
                      {source.source}
                      {source.medium !== 'None' && (
                        <span className="text-gray-500"> / {source.medium}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(source.visitors)} visitors • {formatNumber(source.conversions)} conversions
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatPercentage(visitorPercentage)}
                  </div>
                  <div className={`text-xs ${
                    source.conversionRate >= 5
                      ? 'text-green-600'
                      : source.conversionRate >= 2
                      ? 'text-yellow-600'
                      : 'text-gray-500'
                  }`}>
                    {formatPercentage(source.conversionRate)} conv.
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${visitorPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
