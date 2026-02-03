'use client';

/**
 * AI Prompt Input Component
 * Allows users to generate pages using AI
 *
 * Enhanced with Advanced Approach: Real-world examples and design styles
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { GeneratedPage } from '@/services/ai/generator.service';

// Design styles available for generation
const DESIGN_STYLES = [
  { value: 'minimal', label: 'Minimal', description: 'Clean and simple' },
  { value: 'bold', label: 'Bold', description: 'High-impact and dramatic' },
  { value: 'corporate', label: 'Corporate', description: 'Professional and trustworthy' },
  { value: 'playful', label: 'Playful', description: 'Fun and engaging' },
  { value: 'neobrutalist', label: 'Neobrutalist', description: 'Raw and unconventional' },
  { value: 'glassmorphism', label: 'Glassmorphism', description: 'Frosted glass effects' },
  { value: 'dark', label: 'Dark Mode', description: 'Dark theme with accents' },
  { value: 'gradient', label: 'Gradient', description: 'Colorful gradients' },
];

// Page types with descriptions
const PAGE_TYPES = [
  { value: 'landing', label: 'Landing Page', description: 'Convert visitors to customers' },
  { value: 'pricing', label: 'Pricing Page', description: 'Display plans and pricing' },
  { value: 'about', label: 'About Page', description: 'Tell your company story' },
  { value: 'contact', label: 'Contact Page', description: 'Let visitors reach you' },
  { value: 'product', label: 'Product Page', description: 'Showcase a product' },
  { value: 'blog', label: 'Blog Post', description: 'Article or news content' },
  { value: 'dashboard', label: 'Dashboard', description: 'Data and metrics display' },
  { value: 'portfolio', label: 'Portfolio', description: 'Showcase your work' },
];

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
  const [pageType, setPageType] = useState<string>('landing');
  const [designStyle, setDesignStyle] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [externalSearchAvailable, setExternalSearchAvailable] = useState(false);

  // Check if external search is available
  useEffect(() => {
    fetch('/api/ai/examples')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setExternalSearchAvailable(data.data.externalSearchAvailable);
        }
      })
      .catch(() => {
        // Ignore errors, default to false
      });
  }, []);

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
          // Advanced Approach: Include design style for enhanced generation
          designStyle: designStyle || undefined,
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
      setDesignStyle('');
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate page');
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhanced examples with design styles (Advanced Approach)
  const examples = [
    {
      description: 'A landing page for a B2B SaaS project management tool with features like task boards, team collaboration, and integrations',
      industry: 'Software',
      audience: 'Project managers and team leads',
      pageType: 'landing',
      style: 'minimal',
    },
    {
      description: 'Pricing page for a fitness app with 3 subscription tiers (Free, Pro, Enterprise) with feature comparison',
      industry: 'Health & Fitness',
      audience: 'Health-conscious individuals',
      pageType: 'pricing',
      style: 'bold',
    },
    {
      description: 'About page for a sustainable fashion brand telling our story, mission, and team',
      industry: 'E-commerce',
      audience: 'Eco-conscious shoppers',
      pageType: 'about',
      style: 'corporate',
    },
    {
      description: 'Dashboard showing analytics metrics with charts, KPIs, and recent activity for a marketing platform',
      industry: 'Marketing',
      audience: 'Marketing managers',
      pageType: 'dashboard',
      style: 'dark',
    },
    {
      description: 'Portfolio page showcasing web design projects with case studies and client testimonials',
      industry: 'Design',
      audience: 'Potential clients',
      pageType: 'portfolio',
      style: 'gradient',
    },
  ];

  const loadExample = (example: typeof examples[0]) => {
    setDescription(example.description);
    setIndustry(example.industry);
    setTargetAudience(example.audience);
    setPageType(example.pageType);
    setDesignStyle(example.style);
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

      {/* Page Type and Design Style - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Page Type */}
        <div>
          <Label className="mb-2 block">Page Type</Label>
          <select
            value={pageType}
            onChange={(e) => setPageType(e.target.value)}
            disabled={isGenerating}
            className="w-full px-3 py-2 border rounded-md bg-white"
          >
            {PAGE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {PAGE_TYPES.find(t => t.value === pageType)?.description}
          </p>
        </div>

        {/* Design Style */}
        <div>
          <Label className="mb-2 block">
            Design Style
            <span className="text-xs text-gray-500 ml-1">(optional)</span>
          </Label>
          <select
            value={designStyle}
            onChange={(e) => setDesignStyle(e.target.value)}
            disabled={isGenerating}
            className="w-full px-3 py-2 border rounded-md bg-white"
          >
            <option value="">Auto (AI chooses best style)</option>
            {DESIGN_STYLES.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label} - {style.description}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {designStyle
              ? DESIGN_STYLES.find(s => s.value === designStyle)?.description
              : 'AI will select a style based on your content'}
          </p>
        </div>
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
          <strong>Powered by Real-World Examples:</strong> Our AI studies high-converting
          pages from companies like Stripe, Linear, and Notion to generate better designs.
          {' '}AI-generated pages are a starting point - customize using the visual editor.
        </p>
      </div>

      {/* Advanced Approach Info */}
      <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
        <p className="text-xs text-purple-700">
          <strong>Design Inspirations:</strong> Each page type uses curated examples
          from top websites. The AI adapts patterns from Stripe (landing pages),
          Notion (pricing), Figma (about pages), and more for professional results.
        </p>
      </div>
    </Card>
  );
}
