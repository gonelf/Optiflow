'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';

const TEXT_TYPES = [
  { value: 'headline', label: 'Headline' },
  { value: 'subheadline', label: 'Subheadline' },
  { value: 'cta', label: 'CTA Button' },
  { value: 'body', label: 'Body Copy' },
  { value: 'description', label: 'Description' },
] as const;

type TextType = (typeof TEXT_TYPES)[number]['value'];

interface AiVariantGeneratorProps {
  testName: string;
  testDescription?: string;
  primaryGoal: string;
  /** Called when a user picks a generated variation to use as a variant name/description */
  onVariantSelected?: (variation: string) => void;
}

export default function AiVariantGenerator({
  testName,
  testDescription = '',
  primaryGoal,
  onVariantSelected,
}: AiVariantGeneratorProps) {
  const [textType, setTextType] = useState<TextType>('headline');
  const [originalText, setOriginalText] = useState('');
  const [count, setCount] = useState(3);
  const [variations, setVariations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!originalText.trim()) return;

    setLoading(true);
    setError(null);
    setVariations([]);

    try {
      const response = await fetch('/api/ab-tests/ai-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName,
          testDescription,
          primaryGoal,
          originalText: originalText.trim(),
          textType,
          count,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to generate variations');
        return;
      }

      const data = await response.json();
      setVariations(data.variations);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold">AI Variant Generator</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Use Google Gemini to generate text variations for your A/B test.
      </p>

      {/* Text type selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Type</label>
        <div className="flex flex-wrap gap-2">
          {TEXT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTextType(t.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                textType === t.value
                  ? 'bg-purple-100 border-purple-400 text-purple-800 font-medium'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Original text input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Original Text
        </label>
        <textarea
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          rows={2}
          placeholder={`Enter your current ${textType} text...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Count + Generate */}
      <div className="flex items-end gap-3">
        <div className="flex-1 max-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variations
          </label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !originalText.trim()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Generated variations */}
      {variations.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Generated Variations</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              disabled={loading}
              className="text-purple-600 hover:text-purple-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
          <div className="space-y-2">
            {variations.map((variation, index) => (
              <div
                key={index}
                className="flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-md p-3"
              >
                <span className="text-xs font-semibold text-purple-500 mt-0.5 w-5 shrink-0">
                  {index + 1}.
                </span>
                <p className="flex-1 text-sm text-gray-800">{variation}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(variation, index)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                    title="Copy"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  {onVariantSelected && (
                    <button
                      type="button"
                      onClick={() => onVariantSelected(variation)}
                      className="px-2.5 py-0.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Use
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
