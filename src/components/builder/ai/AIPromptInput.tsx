'use client';

/**
 * AI Prompt Input Component
 * Allows users to generate pages using AI
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { GeneratedPage } from '@/services/ai/generator.service';

interface AIPromptInputProps {
  workspaceId: string;
  onPageGenerated: (page: GeneratedPage) => void;
  onClose?: () => void;
}

export function AIPromptInput({
  workspaceId,
  onPageGenerated,
  onClose,
}: AIPromptInputProps) {
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [pageType, setPageType] = useState<'landing' | 'pricing' | 'about' | 'contact' | 'blog' | 'product'>('landing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a page description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          industry: industry || undefined,
          targetAudience: targetAudience || undefined,
          brandVoice: brandVoice || undefined,
          pageType,
          workspaceId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate page');
      }

      const data = await response.json();
      onPageGenerated(data.page);

      // Reset form
      setDescription('');
      setIndustry('');
      setTargetAudience('');
      setBrandVoice('');
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate page');
    } finally {
      setIsGenerating(false);
    }
  };

  const examples = [
    {
      description: 'A landing page for a B2B SaaS project management tool',
      industry: 'Software',
      audience: 'Project managers and team leads',
    },
    {
      description: 'Pricing page for a fitness app with 3 subscription tiers',
      industry: 'Health & Fitness',
      audience: 'Health-conscious individuals',
    },
    {
      description: 'About page for a sustainable fashion brand',
      industry: 'E-commerce',
      audience: 'Eco-conscious shoppers',
    },
  ];

  const loadExample = (example: typeof examples[0]) => {
    setDescription(example.description);
    setIndustry(example.industry);
    setTargetAudience(example.audience);
  };

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Generate Page with AI</h3>
        <p className="text-sm text-gray-600">
          Describe your page and let AI create it for you
        </p>
      </div>

      {/* Quick Examples */}
      <div className="mb-6">
        <Label className="text-sm text-gray-600 mb-2 block">
          Try an example:
        </Label>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => loadExample(example)}
              disabled={isGenerating}
            >
              {example.description.substring(0, 40)}...
            </Button>
          ))}
        </div>
      </div>

      {/* Main Description */}
      <div className="mb-4">
        <Label className="mb-2 block">
          Page Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the page you want to create (e.g., 'A landing page for a B2B SaaS product that helps teams collaborate better')"
          rows={4}
          disabled={isGenerating}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Be specific about your product/service and what you want to achieve
        </p>
      </div>

      {/* Page Type */}
      <div className="mb-4">
        <Label className="mb-2 block">Page Type</Label>
        <select
          value={pageType}
          onChange={(e) => setPageType(e.target.value as any)}
          disabled={isGenerating}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="landing">Landing Page</option>
          <option value="pricing">Pricing Page</option>
          <option value="about">About Page</option>
          <option value="contact">Contact Page</option>
          <option value="product">Product Page</option>
          <option value="blog">Blog Post</option>
        </select>
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label className="mb-2 block text-sm">Industry (optional)</Label>
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g., SaaS, E-commerce"
            disabled={isGenerating}
          />
        </div>

        <div>
          <Label className="mb-2 block text-sm">Target Audience (optional)</Label>
          <Input
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., Small businesses"
            disabled={isGenerating}
          />
        </div>

        <div>
          <Label className="mb-2 block text-sm">Brand Voice (optional)</Label>
          <Input
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="e.g., Professional, Friendly"
            disabled={isGenerating}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
        >
          {isGenerating ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Generating...
            </>
          ) : (
            'Generate Page'
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> AI-generated pages are a starting point. You can
          customize and refine the content using the visual editor after generation.
        </p>
      </div>
    </Card>
  );
}
