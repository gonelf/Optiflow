'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, AlertTriangle, RefreshCw } from 'lucide-react';

interface AiWinnerSuggestionProps {
  testId: string;
  /** Whether the test has enough data to analyse (at least some impressions/conversions) */
  hasData: boolean;
  /** Called when the user clicks "Declare This Winner" */
  onDeclareWinner?: (variantId: string) => void;
}

interface Suggestion {
  recommendedVariantId: string | null;
  recommendedVariantName: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  caveats: string;
}

export default function AiWinnerSuggestion({
  testId,
  hasData,
  onDeclareWinner,
}: AiWinnerSuggestionProps) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskAI = async () => {
    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const response = await fetch(`/api/ab-tests/${testId}/ai-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to get AI suggestion');
        return;
      }

      const data = await response.json();
      setSuggestion(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confidenceColors = {
    high: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-100 text-green-700' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-700' },
    low: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-700' },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">AI Winner Suggestion</h2>
        </div>
        <Button
          type="button"
          onClick={handleAskAI}
          disabled={loading || !hasData}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1.5"
        >
          {loading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {loading ? 'Analysing...' : suggestion ? 'Re-analyse' : 'Ask AI'}
        </Button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Let Gemini analyse your test results and recommend a winner.
      </p>

      {!hasData && !loading && !suggestion && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-sm text-gray-600">
            No data available yet. Start the test and collect some impressions before asking AI for a suggestion.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {suggestion && (() => {
        const colors = confidenceColors[suggestion.confidence];
        return (
          <div className={`rounded-lg border p-5 ${colors.bg} ${colors.border}`}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className={`h-5 w-5 ${colors.text}`} />
                <span className={`font-semibold text-base ${colors.text}`}>
                  Recommended: {suggestion.recommendedVariantName}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors.badge}`}>
                {suggestion.confidence.charAt(0).toUpperCase() + suggestion.confidence.slice(1)} confidence
              </span>
            </div>

            {/* Reasoning */}
            <p className={`text-sm ${colors.text} leading-relaxed`}>
              {suggestion.reasoning}
            </p>

            {/* Caveats */}
            {suggestion.caveats && (
              <div className="mt-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-800">{suggestion.caveats}</p>
              </div>
            )}

            {/* Declare winner action */}
            {onDeclareWinner && suggestion.recommendedVariantId && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => onDeclareWinner(suggestion.recommendedVariantId!)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  Declare &ldquo;{suggestion.recommendedVariantName}&rdquo; as Winner
                </Button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
