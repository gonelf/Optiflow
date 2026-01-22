'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, Trophy, AlertCircle } from 'lucide-react';
import TestResults from '@/components/ab-testing/TestResults';
import VariantComparison from '@/components/ab-testing/VariantComparison';
import ConfidenceIndicator from '@/components/ab-testing/ConfidenceIndicator';

interface ABTestDetail {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  pageId: string;
  pageName?: string;
  primaryGoal: string;
  conversionEvent: string;
  trafficSplit: Record<string, number>;
  startDate?: string;
  endDate?: string;
  minimumSampleSize: number;
  confidenceLevel: number;
  winningVariantId?: string;
  declaredAt?: string;
  variants: {
    id: string;
    name: string;
    description?: string;
    isControl: boolean;
    impressions: number;
    conversions: number;
    conversionRate: number;
  }[];
  statistics?: {
    hasSignificance: boolean;
    pValue: number;
    confidenceInterval: [number, number];
    recommendedWinner?: string;
    sampleSizeReached: boolean;
  };
}

export default function ABTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;
  const testId = params.testId as string;

  const [test, setTest] = useState<ABTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchTest = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ab-tests/${testId}`);
      if (response.ok) {
        const data = await response.json();
        setTest(data);
      }
    } catch (error) {
      console.error('Failed to fetch A/B test:', error);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    if (testId !== 'new') {
      fetchTest();
    } else {
      setLoading(false);
    }
  }, [testId, fetchTest]);

  const updateTestStatus = async (newStatus: ABTestDetail['status']) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/ab-tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchTest();
      }
    } catch (error) {
      console.error('Failed to update test status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const declareWinner = async (variantId: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/ab-tests/${testId}/declare-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winningVariantId: variantId }),
      });

      if (response.ok) {
        await fetchTest();
      }
    } catch (error) {
      console.error('Failed to declare winner:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (testId === 'new') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create New A/B Test</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">
              Test creator component will be implemented here.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This will include page selection, variant creation, traffic split configuration,
              and goal setup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Test not found</h3>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${workspaceSlug}/ab-tests`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{test.name}</h1>
              {test.description && (
                <p className="text-gray-600 mt-2">{test.description}</p>
              )}
              {test.pageName && (
                <p className="text-sm text-gray-500 mt-1">Page: {test.pageName}</p>
              )}
            </div>

            <div className="flex gap-3">
              {test.status === 'DRAFT' && (
                <Button
                  onClick={() => updateTestStatus('RUNNING')}
                  disabled={updating}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Test
                </Button>
              )}
              {test.status === 'RUNNING' && (
                <>
                  <Button
                    onClick={() => updateTestStatus('PAUSED')}
                    disabled={updating}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                  {test.statistics?.hasSignificance && (
                    <Button
                      onClick={() =>
                        test.statistics?.recommendedWinner &&
                        declareWinner(test.statistics.recommendedWinner)
                      }
                      disabled={updating}
                      className="flex items-center gap-2"
                    >
                      <Trophy className="h-4 w-4" />
                      Declare Winner
                    </Button>
                  )}
                </>
              )}
              {test.status === 'PAUSED' && (
                <Button
                  onClick={() => updateTestStatus('RUNNING')}
                  disabled={updating}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
              )}
            </div>
          </div>
        </div>

        {test.statistics && (
          <div className="mb-6">
            <ConfidenceIndicator
              hasSignificance={test.statistics.hasSignificance}
              pValue={test.statistics.pValue}
              confidenceLevel={test.confidenceLevel}
              sampleSizeReached={test.statistics.sampleSizeReached}
              minimumSampleSize={test.minimumSampleSize}
            />
          </div>
        )}

        <div className="grid gap-6">
          <VariantComparison variants={test.variants} winningVariantId={test.winningVariantId} />
          <TestResults test={test} />
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold mb-3">Test Configuration</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Primary Goal:</span>
              <span className="ml-2 font-medium">{test.primaryGoal}</span>
            </div>
            <div>
              <span className="text-gray-600">Conversion Event:</span>
              <span className="ml-2 font-medium">{test.conversionEvent}</span>
            </div>
            <div>
              <span className="text-gray-600">Minimum Sample Size:</span>
              <span className="ml-2 font-medium">{test.minimumSampleSize.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Confidence Level:</span>
              <span className="ml-2 font-medium">{(test.confidenceLevel * 100).toFixed(0)}%</span>
            </div>
            {test.startDate && (
              <div>
                <span className="text-gray-600">Started:</span>
                <span className="ml-2 font-medium">
                  {new Date(test.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {test.endDate && (
              <div>
                <span className="text-gray-600">Ended:</span>
                <span className="ml-2 font-medium">
                  {new Date(test.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
