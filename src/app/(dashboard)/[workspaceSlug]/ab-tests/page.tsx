'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Play, Pause, Trophy, BarChart } from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  pageId: string;
  pageName?: string;
  startDate?: string;
  endDate?: string;
  variants: {
    id: string;
    name: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
  }[];
  winningVariantId?: string;
}

export default function ABTestsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;

  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ab-tests?workspaceSlug=${workspaceSlug}`);
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests || []);
      }
    } catch (error) {
      console.error('Failed to fetch A/B tests:', error);
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ABTest['status']) => {
    switch (status) {
      case 'RUNNING':
        return <Play className="h-4 w-4" />;
      case 'COMPLETED':
        return <Trophy className="h-4 w-4" />;
      case 'PAUSED':
        return <Pause className="h-4 w-4" />;
      default:
        return <BarChart className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">A/B Tests</h1>
          <p className="text-gray-600 mt-2">
            Create and manage A/B tests to optimize your pages
          </p>
        </div>
        <Button
          onClick={() => router.push(`/${workspaceSlug}/ab-tests/new`)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New A/B Test
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BarChart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No A/B tests yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first A/B test
          </p>
          <Button
            onClick={() => router.push(`/${workspaceSlug}/ab-tests/new`)}
            className="mt-4"
          >
            Create A/B Test
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/${workspaceSlug}/ab-tests/${test.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{test.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        test.status
                      )}`}
                    >
                      {getStatusIcon(test.status)}
                      {test.status}
                    </span>
                  </div>
                  {test.description && (
                    <p className="text-gray-600 text-sm">{test.description}</p>
                  )}
                  {test.pageName && (
                    <p className="text-gray-500 text-sm mt-1">
                      Page: {test.pageName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                {test.variants.slice(0, 3).map((variant) => (
                  <div
                    key={variant.id}
                    className="bg-gray-50 rounded p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{variant.name}</span>
                      {test.winningVariantId === variant.id && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Impressions: {variant.impressions.toLocaleString()}</div>
                      <div>Conversions: {variant.conversions.toLocaleString()}</div>
                      <div className="font-medium text-gray-900">
                        CR: {(variant.conversionRate * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {test.startDate && (
                <div className="mt-4 text-xs text-gray-500">
                  Started: {new Date(test.startDate).toLocaleDateString()}
                  {test.endDate &&
                    ` • Ended: ${new Date(test.endDate).toLocaleDateString()}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
