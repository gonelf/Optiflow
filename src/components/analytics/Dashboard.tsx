'use client';

/**
 * Analytics Dashboard Component
 * Main analytics dashboard combining all metrics and visualizations
 */

import { useState } from 'react';
import { RealtimeMetrics } from './RealtimeMetrics';
import { TopPages } from './TopPages';
import { TrafficSources } from './TrafficSources';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardProps {
  workspaceSlug: string;
  pageId?: string;
}

export function Dashboard({ workspaceSlug, pageId }: DashboardProps) {
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    endDate: new Date(),
  });

  const dateRangeOptions = [
    {
      label: 'Last 24 Hours',
      value: '24h',
      getRange: () => ({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      }),
    },
    {
      label: 'Last 7 Days',
      value: '7d',
      getRange: () => ({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      }),
    },
    {
      label: 'Last 30 Days',
      value: '30d',
      getRange: () => ({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      }),
    },
    {
      label: 'Last 90 Days',
      value: '90d',
      getRange: () => ({
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your page performance and visitor behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-4 py-2 border rounded-lg bg-white text-sm"
            onChange={(e) => {
              const option = dateRangeOptions.find(o => o.value === e.target.value);
              if (option) {
                setDateRange(option.getRange());
              }
            }}
            defaultValue="24h"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-time metrics */}
      <RealtimeMetrics
        workspaceSlug={workspaceSlug}
        pageId={pageId}
        refreshInterval={30000}
      />

      {/* Detailed analytics tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TopPages
              workspaceSlug={workspaceSlug}
              limit={5}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
            />
            <TrafficSources
              workspaceSlug={workspaceSlug}
              limit={5}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
            />
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <TopPages
            workspaceSlug={workspaceSlug}
            limit={20}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <TrafficSources
            workspaceSlug={workspaceSlug}
            limit={20}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </TabsContent>
      </Tabs>

      {/* Quick links to other analytics pages */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href={`/${workspaceSlug}/analytics/funnels`}
            className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Conversion Funnels</div>
            <div className="text-sm text-gray-600 mt-1">
              Analyze user journey and drop-off points
            </div>
          </a>
          <a
            href={`/${workspaceSlug}/analytics/heatmaps`}
            className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">🔥</div>
            <div className="font-medium">Heatmaps</div>
            <div className="text-sm text-gray-600 mt-1">
              See where users click and scroll
            </div>
          </a>
          <a
            href={`/${workspaceSlug}/analytics/cohorts`}
            className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium">Cohort Analysis</div>
            <div className="text-sm text-gray-600 mt-1">
              Track retention and user segments
            </div>
          </a>
        </div>
      </Card>
    </div>
  );
}
