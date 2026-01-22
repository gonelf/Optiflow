'use client';

/**
 * Conversion Funnel Visualization Component
 * Displays funnel analysis results with drop-off visualization
 */

import { Card } from '@/components/ui/card';
import { FunnelAnalysis } from '@/services/analytics/funnel.service';

interface ConversionFunnelProps {
  analysis: FunnelAnalysis;
}

export function ConversionFunnel({ analysis }: ConversionFunnelProps) {
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const maxVisitors = analysis.steps[0]?.uniqueVisitors || 1;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Funnel Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Started</div>
            <div className="text-2xl font-bold">{formatNumber(analysis.totalStarted)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(analysis.totalCompleted)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatPercentage(analysis.overallConversionRate)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Avg. Completion Time</div>
            <div className="text-2xl font-bold text-purple-600">
              {formatTime(analysis.avgCompletionTime)}
            </div>
          </div>
        </div>
      </Card>

      {/* Funnel visualization */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Funnel Steps</h3>
        <div className="space-y-4">
          {analysis.steps.map((stepResult, index) => {
            const widthPercentage = (stepResult.uniqueVisitors / maxVisitors) * 100;
            const isLastStep = index === analysis.steps.length - 1;

            return (
              <div key={stepResult.step.id}>
                {/* Step info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{stepResult.step.name}</div>
                      <div className="text-xs text-gray-500">
                        {stepResult.step.eventType}
                        {stepResult.step.elementId && ` • ${stepResult.step.elementId}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {formatNumber(stepResult.uniqueVisitors)}
                    </div>
                    <div className="text-xs text-gray-500">visitors</div>
                  </div>
                </div>

                {/* Funnel bar */}
                <div className="relative mb-2">
                  <div className="w-full bg-gray-100 rounded">
                    <div
                      className={`h-12 rounded flex items-center justify-between px-4 transition-all ${
                        isLastStep
                          ? 'bg-green-500'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}
                      style={{ width: `${widthPercentage}%` }}
                    >
                      <span className="text-white font-medium text-sm">
                        {formatPercentage(stepResult.completionRate)} completed
                      </span>
                      {stepResult.avgTimeToComplete > 0 && (
                        <span className="text-white text-xs">
                          {formatTime(stepResult.avgTimeToComplete)} avg time
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drop-off indicator */}
                {!isLastStep && stepResult.dropoffRate > 0 && (
                  <div className="flex items-center gap-2 text-sm ml-11">
                    <span className="text-red-600 font-medium">
                      ↓ {formatPercentage(stepResult.dropoffRate)} drop-off
                    </span>
                    <span className="text-gray-500">
                      ({formatNumber(stepResult.totalVisitors - stepResult.uniqueVisitors)} visitors)
                    </span>
                  </div>
                )}

                {!isLastStep && (
                  <div className="h-8 flex items-center justify-center">
                    <div className="text-gray-300 text-2xl">↓</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step-by-step metrics table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 border-b">
                <th className="pb-3 pr-4">Step</th>
                <th className="pb-3 pr-4 text-right">Visitors</th>
                <th className="pb-3 pr-4 text-right">Completion Rate</th>
                <th className="pb-3 pr-4 text-right">Drop-off Rate</th>
                <th className="pb-3 text-right">Avg. Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {analysis.steps.map((stepResult, index) => (
                <tr key={stepResult.step.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-medium text-sm">{stepResult.step.name}</div>
                        <div className="text-xs text-gray-500">{stepResult.step.eventType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right text-sm font-medium">
                    {formatNumber(stepResult.uniqueVisitors)}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-sm font-medium text-green-600">
                      {formatPercentage(stepResult.completionRate)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`text-sm font-medium ${
                      stepResult.dropoffRate > 50 ? 'text-red-600' :
                      stepResult.dropoffRate > 25 ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {formatPercentage(stepResult.dropoffRate)}
                    </span>
                  </td>
                  <td className="py-3 text-right text-sm text-gray-600">
                    {stepResult.avgTimeToComplete > 0
                      ? formatTime(stepResult.avgTimeToComplete)
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
