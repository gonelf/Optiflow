'use client';

import { useState } from 'react';
import { ChevronDown, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PageVariantConfig {
  name: string;
  pageId: string;
  redirectUrl: string;
}

interface PageRedirectTestSetupProps {
  pages: Array<{ id: string; title: string; publishedUrl?: string | null }>;
  variants: PageVariantConfig[];
  onChange: (variants: PageVariantConfig[]) => void;
}

export default function PageRedirectTestSetup({
  pages,
  variants,
  onChange,
}: PageRedirectTestSetupProps) {
  const addVariant = () => {
    const newVariant: PageVariantConfig = {
      name: variants.length === 0 ? 'Control' : `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
      pageId: '',
      redirectUrl: '',
    };
    onChange([...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 2) {
      alert('You must have at least 2 variants for a page redirect test');
      return;
    }
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof PageVariantConfig, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };

    // Auto-fill redirect URL when page is selected
    if (field === 'pageId' && value) {
      const selectedPage = pages.find((p) => p.id === value);
      if (selectedPage?.publishedUrl) {
        newVariants[index].redirectUrl = selectedPage.publishedUrl;
      }
    }

    onChange(newVariants);
  };

  // Ensure at least 2 variants exist
  if (variants.length < 2) {
    const initialVariants: PageVariantConfig[] = [
      { name: 'Control', pageId: '', redirectUrl: '' },
      { name: 'Variant A', pageId: '', redirectUrl: '' },
    ];
    onChange(initialVariants);
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Page Variants <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500">
            Select the pages you want to test against each other. Visitors will be randomly redirected to one of these pages.
          </p>
        </div>
        <Button type="button" onClick={addVariant} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Page
        </Button>
      </div>

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-900">{variant.name}</h4>
                {index === 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Control
                  </span>
                )}
              </div>
              {index > 0 && (
                <Button
                  type="button"
                  onClick={() => removeVariant(index)}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 -mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {/* Variant Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Variant Name
                </label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => updateVariant(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Homepage V2"
                  required
                />
              </div>

              {/* Page Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Select Page <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={variant.pageId}
                    onChange={(e) => updateVariant(index, 'pageId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                    required
                  >
                    <option value="">Choose a page...</option>
                    {pages
                      .filter((page) => page.publishedUrl) // Only show published pages
                      .map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.title}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {pages.filter((p) => p.publishedUrl).length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No published pages available. Please publish some pages first.
                  </p>
                )}
              </div>

              {/* Redirect URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Redirect URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={variant.redirectUrl}
                    onChange={(e) => updateVariant(index, 'redirectUrl', e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/page"
                    required
                  />
                  {variant.redirectUrl && (
                    <a
                      href={variant.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  The URL where visitors will be redirected for this variant
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <svg
            className="h-5 w-5 text-blue-500 flex-shrink-0"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How Page Redirect Tests Work</p>
            <ul className="text-xs space-y-1 text-blue-700">
              <li>• Visitors are randomly assigned to one of the selected pages</li>
              <li>• Each visitor consistently sees the same version</li>
              <li>• Performance is tracked and compared automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
