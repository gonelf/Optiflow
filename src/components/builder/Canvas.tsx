'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn, isVoidElement } from '@/lib/utils';
import { Element } from '@prisma/client';
import { GripVertical } from 'lucide-react';
import { sanitizeHtml, isUrlSafe, getIframeSandbox } from '@/lib/embed-security';

export interface ExtendedElement extends Element {
  children?: ExtendedElement[];
  content: any;
  styles: any;
}

interface CanvasProps {
  elements: ExtendedElement[];
  selectedId: string | null;
  hoveredId: string | null;
  isDragActive?: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onReorder: (elements: ExtendedElement[]) => void;
  depth?: number;
}

export function AICanvas({
  elements,
  selectedId,
  hoveredId,
  isDragActive,
  onSelect,
  onHover,
  onReorder,
  depth = 0,
}: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
  });

  return (
    <div
      id="canvas-area"
      ref={setNodeRef}
      className={cn(
        "p-8 min-h-screen transition-colors",
        isOver && "bg-primary/5 ring-2 ring-inset ring-primary/20"
      )}
    >
      <SortableContext
        items={elements.map(el => el.id)}
        strategy={verticalListSortingStrategy}
      >
        {elements.map(el => (
          <SortableElementNode
            key={el.id}
            element={el}
            selectedId={selectedId}
            hoveredId={hoveredId}
            isDragActive={isDragActive}
            onSelect={onSelect}
            onHover={onHover}
            onReorder={onReorder}
            depth={depth}
          />
        ))}
      </SortableContext>
    </div>
  );
}

function SortableElementNode({
  element,
  selectedId,
  hoveredId,
  isDragActive,
  onSelect,
  onHover,
  onReorder,
  depth,
}: {
  element: ExtendedElement;
  selectedId: string | null;
  hoveredId: string | null;
  isDragActive?: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onReorder: (elements: ExtendedElement[]) => void;
  depth: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    data: {
      isContainer: element.type === 'container'
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const isSelected = selectedId === element.id;
  const isHovered = hoveredId === element.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group/sortable',
        isDragging && 'opacity-50 z-50'
      )}
      onMouseOver={(e) => {
        e.stopPropagation();
        onHover(element.id);
      }}
      onMouseLeave={() => onHover(null)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'absolute top-2 left-2 z-50 p-1.5 rounded bg-white/90 border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing transition-opacity',
          'opacity-0',
          (isSelected || isHovered) && 'opacity-100',
          isDragging && 'cursor-grabbing'
        )}
        title="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-gray-500" />
      </div>

      <ElementNode
        element={element}
        selectedId={selectedId}
        hoveredId={hoveredId}
        isDragActive={isDragActive}
        onSelect={onSelect}
        onHover={onHover}
        onReorder={onReorder}
        depth={depth}
      />
    </div>
  );
}

