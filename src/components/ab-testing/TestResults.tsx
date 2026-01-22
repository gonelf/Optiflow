'use client';

import { BarChart3, Users, Target, TrendingUp } from 'lucide-react';

interface TestResultsProps {
  test: {
    id: string;
    name: string;
    status: string;
    variants: {
      id: string;
      name: string;
      impressions: number;
      conversions: number;
      conversionRate: number;
    }[];
    startDate?: string;
    endDate?: string;
  };
}

export default function TestResults({ test }: TestResultsProps) {
  const totalImpressions = test.variants.reduce((sum, v) => sum + v.impressions, 0);
  const totalConversions = test.variants.reduce((sum, v) => sum + v.conversions, 0);
  const averageConversionRate =
    totalImpressions > 0 ? totalConversions / totalImpressions : 0;

  const bestVariant = test.variants.reduce((best, current) =>
    current.conversionRate > best.conversionRate ? current : best
  , test.variants[0]);

  const controlVariant = test.variants.find((v) => v.name.toLowerCase().includes('control'));
  const improvement = controlVariant && bestVariant.id !== controlVariant.id
    ? ((bestVariant.conversionRate - controlVariant.conversionRate) / controlVariant.conversionRate) * 100
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-6">Test Results Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm text-blue-600 font-medium">Total Visitors</div>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {totalImpressions.toLocaleString()}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-sm text-green-600 font-medium">Total Conversions</div>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {totalConversions.toLocaleString()}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-sm text-purple-600 font-medium">Avg. Conversion Rate</div>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {(averageConversionRate * 100).toFixed(2)}%
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-sm text-orange-600 font-medium">Best Performance</div>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {improvement > 0 ? `+${improvement.toFixed(1)}%` : '—'}
          </div>
          {bestVariant && (
            <div className="text-xs text-orange-600 mt-1">{bestVariant.name}</div>
          )}
        </div>
      </div>

      {test.status === 'RUNNING' && (
        <div className="mt-6 bg-blue-50 rounded p-4 border border-blue-200">
          <div className="flex items-start gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Test is Currently Running</div>
              <div className="text-sm text-blue-700 mt-1">
                Data is being collected in real-time. Check back regularly for updated statistics.
                {test.startDate && (
                  <span className="block mt-1">
                    Running since: {new Date(test.startDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {test.status === 'COMPLETED' && (
        <div className="mt-6 bg-green-50 rounded p-4 border border-green-200">
          <div className="flex items-start gap-2">
            <Target className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium text-green-900">Test Completed</div>
              <div className="text-sm text-green-700 mt-1">
                This test has been completed and a winner has been declared.
                {test.endDate && (
                  <span className="block mt-1">
                    Ended: {new Date(test.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
