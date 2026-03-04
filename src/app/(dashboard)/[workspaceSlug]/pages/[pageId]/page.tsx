'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Toolbar } from '@/components/builder/Toolbar';
import { PageSettingsDialog } from '@/components/builder/PageSettingsDialog';
import { GrapesPageEditor, GrapesEditorHandle } from '@/components/builder/GrapesPageEditor';

export default function BuilderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const variantId = searchParams.get('variantId');
  const mode = (searchParams.get('mode') as 'default' | 'ab-test') || 'default';
  const testId = searchParams.get('testId');

  const [elements, setElements] = useState<any[]>([]);
  const [pageMetadata, setPageMetadata] = useState<any>(null);
  const [pageStatus, setPageStatus] = useState<string>('DRAFT');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const editorRef = useRef<GrapesEditorHandle>(null);

  // ──────────────────────────────────────────────
  // Load page data
  // ──────────────────────────────────────────────
  useEffect(() => {
    const loadPage = async () => {
      const pageId = params.pageId as string;
      try {
        const url = variantId
          ? `/api/pages/${pageId}/variants/${variantId}`
          : `/api/pages/${pageId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load page');

        const data = await response.json();

        setPageMetadata({
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description,
          seoTitle: data.seoTitle || '',
          seoDescription: data.seoDescription || '',
          customHead: data.customHead || '',
        });
        setPageStatus(data.status || 'DRAFT');

        // Build element tree
        const elementsList = data.elements || [];
        setElements(buildElementTree(elementsList));
      } catch (error) {
        console.error('Error loading page:', error);
        toast({
          title: 'Error',
          description: 'Failed to load page',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [params.pageId, variantId, toast]);

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────
  function buildElementTree(flatElements: any[]) {
    const map = new Map<string, any>();
    flatElements.forEach(el => map.set(el.id, { ...el, children: [] }));

    const roots: any[] = [];
    flatElements.forEach(el => {
      const node = map.get(el.id)!;
      if (el.parentId && map.has(el.parentId)) {
        map.get(el.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sort = (arr: any[]) => {
      arr.sort((a, b) => a.order - b.order);
      arr.forEach(el => el.children && sort(el.children));
    };
    sort(roots);
    return roots;
  }

  // ──────────────────────────────────────────────
  // Save
  // ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!editorRef.current) return;
    setIsSaving(true);
    try {
      const { html, css } = editorRef.current.getHtmlCss();
      const screenshotUrl = await editorRef.current.getScreenshotDataUrl();

      // Store as a single "raw" element — simple and lossless
      const flatElements = [
        {
          id: `raw-${params.pageId}`,
          type: 'raw',
          name: 'Page Content',
          pageId: params.pageId,
          order: 0,
          depth: 0,
          path: `raw-${params.pageId}`,
          parentId: null,
          content: { html, css },
          styles: {},
          className: '',
        },
      ];

      const url = variantId
        ? `/api/pages/${params.pageId}/variants/${variantId}`
        : `/api/pages/${params.pageId}`;

      const body: any = { elements: flatElements };
      if (!variantId && screenshotUrl) body.screenshotUrl = screenshotUrl;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save');
      }

      toast({ title: 'Saved', description: 'Page saved successfully' });

      if (mode === 'ab-test' && testId) {
        router.push(`/${params.workspaceSlug}/ab-tests/${testId}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save page',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ──────────────────────────────────────────────
  // Other actions
  // ──────────────────────────────────────────────
  const handlePreview = () => {
    window.open(`/${params.workspaceSlug}/preview/${params.pageId}`, '_blank');
  };

  const handlePublish = async () => {
    const newStatus = pageStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/pages/${params.pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update status');
      }
      setPageStatus(newStatus);
      toast({
        title: newStatus === 'PUBLISHED' ? 'Page published' : 'Page unpublished',
        description: newStatus === 'PUBLISHED'
          ? `Your page is now live at /p/${pageMetadata?.slug}`
          : 'Your page has been unpublished.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBack = () => {
    if (mode === 'ab-test' && testId) {
      router.push(`/${params.workspaceSlug}/ab-tests/${testId}`);
    } else {
      router.push(`/${params.workspaceSlug}/pages`);
    }
  };

  const handleSaveSettings = async (settings: {
    title: string;
    slug: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    customHead: string;
  }) => {
    const response = await fetch(`/api/pages/${params.pageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to save settings');
    }
    setPageMetadata({ ...pageMetadata, ...settings });
    toast({ title: 'Settings saved', description: 'Page settings have been updated' });
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* ── Toolbar ── */}
      <Toolbar
        onSave={handleSave}
        onPreview={handlePreview}
        onSettings={() => setIsSettingsOpen(true)}
        onBack={handleBack}
        mode={mode}
        title={pageMetadata?.title}
        isSaving={isSaving}
        onUndo={() => editorRef.current?.undo()}
        onRedo={() => editorRef.current?.redo()}
        onViewportChange={(v) =>
          editorRef.current?.setDevice(
            v === 'desktop' ? 'Desktop' : v === 'tablet' ? 'Tablet' : 'Mobile'
          )
        }
      />

      {/* ── GrapesJS editor ── */}
      <div className="flex-1 overflow-hidden">
        {!isLoading && (
          <GrapesPageEditor
            ref={editorRef}
            elements={elements}
            onReady={() => setEditorReady(true)}
          />
        )}
      </div>

      {/* ── Page Settings Dialog ── */}
      {pageMetadata && (
        <PageSettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          pageId={params.pageId as string}
          initialSettings={{
            title: pageMetadata.title || '',
            slug: pageMetadata.slug || '',
            description: pageMetadata.description || '',
            seoTitle: pageMetadata.seoTitle || '',
            seoDescription: pageMetadata.seoDescription || '',
            customHead: pageMetadata.customHead || '',
          }}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}
