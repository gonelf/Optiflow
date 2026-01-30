'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Save, Eye, Settings, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Element } from '@prisma/client';
import { AIEditPopover } from '@/components/builder/ai/AIEditPopover';
import { styleObjectToString, stringToStyleObject } from '@/lib/css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  BoxModelEditor,
  LayoutPanel,
  TypographyPanel,
  SizingPanel,
  BorderPanel,
  BackgroundPanel
} from '@/components/builder/style-panel';
import { ElementActions } from '@/components/builder/ElementActions';
import { ElementPoolPalette } from '@/components/builder/ElementPoolPalette';
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

interface ExtendedElement extends Element {
  children?: ExtendedElement[];
}

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [elements, setElements] = useState<ExtendedElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [pageMetadata, setPageMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showElementPool, setShowElementPool] = useState(false);
  const [draggedElement, setDraggedElement] = useState<any>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  // Load page data
  useEffect(() => {
    const loadPage = async () => {
      const pageId = params.pageId as string;

      try {
        const response = await fetch(`/api/pages/${pageId}`);
        if (!response.ok) throw new Error('Failed to load page');

        const data = await response.json();

        setPageMetadata({
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description,
        });

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
  }, [params.pageId, toast]);

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
      const flatten = (els: ExtendedElement[], parentId: string | null = null, depth = 0) => {
        els.forEach((el, index) => {
          const { children, ...elementData } = el;
          flatElements.push({
            ...elementData,
            parentId,
            order: index,
            depth,
          });
          if (children && children.length > 0) {
            flatten(children, el.id, depth + 1);
          }
        });
      };
      flatten(elements);

      const response = await fetch(`/api/pages/${params.pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements: flatElements }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast({
        title: 'Saved',
        description: 'Page saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save page',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(`/p/${pageMetadata?.slug}`, '_blank');
  };

  const handleBack = () => {
    router.push(`/${params.workspaceSlug}/pages`);
  };

  const addElementToState = (elementTemplate: any, targetId?: string | null) => {
    const newElement: ExtendedElement = {
      ...elementTemplate,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: 999, // default to end, will be fixed by siblings logic or flat sort
      children: [],
      parentId: null // default
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

    const elementData = active.data.current?.element;
    if (active.data.current?.isFromPool && elementData) {
      // Logic:
      // If dropped on "canvas-root", add to root.
      // If dropped on an element ID, check if container -> add to child.
      // If not container -> add as sibling (handled by addElementToState logic partially).

      const targetId = over.id === 'canvas-root' ? null : (over.id as string);
      addElementToState(elementData, targetId);
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
        <div className="flex items-center justify-between border-b bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <h1 className="font-semibold text-sm">{pageMetadata?.title}</h1>
              <p className="text-xs text-muted-foreground">AI Generated Page</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowElementPool(!showElementPool)}
              className={showElementPool ? 'bg-primary/10 border-primary' : ''}
            >
              <Save className="h-4 w-4 mr-2" />
              {showElementPool ? 'Hide Pool' : 'Show Pool'}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

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
                  onSelect={setSelectedElementId}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex">
            {/* Property Panel */}
            {selectedElementId && (
              <AIPropertyPanel
                elementId={selectedElementId}
                elements={elements}
                onUpdate={(id, updates) => {
                  // Update element in tree
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
                onClose={() => setSelectedElementId(null)}
                setShowElementPool={setShowElementPool}
                setElements={setElements}
              />
            )}

            {/* Element Pool Palette */}
            {showElementPool && (
              <div className="w-64 border-l bg-white overflow-hidden">
                <ElementPoolPalette
                  onAddToCanvas={(element) => {
                    addElementToState(element, selectedElementId);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <DragOverlay>
          {draggedElement ? (
            <div className="border rounded-lg p-3 bg-white shadow-xl opacity-90 w-48 pointer-events-none">
              <p className="text-sm font-medium">{draggedElement.name}</p>
              <span className="text-xs text-muted-foreground capitalize">{draggedElement.type}</span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

// Simple Canvas Component
function AICanvas({
  elements,
  selectedId,
  onSelect
}: {
  elements: ExtendedElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-8 min-h-screen transition-colors",
        isOver && "bg-primary/5 ring-2 ring-inset ring-primary/20"
      )}
    >
      {elements.map(el => (
        <ElementNode
          key={el.id}
          element={el}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// Recursive Element Node
function ElementNode({
  element,
  selectedId,
  onSelect,
}: {
  element: ExtendedElement;
  selectedId: string | null;
  onSelect: (id: string) => void;
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

    case 'container':
    default: {
      const ContainerTag = (content?.tagName || 'div') as any;
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
          {element.children?.map(child => (
            <ElementNode
              key={child.id}
              element={child}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ContainerTag>
      );
    }
  }
}

function AIPropertyPanel({
  elementId,
  elements,
  onUpdate,
  onClose,
  setShowElementPool,
  setElements,
}: {
  elementId: string;
  elements: ExtendedElement[];
  onUpdate: (id: string, updates: Partial<Element>) => void;
  onClose: () => void;
  setShowElementPool: (show: boolean) => void;
  setElements: (elements: ExtendedElement[]) => void;
}) {
  // Find element in tree
  const findElement = (els: ExtendedElement[]): ExtendedElement | null => {
    for (const el of els) {
      if (el.id === elementId) return el;
      if (el.children) {
        const found = findElement(el.children);
        if (found) return found;
      }
    }
    return null;
  };

  const element = findElement(elements);
  if (!element) return null;

  const content = element.content as any;
  const styles = (element.styles || {}) as any;

  // Handler for AI updates
  const handleAIUpdate = (updatedElement: any) => {
    onUpdate(element.id, {
      content: updatedElement.content,
      styles: updatedElement.styles,
    });
  };

  const handleStyleChange = (newStyles: any) => {
    onUpdate(element.id, {
      styles: {
        ...styles,
        ...newStyles
      }
    });
  }

  const handleCssChange = (css: string) => {
    const newStyles = stringToStyleObject(css);
    onUpdate(element.id, {
      styles: newStyles,
    });
  };

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full shadow-xl z-10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Edit Element</h3>
          <AIEditPopover element={element} onUpdate={handleAIUpdate} />
        </div>
        <div className="flex items-center gap-1">
          <ElementActions
            elementId={elementId}
            element={element}
            onActionComplete={(action) => {
              if (action === 'delete') {
                // Find and remove element from tree
                const removeFromTree = (els: ExtendedElement[]): ExtendedElement[] => {
                  return els.filter(el => {
                    if (el.id === elementId) return false;
                    if (el.children) {
                      el.children = removeFromTree(el.children);
                    }
                    return true;
                  });
                };
                setElements(removeFromTree(elements));
                onClose();
              } else if (action === 'duplicate') {
                // Find element and duplicate it
                const findAndDuplicate = (els: ExtendedElement[]): ExtendedElement[] => {
                  const result: ExtendedElement[] = [];
                  for (const el of els) {
                    if (el.id === elementId) {
                      const duplicated: ExtendedElement = {
                        ...JSON.parse(JSON.stringify(el)),
                        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        order: el.order + 1,
                      };
                      result.push(el);
                      result.push(duplicated);
                    } else if (el.children) {
                      el.children = findAndDuplicate(el.children);
                      result.push(el);
                    } else {
                      result.push(el);
                    }
                  }
                  return result;
                };
                setElements(findAndDuplicate(elements));
              } else if (action === 'save') {
                setShowElementPool(true);
              }
            }}
          />
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="style" className="w-full">
          <div className="sticky top-0 bg-white z-10 border-b">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="content"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary py-3 text-xs"
              >
                Content
              </TabsTrigger>
              <TabsTrigger
                value="style"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary py-3 text-xs"
              >
                Style
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary py-3 text-xs"
              >
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Tab */}
          <TabsContent value="content" className="p-4 space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <p className="text-sm font-medium capitalize">{element.type}</p>
              </div>

              {(element.type === 'text' || element.type === 'button') && (
                <div className="space-y-2">
                  <Label className="text-xs">Content</Label>
                  <input
                    type="text"
                    value={content?.content || ''}
                    onChange={(e) => onUpdate(element.id, {
                      content: { ...content, content: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-sm border rounded bg-background"
                  />
                </div>
              )}

              {element.type === 'image' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Image URL</Label>
                    <input
                      type="text"
                      value={content?.src || ''}
                      onChange={(e) => onUpdate(element.id, {
                        content: { ...content, src: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-sm border rounded bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Alt Text</Label>
                    <input
                      type="text"
                      value={content?.alt || ''}
                      onChange={(e) => onUpdate(element.id, {
                        content: { ...content, alt: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-sm border rounded bg-background"
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="p-0">
            <div className="divide-y">
              <div className="p-4">
                <LayoutPanel styles={styles} onChange={handleStyleChange} />
              </div>
              <div className="p-4">
                <SizingPanel styles={styles} onChange={handleStyleChange} />
              </div>
              <div className="p-4">
                <BoxModelEditor styles={styles} onChange={handleStyleChange} />
              </div>
              <div className="p-4">
                <TypographyPanel styles={styles} onChange={handleStyleChange} />
              </div>
              <div className="p-4">
                <BackgroundPanel styles={styles} onChange={handleStyleChange} />
              </div>
              <div className="p-4">
                <BorderPanel styles={styles} onChange={handleStyleChange} />
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="p-4 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Custom CSS</Label>
              <textarea
                value={styleObjectToString(styles)}
                onChange={(e) => handleCssChange(e.target.value)}
                placeholder="color: red; padding: 10px;"
                className="w-full h-48 px-3 py-2 border rounded font-mono text-xs bg-muted/20 resize-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <p className="text-[10px] text-muted-foreground">
                Write standard CSS. It will be applied to the element.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">CSS Classes</Label>
              <input
                className="w-full px-3 py-2 text-sm border rounded bg-background"
                placeholder="class-name another-class"
                value={element.className || ''}
                onChange={(e) => onUpdate(element.id, { className: e.target.value })}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
