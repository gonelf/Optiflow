'use client';

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { EditorSidebar } from '@/components/builder/EditorSidebar';
import { AICanvas, ExtendedElement } from '@/components/builder/Canvas';

interface PageEditorProps {
    elements: ExtendedElement[];
    setElements: React.Dispatch<React.SetStateAction<ExtendedElement[]>>;
    selectedElementId: string | null;
    setSelectedElementId: (id: string | null) => void;
    pageId: string;
    mode?: 'default' | 'ab-test';
    toolbar?: React.ReactNode;
}

export function PageEditor({
    elements,
    setElements,
    selectedElementId,
    setSelectedElementId,
    pageId,
    mode = 'default',
    toolbar
}: PageEditorProps) {
    const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
    const [draggedElement, setDraggedElement] = useState<any>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    // Helper: Add Element
    const addElementToState = (elementTemplate: any, targetId?: string | null) => {
        const elementId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newElement: ExtendedElement = {
            ...elementTemplate,
            id: elementId,
            name: elementTemplate.name || elementTemplate.type || 'Unnamed Element',
            pageId: pageId,
            order: 999,
            depth: 0,
            path: elementId,
            content: elementTemplate.content || {},
            styles: elementTemplate.styles || {},
            className: elementTemplate.className || '',
            children: [],
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        if (!targetId) {
            setElements(prev => [...prev, { ...newElement, order: prev.length }]);
            return;
        }

        // Deep clone helpers
        const clone = (data: ExtendedElement[]): ExtendedElement[] => JSON.parse(JSON.stringify(data));

        // Recursive insertion
        const insertIntoTree = (nodes: ExtendedElement[]): { success: boolean, nodes: ExtendedElement[] } => {
            let inserted = false;
            const newNodes = nodes.map(node => {
                if (inserted) return node;

                if (node.id === targetId) {
                    if (node.type === 'container') {
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
                        return node;
                    }
                }

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

        const currentTreeWithInsert = insertIntoTree(clone(elements));

        if (currentTreeWithInsert.success) {
            setElements(currentTreeWithInsert.nodes);
        } else {
            // Sibling insertion logic
            const insertSibling = (nodes: ExtendedElement[], parentId: string | null): { success: boolean, nodes: ExtendedElement[] } => {
                const targetIndex = nodes.findIndex(n => n.id === targetId);
                if (targetIndex !== -1) {
                    const newNodes = [...nodes];
                    newNodes.splice(targetIndex + 1, 0, {
                        ...newElement,
                        parentId: parentId,
                        order: nodes[targetIndex].order + 1
                    });
                    return {
                        success: true,
                        nodes: newNodes.map((n, i) => ({ ...n, order: i }))
                    };
                }

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
                setElements(prev => [...prev, { ...newElement, order: prev.length }]);
            }
        }
    };

    // Helper: Reorder Elements
    const reorderElements = (activeId: string, overId: string) => {
        const clone = (data: ExtendedElement[]): ExtendedElement[] =>
            JSON.parse(JSON.stringify(data));

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

        if (!activeResult.element || !overResult.element) return;
        if (activeResult.parent?.id !== overResult.parent?.id) return;

        const reorderInArray = (arr: ExtendedElement[], fromId: string, toId: string): ExtendedElement[] => {
            const oldIndex = arr.findIndex(el => el.id === fromId);
            const newIndex = arr.findIndex(el => el.id === toId);
            if (oldIndex === -1 || newIndex === -1) return arr;
            return arrayMove(arr, oldIndex, newIndex);
        };

        if (!activeResult.parent) {
            const newElements = reorderInArray(clone(elements), activeId, overId);
            setElements(newElements.map((el, i) => ({ ...el, order: i })));
        } else {
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
            const targetId = over.id === 'canvas-root' ? null : (over.id as string);
            addElementToState(elementData, targetId);
            return;
        }

        if (active.id !== over.id) {
            reorderElements(active.id as string, over.id as string);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full flex-col bg-gray-50">
                {toolbar}

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
            </div>
        </DndContext>
    );
}
