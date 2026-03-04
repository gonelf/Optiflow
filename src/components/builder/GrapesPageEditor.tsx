'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { getRawHtmlCss } from '@/lib/builder/elements-to-html';

// GrapesJS bundled CSS
import 'grapesjs/dist/css/grapes.min.css';

export interface GrapesEditorHandle {
    getHtmlCss: () => { html: string; css: string };
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    setDevice: (device: 'Desktop' | 'Tablet' | 'Mobile') => void;
    getScreenshotDataUrl: () => Promise<string | null>;
}

interface GrapesPageEditorProps {
    elements: any[];
    onReady?: () => void;
}

/**
 * Full-page GrapesJS editor.
 *
 * Layout:
 *   [Blocks 260px] | [Canvas flex-1] | [Styles/Layers/Traits 280px]
 *
 * GrapesJS is initialised once on mount and destroyed on unmount.
 * The Toolbar controls it via the imperative handle.
 */
export const GrapesPageEditor = forwardRef<GrapesEditorHandle, GrapesPageEditorProps>(
    function GrapesPageEditor({ elements, onReady }, ref) {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const editorRef = useRef<any>(null);

        /* ── Imperative handle ── */
        useImperativeHandle(ref, () => ({
            getHtmlCss() {
                const e = editorRef.current;
                if (!e) return { html: '', css: '' };
                return { html: e.getHtml(), css: e.getCss() };
            },
            undo() { editorRef.current?.Commands.run('core:undo'); },
            redo() { editorRef.current?.Commands.run('core:redo'); },
            canUndo() { return editorRef.current?.UndoManager.hasUndo() ?? false; },
            canRedo() { return editorRef.current?.UndoManager.hasRedo() ?? false; },
            setDevice(device) { editorRef.current?.setDevice(device); },
            async getScreenshotDataUrl() {
                const e = editorRef.current;
                if (!e) return null;
                try {
                    const iframe = e.Canvas.getFrameEl() as HTMLIFrameElement | null;
                    if (!iframe?.contentDocument?.body) return null;
                    const { default: html2canvas } = await import('html2canvas');
                    const raw = await html2canvas(iframe.contentDocument.body, {
                        scale: 1, useCORS: true, logging: false,
                    });
                    const W = 800, H = Math.round(800 / (16 / 9));
                    const out = document.createElement('canvas');
                    out.width = W; out.height = H;
                    const ctx = out.getContext('2d');
                    if (!ctx) return raw.toDataURL('image/jpeg', 0.7);
                    const srcH = Math.min(raw.height, raw.width / (16 / 9));
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, W, H);
                    ctx.drawImage(raw, 0, 0, raw.width, srcH, 0, 0, W, H);
                    return out.toDataURL('image/jpeg', 0.8);
                } catch { return null; }
            },
        }));

        /* ── Init ── */
        useEffect(() => {
            if (!wrapperRef.current || editorRef.current) return;

            let editor: any;

            (async () => {
                const grapesjs = (await import('grapesjs')).default;
                const webpagePlugin = (await import('grapesjs-preset-webpage')).default;

                const { html, css } = getRawHtmlCss(elements);
                const initialHtml = html ||
                    '<div style="min-height:300px;padding:3rem;text-align:center;color:#9ca3af;">' +
                    'Drag blocks from the left panel to start building.</div>';

                editor = grapesjs.init({
                    container: wrapperRef.current!,
                    fromElement: false,
                    components: initialHtml,
                    style: css || '',
                    height: '100%',
                    width: 'auto',
                    storageManager: false,
                    undoManager: {},
                    plugins: [webpagePlugin],
                    pluginsOpts: {
                        [webpagePlugin as any]: {
                            // Disable preset blocks we will add ourselves
                            blocks: ['link-block', 'quote', 'text-basic'],
                        },
                    },
                    deviceManager: {
                        devices: [
                            { name: 'Desktop', width: '' },
                            { name: 'Tablet', width: '768px', widthMedia: '992px' },
                            { name: 'Mobile', width: '414px', widthMedia: '767px' },
                        ],
                    },
                    // We let GrapesJS handle its own panels (no external appendTo)
                    // This is the simplest working config for Next.js
                    panels: { defaults: [] },
                });

                editorRef.current = editor;

                /* ── Custom blocks ── */
                const bm = editor.BlockManager;
                const addBlock = (id: string, label: string, content: string, cat: string) => {
                    if (!bm.get(id)) bm.add(id, { label, content, category: cat });
                };

                addBlock('section', 'Section', '<section class="py-16 px-4"></section>', 'Layout');
                addBlock('container', 'Container', '<div class="max-w-7xl mx-auto px-4"></div>', 'Layout');
                addBlock('flex-row', 'Flex Row', '<div class="flex flex-row gap-4 items-center"><div class="flex-1"></div><div class="flex-1"></div></div>', 'Layout');
                addBlock('grid-2', '2 Columns', '<div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="p-4"></div><div class="p-4"></div></div>', 'Layout');
                addBlock('grid-3', '3 Columns', '<div class="grid grid-cols-1 md:grid-cols-3 gap-6"><div class="p-4"></div><div class="p-4"></div><div class="p-4"></div></div>', 'Layout');
                addBlock('heading', 'Heading', '<h2 class="text-3xl font-bold text-gray-900">Your Heading</h2>', 'Typography');
                addBlock('subheading', 'Subheading', '<h3 class="text-xl font-semibold text-gray-700">Subheading</h3>', 'Typography');
                addBlock('paragraph', 'Paragraph', '<p class="text-base text-gray-600 leading-relaxed">Your paragraph text here.</p>', 'Typography');
                addBlock('btn-primary', 'Primary Button', '<a href="#" class="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Click me</a>', 'Buttons');
                addBlock('btn-outline', 'Outline Button', '<a href="#" class="inline-block px-6 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">Learn More</a>', 'Buttons');
                addBlock('card', 'Card', '<div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm"><h3 class="text-lg font-semibold mb-2">Card Title</h3><p class="text-gray-600">Card content goes here.</p></div>', 'Elements');
                addBlock('divider', 'Divider', '<hr class="border-gray-200 my-8" />', 'Elements');
                addBlock('spacer', 'Spacer', '<div class="py-8"></div>', 'Elements');
                addBlock('hero', 'Hero Section',
                    `<section class="py-20 px-4 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
  <h1 class="text-5xl font-bold mb-4">Your Headline Here</h1>
  <p class="text-xl mb-8 text-blue-100">A compelling sub-heading that explains your value proposition.</p>
  <a href="#" class="inline-block px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors">Get Started</a>
</section>`, 'Sections');
                addBlock('features', 'Features',
                    `<section class="py-16 px-4">
  <div class="max-w-6xl mx-auto text-center mb-12">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">Features</h2>
    <p class="text-gray-600 text-lg">Everything you need to succeed.</p>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    <div class="p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
      <h3 class="text-lg font-semibold mb-2 text-gray-900">Feature One</h3>
      <p class="text-gray-600">Brief description of this feature and its benefits.</p>
    </div>
    <div class="p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
      <h3 class="text-lg font-semibold mb-2 text-gray-900">Feature Two</h3>
      <p class="text-gray-600">Brief description of this feature and its benefits.</p>
    </div>
    <div class="p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
      <h3 class="text-lg font-semibold mb-2 text-gray-900">Feature Three</h3>
      <p class="text-gray-600">Brief description of this feature and its benefits.</p>
    </div>
  </div>
</section>`, 'Sections');

                onReady?.();
            })();

            return () => {
                editor?.destroy();
                editorRef.current = null;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return (
            <div
                ref={wrapperRef}
                className="h-full w-full"
                style={{ height: '100%' }}
            />
        );
    }
);
