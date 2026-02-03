'use client';

import { cn, isVoidElement } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Save, Eye, ArrowLeft, Globe, GlobeLock, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Element } from '@prisma/client';
import { ThemeChanger } from '@/components/builder/ThemeChanger';
import { EditorSidebar } from '@/components/builder/EditorSidebar';
import { Toolbar } from '@/components/builder/Toolbar';
import { PageSettingsDialog } from '@/components/builder/PageSettingsDialog';
import { sanitizeHtml, isUrlSafe, getIframeSandbox } from '@/lib/embed-security';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ExtendedElement extends Element {
  children?: ExtendedElement[];
}

export default function BuilderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const variantId = searchParams.get('variantId');
  const mode = searchParams.get('mode') as 'default' | 'ab-test' || 'default';
  const testId = searchParams.get('testId');

  const [elements, setElements] = useState<ExtendedElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [pageMetadata, setPageMetadata] = useState<any>(null);
  const [pageStatus, setPageStatus] = useState<string>('DRAFT');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [draggedElement, setDraggedElement] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  // Load page data
  useEffect(() => {
    const loadPage = async () => {
      const pageId = params.pageId as string;

      try {
        let response;
        if (variantId) {
          response = await fetch(`/api/pages/${pageId}/variants/${variantId}`);
        } else {
          response = await fetch(`/api/pages/${pageId}`);
        }

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
        const tree = buildElementTree(elementsList);
        setElements(tree);
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

  // Build tree structure from flat list
  const buildElementTree = (flatElements: Element[]): ExtendedElement[] => {
    const elementMap = new Map<string, ExtendedElement>();

    // Create map of all elements
    flatElements.forEach(el => {
      elementMap.set(el.id, { ...el, children: [] });
    });

    // Build tree
    const roots: ExtendedElement[] = [];
    flatElements.forEach(el => {
      const element = elementMap.get(el.id)!;
      if (el.parentId) {
        const parent = elementMap.get(el.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(element);
        }
      } else {
        roots.push(element);
      }
    });

    // Sort by order
    const sortByOrder = (arr: ExtendedElement[]) => {
      arr.sort((a, b) => a.order - b.order);
      arr.forEach(el => {
        if (el.children) sortByOrder(el.children);
      });
    };
    sortByOrder(roots);

    return roots;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Flatten tree back to list
      const flatElements: any[] = [];
      const flatten = (els: ExtendedElement[], parentId: string | null = null, depth = 0, parentPath = '') => {
        els.forEach((el, index) => {
          const { children, ...elementData } = el;

          // Build path for element
          const elementPath = parentPath ? `${parentPath}/${el.id}` : el.id;

          flatElements.push({
            ...elementData,
            name: elementData.name || elementData.type || 'Unnamed',
            parentId,
            order: index,
            depth,
            path: elementPath,
            content: elementData.content || {},
            styles: elementData.styles || {},
            className: elementData.className || '',
          });

          if (children && children.length > 0) {
            flatten(children, el.id, depth + 1, elementPath);
          }
        });
      };
      flatten(elements);

      // Generate screenshot
      let screenshotUrl: string | undefined = undefined;
      try {
        const canvasElement = document.getElementById('canvas-area');
        if (canvasElement && elements.length > 0) {
          try {
            const canvas = await html2canvas(canvasElement, {
              scale: 1, // Reduced scale for smaller size
              useCORS: true,
              logging: false,
              windowWidth: 1200, // Simulate desktop width
              ignoreElements: (element) => element.classList.contains('exclude-screenshot'),
            });

            // Resize and crop image to 16:9 aspect ratio (top aligned)
            const maxWidth = 800; // Increased resolution slightly
            const aspectRatio = 16 / 9;
            const targetHeight = maxWidth / aspectRatio;

            const resizedCanvas = document.createElement('canvas');
            resizedCanvas.width = maxWidth;
            resizedCanvas.height = targetHeight;

            const ctx = resizedCanvas.getContext('2d');
            if (ctx) {
              // Calculate source dimensions (take full width, crop height to ratio)
              const sourceWidth = canvas.width;
              // We want to capture the top part with the correct aspect ratio
              // So sourceHeight should be proportional to sourceWidth by the aspect ratio
              let sourceHeight = sourceWidth / aspectRatio;

              // If page is shorter than target ratio, use actual height and fill background
              if (sourceHeight > canvas.height) {
                sourceHeight = canvas.height;
                // We will draw it at the top and let the bottom be empty (or fill white)
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, maxWidth, targetHeight);

                // Calculate dest height to maintain aspect ratio of content
                const destHeight = (sourceHeight / sourceWidth) * maxWidth;
                ctx.drawImage(canvas, 0, 0, sourceWidth, sourceHeight, 0, 0, maxWidth, destHeight);
              } else {
                // Crop from top
                ctx.drawImage(canvas, 0, 0, sourceWidth, sourceHeight, 0, 0, maxWidth, targetHeight);
              }

              screenshotUrl = resizedCanvas.toDataURL('image/jpeg', 0.8); // Slightly better quality
            } else {
              // Fallback to simple resize if context fails (unlikely)
              screenshotUrl = canvas.toDataURL('image/jpeg', 0.7);
            }
          } catch (err) {
            console.error('html2canvas error:', err);
            // Silent fail for screenshot, but log it
          }
        }
      } catch (error) {
        console.error('Screenshot generation failed:', error);
        toast({
          title: 'Screenshot failed',
          description: 'Could not generate page preview image',
          variant: 'destructive',
        });
        // Continue saving even if screenshot fails
      }

      let response;
      if (variantId) {
        response = await fetch(`/api/pages/${params.pageId}/variants/${variantId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elements: flatElements,
            // variants usually won't update page screenshot, or maybe they should? 
            // For now, let's skip screenshot for variants to keep it simple or implement if needed.
            // Actually, showing a screenshot of the VARIANT in the dashboard would be cool.
            // But the current API structure might expect screenshotUrl on the variant?
            // The schema doesn't seem to have screenshotUrl on PageVariant.
            // So let's ignore screenshot for variant save for now.
          }),
        });
      } else {
        response = await fetch(`/api/pages/${params.pageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elements: flatElements,
            screenshotUrl
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save error:', errorData);
        throw new Error(errorData.error || 'Failed to save');
      }

      toast({
        title: 'Saved',
        description: 'Page saved successfully',
      });

      // Handle A/B Test Return
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

  const handlePreview = () => {
    window.open(`/${params.workspaceSlug}/preview/${params.pageId}`, '_blank');
  };

  const handlePublish = async () => {
    const newStatus = pageStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const action = newStatus === 'PUBLISHED' ? 'publish' : 'unpublish';

    setIsPublishing(true);
    try {
      const response = await fetch(`/api/pages/${params.pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} page`);
      }

      setPageStatus(newStatus);
      toast({
        title: newStatus === 'PUBLISHED' ? 'Page published' : 'Page unpublished',
        description: newStatus === 'PUBLISHED'
          ? `Your page is now live at /p/${pageMetadata?.slug}`
          : 'Your page has been unpublished.',
      });
    } catch (error) {
      console.error(`${action} error:`, error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${action} page`,
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
    try {
      const response = await fetch(`/api/pages/${params.pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setPageMetadata({
        ...pageMetadata,
        ...settings,
      });

      toast({
        title: 'Settings saved',
        description: 'Page settings have been updated',
      });
    } catch (error) {
      console.error('Save settings error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const addElementToState = (elementTemplate: any, targetId?: string | null) => {
    const elementId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newElement: ExtendedElement = {
      ...elementTemplate,
      id: elementId,
      name: elementTemplate.name || elementTemplate.type || 'Unnamed Element',
      pageId: params.pageId as string,
      order: 999, // default to end, will be fixed by siblings logic or flat sort
      depth: 0,
      path: elementId,
      content: elementTemplate.content || {},
      styles: elementTemplate.styles || {},
      className: elementTemplate.className || '',
      children: [],
      parentId: null, // default
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!targetId) {
      // Add to root
      setElements(prev => [...prev, { ...newElement, order: prev.length }]);
      return;
    }

    // Deep clone helpers
    const clone = (data: ExtendedElement[]): ExtendedElement[] => JSON.parse(JSON.stringify(data));

    // Recursive function to find target and insert
    const insertIntoTree = (nodes: ExtendedElement[]): { success: boolean, nodes: ExtendedElement[] } => {
      let inserted = false;
      const newNodes = nodes.map(node => {
        if (inserted) return node;

        if (node.id === targetId) {
          // Found target
          if (node.type === 'container') {
            // Insert as child
            inserted = true;
            return {
              ...node,
              children: [
                ...(node.children || []),
                {
                  ...newElement,
                  parentId: node.id,
                  order: (node.children?.length || 0)
                }
              ]
            };
          } else {
            // Not a container, we can't insert INSIDE.
            // We should have handled this at the parent level, 
            // but since we are mapping, we can't easily insert a sibling HERE.
            // We'll return the node as is, and rely on the parent iteration to handle sibling insertion?
            // Actually, simplest way for "add to selected" which is NOT container:
            // We need to look for the parent of targetId and insert there.
            return node;
          }
        }

        // Check children
        if (node.children) {
          const result = insertIntoTree(node.children);
          if (result.success) {
            inserted = true;
            return { ...node, children: result.nodes };
          }
        }
        return node;
      });

      return { success: inserted, nodes: newNodes };
    };

    // First pass: Try to insert INSIDE if target is container
    const currentTreeWithInsert = insertIntoTree(clone(elements));

    if (currentTreeWithInsert.success) {
      setElements(currentTreeWithInsert.nodes);
    } else {
      // Target was found but wasn't a container OR target wasn't found (should rely on sibling logic)
      // Let's implement sibling insertion for non-container targets
      const insertSibling = (nodes: ExtendedElement[], parentId: string | null): { success: boolean, nodes: ExtendedElement[] } => {
        const targetIndex = nodes.findIndex(n => n.id === targetId);
        if (targetIndex !== -1) {
          // Found target in this list
          const newNodes = [...nodes];
          newNodes.splice(targetIndex + 1, 0, {
            ...newElement,
            parentId: parentId,
            order: nodes[targetIndex].order + 1
          });
          // Re-index orders
          return {
            success: true,
            nodes: newNodes.map((n, i) => ({ ...n, order: i }))
          };
        }

        // Search deeper
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].children) {
            const result = insertSibling(nodes[i].children!, nodes[i].id);
            if (result.success) {
              const newNodes = [...nodes];
              newNodes[i] = { ...nodes[i], children: result.nodes };
              return { success: true, nodes: newNodes };
            }
          }
        }

        return { success: false, nodes: nodes };
      };

      const siblingResult = insertSibling(clone(elements), null);
      if (siblingResult.success) {
        setElements(siblingResult.nodes);
      } else {
        // Fallback: Add to root
        setElements(prev => [...prev, { ...newElement, order: prev.length }]);
      }
    }

    toast({
      title: 'Element added',
      description: 'Element added to canvas',
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.isFromPool) {
      setDraggedElement(event.active.data.current.element);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedElement(null);

    if (!over) return;

    // Check if this is an element being added from the pool
    const elementData = active.data.current?.element;
    if (active.data.current?.isFromPool && elementData) {
      // Logic:
      // If dropped on "canvas-root", add to root.
      // If dropped on an element ID, check if container -> add to child.
      // If not container -> add as sibling (handled by addElementToState logic partially).

      const targetId = over.id === 'canvas-root' ? null : (over.id as string);
      addElementToState(elementData, targetId);
      return;
    }

    // Handle reordering existing elements
    if (active.id !== over.id) {
      reorderElements(active.id as string, over.id as string);
    }
  };

  // Reorder elements when dragging within the same level
  const reorderElements = (activeId: string, overId: string) => {
    const clone = (data: ExtendedElement[]): ExtendedElement[] =>
      JSON.parse(JSON.stringify(data));

    // Find element and its parent in tree
    const findElementAndParent = (
      nodes: ExtendedElement[],
      id: string,
      parent: ExtendedElement | null = null
    ): { element: ExtendedElement | null; parent: ExtendedElement | null; siblings: ExtendedElement[] | null } => {
      for (const node of nodes) {
        if (node.id === id) {
          return { element: node, parent, siblings: parent ? parent.children! : nodes };
        }
        if (node.children && node.children.length > 0) {
          const result = findElementAndParent(node.children, id, node);
          if (result.element) return result;
        }
      }
      return { element: null, parent: null, siblings: null };
    };

    const activeResult = findElementAndParent(elements, activeId);
    const overResult = findElementAndParent(elements, overId);

    // Only reorder if elements are at the same level (same parent)
    if (!activeResult.element || !overResult.element) return;
    if (activeResult.parent?.id !== overResult.parent?.id) return;

    // Reorder within the array
    const reorderInArray = (arr: ExtendedElement[], fromId: string, toId: string): ExtendedElement[] => {
      const oldIndex = arr.findIndex(el => el.id === fromId);
      const newIndex = arr.findIndex(el => el.id === toId);
      if (oldIndex === -1 || newIndex === -1) return arr;
      return arrayMove(arr, oldIndex, newIndex);
    };

    if (!activeResult.parent) {
      // Reordering at root level
      const newElements = reorderInArray(clone(elements), activeId, overId);
      setElements(newElements.map((el, i) => ({ ...el, order: i })));
    } else {
      // Reordering inside a container
      const updateChildrenRecursively = (nodes: ExtendedElement[]): ExtendedElement[] => {
        return nodes.map(node => {
          if (node.id === activeResult.parent!.id) {
            const newChildren = reorderInArray(node.children || [], activeId, overId);
            return {
              ...node,
              children: newChildren.map((c, i) => ({ ...c, order: i })),
            };
          }
          if (node.children && node.children.length > 0) {
            return { ...node, children: updateChildrenRecursively(node.children) };
          }
          return node;
        });
      };

      setElements(updateChildrenRecursively(clone(elements)));
    }
  };

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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col bg-gray-50">
        {/* Toolbar */}
        <Toolbar
          onSave={handleSave}
          onPreview={handlePreview}
          onSettings={() => setIsSettingsOpen(true)}
          mode={mode}
          title={pageMetadata?.title}
          isSaving={isSaving}
        />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 overflow-auto p-8">
            <div className="mx-auto max-w-5xl bg-white shadow-lg min-h-screen">
              {elements.length === 0 ? (
                <div className="flex h-96 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p>No content yet</p>
                    <p className="text-sm mt-2">This page has no elements</p>
                  </div>
                </div>
              ) : (
                <AICanvas
                  elements={elements}
                  selectedId={selectedElementId}
                  hoveredId={hoveredElementId}
                  onSelect={setSelectedElementId}
                  onHover={setHoveredElementId}
                  onReorder={setElements}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <EditorSidebar
            selectedElementId={selectedElementId}
            elements={elements}
            onElementUpdate={(id, updates) => {
              const updateInTree = (els: ExtendedElement[]): ExtendedElement[] => {
                return els.map(el => {
                  if (el.id === id) {
                    return { ...el, ...updates };
                  }
                  if (el.children) {
                    return { ...el, children: updateInTree(el.children) };
                  }
                  return el;
                });
              };
              setElements(updateInTree(elements));
            }}
            onElementSelect={setSelectedElementId}
            onAddElement={(element, targetId) => {
              addElementToState(element, targetId);
            }}
            setElements={setElements}
            mode={mode}
          />
        </div>

        <DragOverlay>
          {draggedElement ? (
            <div className="border rounded-lg p-3 bg-white shadow-xl opacity-90 w-48 pointer-events-none">
              <p className="text-sm font-medium">{draggedElement.name}</p>
              <span className="text-xs text-muted-foreground capitalize">{draggedElement.type}</span>
            </div>
          ) : null}
        </DragOverlay>

        {/* Page Settings Dialog */}
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
    </DndContext>
  );
}

// Simple Canvas Component
function AICanvas({
  elements,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onReorder,
}: {
  elements: ExtendedElement[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onReorder: (elements: ExtendedElement[]) => void;
}) {
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
            onSelect={onSelect}
            onHover={onHover}
            onReorder={onReorder}
          />
        ))}
      </SortableContext>
    </div>
  );
}

// Sortable wrapper for root-level elements
function SortableElementNode({
  element,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onReorder,
}: {
  element: ExtendedElement;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onReorder: (elements: ExtendedElement[]) => void;
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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
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
        onSelect={onSelect}
        onHover={onHover}
        onReorder={onReorder}
      />
    </div>
  );
}

// Recursive Element Node
function ElementNode({
  element,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onReorder,
}: {
  element: ExtendedElement;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onReorder: (elements: ExtendedElement[]) => void;
}) {
  const isSelected = selectedId === element.id;
  const content = element.content as any;
  const styles = element.styles as any;

  // Make containers droppable
  const { setNodeRef, isOver } = useDroppable({
    id: element.id,
    disabled: element.type !== 'container', // Only containers can accept drops directly
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(element.id);
  };

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
    isOver && 'ring-2 ring-primary ring-offset-2'
  );

  // Render based on type
  switch (element.type) {
    case 'text': {
      const Tag = (content?.tagName || 'p') as any;
      if (isVoidElement(Tag)) {
        return (
          <Tag
            style={styles}
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
          style={styles}
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
          style={styles}
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
          style={{ width: styles.width, height: styles.height }}
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
            style={styles}
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
            style={styles}
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
            style={styles}
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
        <ContainerTag
          ref={setNodeRef}
          style={styles}
          data-label={element.type}
          className={cn(
            selectionClasses,
            element.className || ''
          )}
          onClick={handleClick}
        >
          <SortableContext
            items={childElements.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {childElements.map(child => (
              <SortableChildElement
                key={child.id}
                element={child}
                selectedId={selectedId}
                hoveredId={hoveredId}
                onSelect={onSelect}
                onHover={onHover}
                onReorder={onReorder}
              />
            ))}
          </SortableContext>
        </ContainerTag>
      );
    }
  }
}

// Sortable wrapper for child elements inside containers
function SortableChildElement({
  element,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onReorder,
}: {
  element: ExtendedElement;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onReorder: (elements: ExtendedElement[]) => void;
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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
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
        onSelect={onSelect}
        onHover={onHover}
        onReorder={onReorder}
      />
    </div>
  );
}

