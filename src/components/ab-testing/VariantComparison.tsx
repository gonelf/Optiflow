'use client';

import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  description?: string;
  isControl: boolean;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

interface VariantComparisonProps {
  variants: Variant[];
  winningVariantId?: string;
}

export default function VariantComparison({ variants, winningVariantId }: VariantComparisonProps) {
  const controlVariant = variants.find((v) => v.isControl);
  const sortedVariants = [...variants].sort((a, b) => b.conversionRate - a.conversionRate);

  const getRelativePerformance = (variant: Variant) => {
    if (!controlVariant || variant.id === controlVariant.id) return null;

    const diff = variant.conversionRate - controlVariant.conversionRate;
    const percentChange = controlVariant.conversionRate > 0
      ? (diff / controlVariant.conversionRate) * 100
      : 0;

    return {
      diff,
      percentChange,
      isPositive: diff > 0,
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-6">Variant Comparison</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Variant</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">Impressions</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">Conversions</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Conversion Rate
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                vs Control
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedVariants.map((variant, index) => {
              const performance = getRelativePerformance(variant);
              const isWinner = winningVariantId === variant.id;

              return (
                <tr
                  key={variant.id}
                  className={`border-b border-gray-100 ${
                    isWinner ? 'bg-yellow-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {isWinner && <Trophy className="h-4 w-4 text-yellow-500" />}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {variant.name}
                          {variant.isControl && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Control
                            </span>
                          )}
                        </div>
                        {variant.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {variant.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {variant.impressions.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {variant.conversions.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-medium">
                      {(variant.conversionRate * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {performance ? (
                      <div
                        className={`flex items-center justify-end gap-1 ${
                          performance.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {performance.isPositive ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {performance.isPositive ? '+' : ''}
                          {performance.percentChange.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {variants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No variants created yet
        </div>
      )}
    </div>
  );
}
