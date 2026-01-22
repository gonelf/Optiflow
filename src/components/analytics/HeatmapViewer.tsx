'use client';

/**
 * Heatmap Viewer Component
 * Displays click heatmap and scroll depth analysis
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeatmapData } from '@/services/analytics/heatmap.service';

interface HeatmapViewerProps {
  workspaceSlug: string;
  pageId: string;
  startDate?: Date;
  endDate?: Date;
}

export function HeatmapViewer({
  workspaceSlug,
  pageId,
  startDate,
  endDate
}: HeatmapViewerProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const params = new URLSearchParams({
          workspaceSlug,
          pageId,
          type: 'full',
        });

        if (startDate) {
          params.append('startDate', startDate.toISOString());
        }
        if (endDate) {
          params.append('endDate', endDate.toISOString());
        }

        const response = await fetch(`/api/analytics/heatmaps?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch heatmap data');
        }

        const data: HeatmapData = await response.json();
        setHeatmapData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [workspaceSlug, pageId, startDate, endDate]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading heatmap data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        Error loading heatmap: {error}
      </div>
    );
  }

  if (!heatmapData) {
    return null;
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total Clicks</div>
          <div className="text-2xl font-bold">{formatNumber(heatmapData.totalClicks)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total Visitors</div>
          <div className="text-2xl font-bold">{formatNumber(heatmapData.totalVisitors)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Avg. Scroll Depth</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatPercentage(heatmapData.avgScrollDepth)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Max Scroll Depth</div>
          <div className="text-2xl font-bold text-green-600">
            {formatPercentage(heatmapData.maxScrollDepth)}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="clicks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clicks">Click Heatmap</TabsTrigger>
          <TabsTrigger value="scroll">Scroll Depth</TabsTrigger>
        </TabsList>

        <TabsContent value="clicks">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Click Heatmap</h3>

            {heatmapData.clickHeatmap.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No click data available
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Top clicked areas on the page. Larger circles indicate more clicks.
                </div>

                {/* Click data table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 border-b">
                        <th className="pb-3 pr-4">Position (X, Y)</th>
                        <th className="pb-3 pr-4">Clicks</th>
                        <th className="pb-3 pr-4">Element ID</th>
                        <th className="pb-3">Element Text</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {heatmapData.clickHeatmap.slice(0, 20).map((point, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 pr-4 text-sm font-mono">
                            ({point.x}, {point.y})
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="bg-red-500 rounded-full"
                                style={{
                                  width: `${Math.min(20 + point.count * 2, 40)}px`,
                                  height: `${Math.min(20 + point.count * 2, 40)}px`,
                                  opacity: 0.6,
                                }}
                              />
                              <span className="text-sm font-medium">{point.count}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-sm text-gray-600 font-mono">
                            {point.elementId || '-'}
                          </td>
                          <td className="py-3 text-sm text-gray-600 truncate max-w-xs">
                            {point.elementText || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="scroll">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Scroll Depth Distribution</h3>

            {heatmapData.scrollDepthDistribution.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No scroll data available
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Percentage of visitors who scrolled to each depth level.
                </div>

                {/* Scroll depth bars */}
                <div className="space-y-3">
                  {heatmapData.scrollDepthDistribution.map((data) => (
                    <div key={data.depth}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {data.depth}% - {data.depth + 10}%
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatNumber(data.visitors)} visitors ({formatPercentage(data.percentage)})
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insights */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">💡 Insights</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      • {formatPercentage(heatmapData.avgScrollDepth)} average scroll depth
                    </li>
                    {heatmapData.avgScrollDepth < 50 && (
                      <li className="text-yellow-700">
                        • ⚠️ Most visitors don&apos;t scroll past halfway. Consider moving important content higher.
                      </li>
                    )}
                    {heatmapData.avgScrollDepth > 75 && (
                      <li className="text-green-700">
                        • ✓ Great engagement! Most visitors scroll through most of your content.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
