import { getRawHtmlCss } from '@/lib/builder/elements-to-html';

export interface ExportedFile {
  path: string;
  content: string;
  encoding: 'utf-8' | 'base64';
}

interface FlatElement {
  id: string;
  type: string;
  tagName?: string | null;
  className?: string | null;
  styles?: Record<string, unknown> | null;
  content?: unknown;
  parentId?: string | null;
  order?: number | null;
  depth?: number | null;
  path?: string | null;
}

interface TreeElement extends FlatElement {
  children: TreeElement[];
}

export class PageExportService {
  static buildFileTree(params: {
    title: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    elements: FlatElement[];
  }): ExportedFile[] {
    const tree = this.buildTree(params.elements);
    const { html: bodyHtml, css } = getRawHtmlCss(tree as any[]);

    const fullHtml = this.wrapInDocument({
      title: params.seoTitle || params.title,
      description: params.seoDescription || '',
      bodyHtml,
      css,
    });

    return [
      {
        path: 'index.html',
        content: fullHtml,
        encoding: 'utf-8',
      },
      {
        path: 'vercel.json',
        content: JSON.stringify({ version: 2 }, null, 2),
        encoding: 'utf-8',
      },
    ];
  }

  private static buildTree(flatElements: FlatElement[]): TreeElement[] {
    const map = new Map<string, TreeElement>();
    flatElements.forEach((el) => map.set(el.id, { ...el, children: [] }));

    const roots: TreeElement[] = [];
    flatElements.forEach((el) => {
      const node = map.get(el.id)!;
      if (el.parentId && map.has(el.parentId)) {
        map.get(el.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortByOrder = (a: TreeElement, b: TreeElement) =>
      (a.order ?? 0) - (b.order ?? 0);
    roots.sort(sortByOrder);
    map.forEach((node) => node.children.sort(sortByOrder));

    return roots;
  }

  private static wrapInDocument(params: {
    title: string;
    description: string;
    bodyHtml: string;
    css: string;
  }): string {
    const styleTag = params.css ? `\n  <style>\n${params.css}\n  </style>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${this.escapeAttr(params.description)}" />${styleTag}
  <title>${this.escapeHtml(params.title)}</title>
</head>
<body>
${params.bodyHtml}
</body>
</html>`;
  }

  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private static escapeAttr(str: string): string {
    return str.replace(/"/g, '&quot;');
  }
}
