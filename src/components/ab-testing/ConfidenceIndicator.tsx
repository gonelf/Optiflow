'use client';

import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface ConfidenceIndicatorProps {
  hasSignificance: boolean;
  pValue: number;
  confidenceLevel: number;
  sampleSizeReached: boolean;
  minimumSampleSize: number;
}

export default function ConfidenceIndicator({
  hasSignificance,
  pValue,
  confidenceLevel,
  sampleSizeReached,
  minimumSampleSize,
}: ConfidenceIndicatorProps) {
  const getStatus = () => {
    if (!sampleSizeReached) {
      return {
        icon: <Info className="h-5 w-5" />,
        color: 'blue',
        title: 'Collecting Data',
        message: 'Minimum sample size not reached yet. Keep the test running.',
      };
    }

    if (hasSignificance) {
      return {
        icon: <CheckCircle className="h-5 w-5" />,
        color: 'green',
        title: 'Statistically Significant',
        message: 'Results are reliable. You can declare a winner with confidence.',
      };
    }

    return {
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'yellow',
      title: 'Not Significant',
      message: 'Results are not conclusive yet. Continue the test for more data.',
    };
  };

  const status = getStatus();

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconBg: 'bg-blue-100',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconBg: 'bg-green-100',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      iconBg: 'bg-yellow-100',
    },
  };

  const colors = colorClasses[status.color as keyof typeof colorClasses];

  return (
    <div
      className={`rounded-lg border p-6 ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
          {status.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${colors.text}`}>
            {status.title}
          </h3>
          <p className={`text-sm mt-1 ${colors.text} opacity-90`}>
            {status.message}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <div className="text-xs opacity-75">P-Value</div>
              <div className={`font-semibold ${colors.text}`}>
                {pValue.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-75">Confidence Level</div>
              <div className={`font-semibold ${colors.text}`}>
                {(confidenceLevel * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-xs opacity-75">Significance</div>
              <div className={`font-semibold ${colors.text}`}>
                {hasSignificance ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-75">Sample Size</div>
              <div className={`font-semibold ${colors.text}`}>
                {sampleSizeReached ? 'Reached' : 'In Progress'}
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs opacity-75">
            <strong>Note:</strong> Statistical significance is calculated using a two-tailed
            z-test. A p-value less than {(1 - confidenceLevel).toFixed(2)} indicates significance
            at the {(confidenceLevel * 100).toFixed(0)}% confidence level.
          </div>
        </div>
      </div>
    </div>
  );
}