function ElementNode({
  element,
  selectedId,
  hoveredId,
  isDragActive,
  onSelect,
  onHover,
  onReorder,
  depth,
}: {
  element: ExtendedElement;
  selectedId: string | null;
  hoveredId: string | null;
  isDragActive?: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onReorder: (elements: ExtendedElement[]) => void;
  depth: number;
}) {
  const isSelected = selectedId === element.id;
  const content = element.content || {};
  const styles = element.styles || {};

  // Make containers droppable
  const { setNodeRef, isOver } = useDroppable({
    id: element.id,
    disabled: element.type !== 'container',
    data: {
      elementId: element.id,
      isContainer: element.type === 'container'
    }
  });

  // Drop zone overlay for containers - appears during drag to make them targetable
  const { setNodeRef: setOverlayRef, isOver: isOverlayOver } = useDroppable({
    id: `${element.id}-dropzone`,
    disabled: element.type !== 'container' || !isDragActive,
    data: {
      elementId: element.id,
      isContainer: element.type === 'container',
      isDropZone: true
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(element.id);
  };

  // Calculate depth-based expansion
  // OUTER containers expand MORE to create ledges for inner ones
  const expansionStyles = isDragActive && element.type === 'container'
    ? (element.children?.length || 0) === 0
      ? 'border-primary/30 bg-primary/5' // Colors only here
      : ''
    : '';

  const dynamicPadding = isDragActive && element.type === 'container'
    ? (element.children?.length || 0) === 0
      ? '32px'
      : `${Math.max(8, 32 - (depth * 8))}px`
    : styles.padding || '';

  const dynamicMinHeight = isDragActive && element.type === 'container'
    ? '80px'
    : styles.minHeight || '';

  // Base selection classes
  const selectionClasses = cn(
    'transition-all cursor-pointer relative',
    isSelected
      ? 'outline outline-2 outline-blue-500 outline-offset-2 shadow-[0_0_0_4px_rgba(59,130,246,0.2)] z-50'
      : 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1 hover:ring-offset-white',
    // Pseudo-element label for non-void elements
    isSelected &&
    'before:content-[attr(data-label)] before:absolute before:-top-6 before:left-0 before:bg-blue-500 before:text-white before:text-[10px] before:px-1.5 before:py-0.5 before:rounded-t before:font-medium before:whitespace-nowrap before:z-[60] before:shadow-sm before:pointer-events-none',
    // Drop target feedback
    isOver && 'ring-2 ring-primary ring-offset-2 bg-primary/5',
    expansionStyles
  );

  const combinedStyles = {
    ...styles,
    padding: dynamicPadding,
    minHeight: dynamicMinHeight,
  };

  // Render based on type
  switch (element.type) {
    case 'text': {
      const Tag = (content?.tagName || 'p') as any;
      if (isVoidElement(Tag)) {
        return (
          <Tag
            style={combinedStyles}
            data-label={element.type}
            className={cn(
              selectionClasses,
              element.className || ''
            )}
            onClick={handleClick}
            {...(element.attributes as object || {})}
          />
        );
      }
      return (
        <Tag
          style={combinedStyles}
          data-label={element.type}
          className={cn(
            selectionClasses,
            element.className || ''
          )}
          onClick={handleClick}
        >
          {content?.content || 'Text'}
        </Tag>
      );
    }

    case 'button': {
      return (
        <button
          style={combinedStyles}
          data-label={element.type}
          className={cn(
            selectionClasses,
            element.className || ''
          )}
          onClick={handleClick}
        >
          {content?.content || 'Button'}
        </button>
      );
    }

    case 'image': {
      // Images need a wrapper for the label/outline since they can't have pseudo-elements
      return (
        <div
          className={cn(
            "relative inline-block", // Inline-block to match image behavior
            isSelected && "z-50"
          )}
          onClick={handleClick}
          style={{ width: combinedStyles.width, height: combinedStyles.height }}
        >
          {isSelected && (
            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-t font-medium whitespace-nowrap z-[60] shadow-sm pointer-events-none">
              {element.type}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content?.src || 'https://via.placeholder.com/150'}
            alt={content?.alt || ''}
            style={combinedStyles}
            className={cn(
              'transition-all cursor-pointer block', // Block inside wrapper
              element.className || '',
              isSelected
                ? 'outline outline-2 outline-blue-500 outline-offset-2 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]'
                : 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1 hover:ring-offset-white'
            )}
          />
        </div>
      );
    }

    case 'embed': {
      // Render embed element with builder preview mode
      const embedContent = content as { type?: string; code?: string; aspectRatio?: string; allowFullscreen?: boolean };

      // Empty embed placeholder
      if (!embedContent?.code) {
        return (
          <div
            style={combinedStyles}
            data-label={element.type}
            className={cn(
              selectionClasses,
              element.className || '',
              'bg-gray-100 flex items-center justify-center min-h-[200px] text-gray-400'
            )}
            onClick={handleClick}
          >
            <div className="text-center">
              <p className="text-sm font-medium">Click to add embed code</p>
              <p className="text-xs">HTML, iFrame, or Script</p>
            </div>
          </div>
        );
      }

      // iFrame embed - with URL validation
      if (embedContent.type === 'iframe') {
        // Validate URL
        if (!isUrlSafe(embedContent.code)) {
          return (
            <div
              data-label={element.type}
              className={cn(selectionClasses, element.className || '')}
              style={{
                ...styles,
                backgroundColor: '#fef2f2',
                padding: '1rem',
                borderRadius: '0.375rem',
                color: '#dc2626',
              }}
              onClick={handleClick}
            >
              <strong>Invalid URL</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                The URL appears to be invalid or unsafe. Please check the URL.
              </p>
            </div>
          );
        }

        const containerStyle = embedContent.aspectRatio
          ? {
            ...styles,
            position: 'relative' as const,
            width: '100%',
            paddingBottom: embedContent.aspectRatio,
          }
          : styles;

        // Get sandbox attributes for security
        const sandboxAttr = getIframeSandbox(embedContent.code);

        return (
          <div
            data-label={element.type}
            className={cn(selectionClasses, element.className || '')}
            style={containerStyle}
            onClick={handleClick}
          >
            <iframe
              src={embedContent.code}
              allowFullScreen={embedContent.allowFullscreen}
              sandbox={sandboxAttr}
              referrerPolicy="strict-origin-when-cross-origin"
              style={embedContent.aspectRatio ? {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              } : {
                width: '100%',
                border: 'none',
              }}
            />
          </div>
        );
      }

      // Script embed (show preview in builder - never execute)
      if (embedContent.type === 'script') {
        return (
          <div
            data-label={element.type}
            className={cn(selectionClasses, element.className || '')}
            style={{
              ...styles,
              backgroundColor: '#fef3c7',
              padding: '1rem',
              borderRadius: '0.375rem',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
            onClick={handleClick}
          >
            <strong>Script Embed (Preview Only)</strong>
            <p style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.25rem' }}>
              Scripts only execute on published pages
            </p>
            <pre style={{ marginTop: '0.5rem', overflow: 'auto', maxHeight: '150px' }}>
              {embedContent.code}
            </pre>
          </div>
        );
      }

      // HTML embed (show sanitized preview in builder)
      const sanitizedHtml = sanitizeHtml(embedContent.code || '');
      return (
        <div
          data-label={element.type}
          className={cn(selectionClasses, element.className || '')}
          style={styles}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    }

    case 'container':
    default: {
      const ContainerTag = (content?.tagName || 'div') as any;
      const childElements = element.children || [];

      if (isVoidElement(ContainerTag)) {
        return (
          <ContainerTag
            ref={setNodeRef}
            style={combinedStyles}
            data-label={element.type}
            className={cn(
              selectionClasses,
              element.className || ''
            )}
            onClick={handleClick}
            {...(element.attributes as object || {})}
          />
        );
      }

      return (
        <div className="relative">
          <ContainerTag
            ref={setNodeRef}
            style={combinedStyles}
            data-label={element.type}
            className={cn(
              selectionClasses,
              element.className || '',
              childElements.length === 0 && (isDragActive ? 'min-h-[100px] p-8' : 'min-h-[60px] p-4'),
              childElements.length === 0 && 'border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center'
            )}
            onClick={handleClick}
          >
            <SortableContext
              items={childElements.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {childElements.length === 0 ? (
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  {isDragActive ? 'Drop here' : 'Empty Container'}
                </span>
              ) : (
                childElements.map(child => (
                  <SortableChildElement
                    key={child.id}
                    element={child}
                    selectedId={selectedId}
                    hoveredId={hoveredId}
                    isDragActive={isDragActive}
                    onSelect={onSelect}
                    onHover={onHover}
                    onReorder={onReorder}
                    depth={depth + 1}
                  />
                ))
              )}
            </SortableContext>
          </ContainerTag>

          {/* Drop Zone Overlay - appears during drag to make container targetable */}
          {isDragActive && childElements.length > 0 && (
            <div
              ref={setOverlayRef}
              className={cn(
                "absolute inset-0 pointer-events-auto z-[100] transition-all",
                "border-4 rounded-lg",
                isOverlayOver
                  ? "border-blue-500 bg-blue-500/20 shadow-lg"
                  : "border-blue-300/50 bg-blue-300/5 hover:border-blue-400 hover:bg-blue-400/10"
              )}
              style={{
                pointerEvents: 'auto'
              }}
            >
              {/* Label to show drop target */}
              <div className={cn(
                "absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium transition-all",
                isOverlayOver
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-blue-300/80 text-blue-900"
              )}>
                {isOverlayOver ? "Drop here" : "Drop zone"}
              </div>
            </div>
          )}
        </div>
      );
    }
  }
}

function SortableChildElement({
  element,
  selectedId,
  hoveredId,
  isDragActive,
  onSelect,
  onHover,
  onReorder,
  depth,
}: {
  element: ExtendedElement;
  selectedId: string | null;
  hoveredId: string | null;
  isDragActive?: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onReorder: (elements: ExtendedElement[]) => void;
  depth: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    data: {
      isContainer: element.type === 'container'
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const isSelected = selectedId === element.id;
  const isHovered = hoveredId === element.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group/sortable-child',
        isDragging && 'opacity-50 z-50'
      )}
      onMouseOver={(e) => {
        e.stopPropagation();
        onHover(element.id);
      }}
      onMouseLeave={() => onHover(null)}
    >
      {/* Drag Handle for child elements */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'absolute top-1 left-1 z-50 p-1 rounded bg-white/90 border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing transition-opacity',
          'opacity-0',
          (isSelected || isHovered) && 'opacity-100',
          isDragging && 'cursor-grabbing'
        )}
        title="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3 w-3 text-gray-500" />
      </div>

      <ElementNode
        element={element}
        selectedId={selectedId}
        hoveredId={hoveredId}
        isDragActive={isDragActive}
        onSelect={onSelect}
        onHover={onHover}
        onReorder={onReorder}
        depth={depth}
      />
    </div>
  );
}
