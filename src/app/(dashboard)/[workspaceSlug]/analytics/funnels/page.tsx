'use client';

/**
 * Conversion Funnels Page
 * Create and analyze conversion funnels
 */

import { useState } from 'react';
import { FunnelBuilder } from '@/components/analytics/FunnelBuilder';
import { ConversionFunnel } from '@/components/analytics/ConversionFunnel';
import { FunnelStep, FunnelAnalysis } from '@/services/analytics/funnel.service';

interface FunnelsPageProps {
  params: {
    workspaceSlug: string;
  };
}

export default function FunnelsPage({ params }: FunnelsPageProps) {
  const [analysis, setAnalysis] = useState<FunnelAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (steps: FunnelStep[]) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        workspaceSlug: params.workspaceSlug,
        type: 'analyze',
        steps: JSON.stringify(steps),
      });

      const response = await fetch(`/api/analytics/funnels?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to analyze funnel');
      }

      const data: FunnelAnalysis = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Conversion Funnels</h1>
        <p className="text-gray-600 mt-1">
          Track user journeys and identify drop-off points
        </p>
      </div>

      <div className="space-y-6">
        <FunnelBuilder onAnalyze={handleAnalyze} />

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Analyzing funnel...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg">
            Error: {error}
          </div>
        )}

        {analysis && !loading && (
          <ConversionFunnel analysis={analysis} />
        )}

        {!analysis && !loading && !error && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p>Build a funnel above and click &quot;Analyze Funnel&quot; to see results</p>
          </div>
        )}
      </div>
    </div>
  );
}
