'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface TestCreatorProps {
  workspaceSlug: string;
  pageId?: string;
  pages?: Array<{ id: string; title: string }>;
}

export default function TestCreator({ workspaceSlug, pageId, pages = [] }: TestCreatorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pageId: pageId || '',
    name: '',
    description: '',
    primaryGoal: 'conversion',
    conversionEvent: 'button_click',
    minimumSampleSize: 1000,
    confidenceLevel: 0.95,
    variantNames: ['Control', 'Variant A'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.pageId || !formData.name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/ab-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create A/B test');
      }

      const { test } = await response.json();

      // Redirect to test detail page
      router.push(`/${workspaceSlug}/ab-tests/${test.id}`);
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      alert('Failed to create A/B test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variantNames: [...formData.variantNames, `Variant ${String.fromCharCode(65 + formData.variantNames.length - 1)}`],
    });
  };

  const removeVariant = (index: number) => {
    if (formData.variantNames.length <= 2) {
      alert('You must have at least 2 variants (control and one test variant)');
      return;
    }

    const newVariantNames = formData.variantNames.filter((_, i) => i !== index);
    setFormData({ ...formData, variantNames: newVariantNames });
  };

  const updateVariantName = (index: number, name: string) => {
    const newVariantNames = [...formData.variantNames];
    newVariantNames[index] = name;
    setFormData({ ...formData, variantNames: newVariantNames });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Test Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Homepage Hero Test"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="What are you testing and why?"
        />
      </div>

      {/* Page Selection */}
      {!pageId && pages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.pageId}
            onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a page</option>
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Variants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Variants <span className="text-red-500">*</span>
          </label>
          <Button type="button" onClick={addVariant} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Variant
          </Button>
        </div>
        <div className="space-y-2">
          {formData.variantNames.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => updateVariantName(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={index === 0 ? 'Control (original)' : `Variant ${String.fromCharCode(65 + index - 1)}`}
                required
              />
              {index === 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Control</span>
              )}
              {index > 0 && (
                <Button
                  type="button"
                  onClick={() => removeVariant(index)}
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Primary Goal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Goal <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.primaryGoal}
          onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="conversion">Conversion</option>
          <option value="engagement">Engagement</option>
          <option value="clicks">Clicks</option>
          <option value="time_on_page">Time on Page</option>
        </select>
      </div>

      {/* Conversion Event */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Conversion Event <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.conversionEvent}
          onChange={(e) => setFormData({ ...formData, conversionEvent: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="button_click">Button Click</option>
          <option value="form_submit">Form Submission</option>
          <option value="link_click">Link Click</option>
          <option value="custom">Custom Event</option>
        </select>
      </div>

      {/* Statistical Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Sample Size
          </label>
          <input
            type="number"
            value={formData.minimumSampleSize}
            onChange={(e) => setFormData({ ...formData, minimumSampleSize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="100"
            step="100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Visitors per variant before results are significant
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Level
          </label>
          <select
            value={formData.confidenceLevel}
            onChange={(e) => setFormData({ ...formData, confidenceLevel: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0.90">90%</option>
            <option value="0.95">95% (recommended)</option>
            <option value="0.99">99%</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Statistical confidence threshold
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create A/B Test'}
        </Button>
      </div>
    </form>
  );
}
