'use client';

/**
 * Top Pages Component
 * Shows top performing pages by pageviews
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TopPage } from '@/services/analytics/dashboard.service';

interface TopPagesProps {
  workspaceSlug: string;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export function TopPages({
  workspaceSlug,
  limit = 10,
  startDate,
  endDate
}: TopPagesProps) {
  const [pages, setPages] = useState<TopPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopPages = async () => {
      try {
        const params = new URLSearchParams({
          workspaceSlug,
          type: 'pages',
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
          throw new Error('Failed to fetch top pages');
        }

        const data: TopPage[] = await response.json();
        setPages(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTopPages();
  }, [workspaceSlug, limit, startDate, endDate]);

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
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
        <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
        <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
          Error: {error}
        </div>
      </Card>
    );
  }

  if (pages.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
        <div className="text-center py-8 text-gray-500">
          No page data available
        </div>
      </Card>
    );
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 border-b">
              <th className="pb-3 pr-4">Page</th>
              <th className="pb-3 pr-4 text-right">Pageviews</th>
              <th className="pb-3 pr-4 text-right">Visitors</th>
              <th className="pb-3 pr-4 text-right">Conversions</th>
              <th className="pb-3 text-right">Conv. Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map((page, index) => (
              <tr key={page.pageId} className="hover:bg-gray-50">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400 w-6">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-sm">{page.pageName}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {page.pageId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right text-sm font-medium">
                  {formatNumber(page.pageviews)}
                </td>
                <td className="py-3 pr-4 text-right text-sm text-gray-600">
                  {formatNumber(page.uniqueVisitors)}
                </td>
                <td className="py-3 pr-4 text-right text-sm text-gray-600">
                  {formatNumber(page.conversions)}
                </td>
                <td className="py-3 text-right">
                  <span className={`text-sm font-medium ${
                    page.conversionRate >= 5
                      ? 'text-green-600'
                      : page.conversionRate >= 2
                      ? 'text-yellow-600'
                      : 'text-gray-600'
                  }`}>
                    {formatPercentage(page.conversionRate)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
