'use client';

/**
 * Heatmaps Page
 * View click and scroll heatmaps for pages
 */

import { useState, useEffect } from 'react';
import { HeatmapViewer } from '@/components/analytics/HeatmapViewer';

interface HeatmapsPageProps {
  params: {
    workspaceSlug: string;
  };
}

interface Page {
  id: string;
  title: string;
}

export default function HeatmapsPage({ params }: HeatmapsPageProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch pages for this workspace
    const fetchPages = async () => {
      try {
        const response = await fetch(`/api/pages?workspaceSlug=${params.workspaceSlug}`);
        if (response.ok) {
          const data = await response.json();
          setPages(data);
          if (data.length > 0) {
            setSelectedPageId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [params.workspaceSlug]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Heatmaps</h1>
        <p className="text-gray-600 mt-1">
          Visualize where users click and how far they scroll
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading pages...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📄</div>
          <p>No pages found. Create a page first to view heatmaps.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Page selector */}
          <div className="flex items-center gap-4">
            <label className="font-medium text-sm">Select Page:</label>
            <select
              className="px-4 py-2 border rounded-lg bg-white"
              value={selectedPageId || ''}
              onChange={(e) => setSelectedPageId(e.target.value)}
            >
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
          </div>

          {/* Heatmap viewer */}
          {selectedPageId && (
            <HeatmapViewer
              workspaceSlug={params.workspaceSlug}
              pageId={selectedPageId}
            />
          )}
        </div>
      )}
    </div>
  );
}
