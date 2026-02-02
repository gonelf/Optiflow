'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import TestTypeSelector, { TestType } from './TestTypeSelector';
import PageRedirectTestSetup, { PageVariantConfig } from './PageRedirectTestSetup';
import ElementTestEditor, { ElementVariantConfig } from './ElementTestEditor';

interface TestCreatorProps {
  workspaceSlug: string;
  pageId?: string;
  pages?: Array<{ id: string; title: string; publishedUrl?: string | null }>;
}

export default function TestCreator({ workspaceSlug, pageId, pages = [] }: TestCreatorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testType, setTestType] = useState<TestType>('ELEMENT_TEST');

  // Common form data
  const [formData, setFormData] = useState({
    pageId: pageId || '',
    name: '',
    description: '',
    primaryGoal: 'conversion',
    conversionEvent: 'button_click',
    minimumSampleSize: 1000,
    confidenceLevel: 0.95,
  });

  // Page redirect test data
  const [pageVariants, setPageVariants] = useState<PageVariantConfig[]>([
    { name: 'Control', pageId: '', redirectUrl: '' },
    { name: 'Variant A', pageId: '', redirectUrl: '' },
  ]);

  // Element test data
  const [elementVariants, setElementVariants] = useState<ElementVariantConfig[]>([
    { name: 'Control', description: 'Original version', isControl: true, changes: [] },
    { name: 'Variant A', description: '', isControl: false, changes: [] },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      alert('Please enter a test name');
      return;
    }

    if (testType === 'PAGE_REDIRECT') {
      if (pageVariants.length < 2) {
        alert('Page redirect tests require at least 2 page variants');
        return;
      }
      if (pageVariants.some((v) => !v.pageId || !v.redirectUrl)) {
        alert('Please fill in all page variant details');
        return;
      }
      if (!formData.pageId) {
        // Use the first variant's pageId as the test's pageId
        formData.pageId = pageVariants[0].pageId;
      }
    } else {
      if (!formData.pageId) {
        alert('Please select a page');
        return;
      }
    }

    try {
      setLoading(true);

      const payload: any = {
        ...formData,
        testType,
      };

      if (testType === 'PAGE_REDIRECT') {
        payload.variantConfigs = pageVariants;
      } else {
        payload.variantNames = elementVariants.map((v) => v.name);
        // Store element changes in the first API call or handle separately
        // For now, we'll pass empty variants and update them later with element changes
      }

      const response = await fetch('/api/ab-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create A/B test');
      }

      const { test } = await response.json();

      // For element tests, we might need to update variants with element changes
      // This would require additional API calls to update each variant
      if (testType === 'ELEMENT_TEST') {
        // TODO: Update variants with element changes
        // This can be done via a separate API endpoint or as part of the test editor
      }

      // Redirect to test detail page
      router.push(`/${workspaceSlug}/ab-tests/${test.id}`);
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      alert(error instanceof Error ? error.message : 'Failed to create A/B test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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

      {/* Test Type Selector */}
      <TestTypeSelector selectedType={testType} onChange={setTestType} />

      {/* Page Selection (for Element Test only) */}
      {testType === 'ELEMENT_TEST' && !pageId && pages.length > 0 && (
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

      {/* Test Type Specific Configuration */}
      {testType === 'PAGE_REDIRECT' ? (
        <PageRedirectTestSetup
          pages={pages}
          variants={pageVariants}
          onChange={setPageVariants}
        />
      ) : (
        <ElementTestEditor variants={elementVariants} onChange={setElementVariants} />
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h3>
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
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
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
