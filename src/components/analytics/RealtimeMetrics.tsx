'use client';

/**
 * Real-time Metrics Component
 * Displays current visitors and key metrics with auto-refresh
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DashboardMetrics } from '@/services/analytics/dashboard.service';

interface RealtimeMetricsProps {
  workspaceSlug: string;
  pageId?: string;
  refreshInterval?: number; // milliseconds, default 30000 (30s)
}

export function RealtimeMetrics({
  workspaceSlug,
  pageId,
  refreshInterval = 30000
}: RealtimeMetricsProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const params = new URLSearchParams({
        workspaceSlug,
        type: 'dashboard',
      });

      if (pageId) {
        params.append('pageId', pageId);
      }

      const response = await fetch(`/api/analytics/stats?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data: DashboardMetrics = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMetrics();

    // Set up auto-refresh
    const interval = setInterval(fetchMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [workspaceSlug, pageId, refreshInterval]);

  if (loading && !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        Error loading metrics: {error}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const metricCards = [
    {
      label: 'Current Visitors',
      value: formatNumber(metrics.currentVisitors),
      description: 'Active in last 5 minutes',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Pageviews',
      value: formatNumber(metrics.totalPageviews),
      description: `${formatNumber(metrics.uniqueVisitors)} unique visitors`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Conversions',
      value: formatNumber(metrics.totalConversions),
      description: `${formatPercentage(metrics.conversionRate)} conversion rate`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Avg. Session',
      value: formatDuration(metrics.avgSessionDuration),
      description: `${formatPercentage(metrics.bounceRate)} bounce rate`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Real-time Analytics</h2>
          <p className="text-sm text-gray-600">Last 24 hours</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Auto-refreshing every {refreshInterval / 1000}s
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex flex-col">
              <div className="text-sm font-medium text-gray-600 mb-1">
                {metric.label}
              </div>
              <div className={`text-3xl font-bold ${metric.color} mb-2`}>
                {metric.value}
              </div>
              <div className="text-xs text-gray-500">
                {metric.description}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
