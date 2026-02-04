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
    TouchSensor,
    pointerWithin
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
    showAI?: boolean;
}

export function PageEditor({
    elements,
    setElements,
    selectedElementId,
    setSelectedElementId,
    pageId,
    mode = 'default',
    toolbar,
    showAI = true
}: PageEditorProps) {
    const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
    const [draggedElement, setDraggedElement] = useState<any>(null);
    const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
    const isDragging = !!draggedElement || !!activeDraggingId;

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

        if (!targetId || targetId === 'canvas-root') {
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

        const tree = clone(elements);

        let movedElement: ExtendedElement | null = null;
        const removeElement = (nodes: ExtendedElement[]): ExtendedElement[] => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === activeId) {
                    movedElement = nodes[i];
                    nodes.splice(i, 1);
                    return nodes;
                }
                if (nodes[i].children) {
                    nodes[i].children = removeElement(nodes[i].children!);
                }
            }
            return nodes;
        };

        const treeWithoutActive = removeElement(tree);
        if (!movedElement) return;

        const insertElement = (nodes: ExtendedElement[], parentId: string | null): boolean => {
            const overIndex = nodes.findIndex(n => n.id === overId);
            if (overIndex !== -1) {
                const finalMoved = {
                    ...movedElement!,
                    parentId,
                    order: overIndex
                };
                nodes.splice(overIndex, 0, finalMoved);
                nodes.forEach((n, i) => n.order = i);
                return true;
            }

            for (const node of nodes) {
                if (node.children) {
                    if (insertElement(node.children, node.id)) return true;
                }
            }
            return false;
        };

        if (insertElement(treeWithoutActive, null)) {
            setElements(treeWithoutActive);
        } else {
            setElements([...treeWithoutActive, { ...(movedElement as any), parentId: null, order: treeWithoutActive.length }]);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDraggingId(event.active.id as string);
        if (event.active.data.current?.isFromPool) {
            setDraggedElement(event.active.data.current.element);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setDraggedElement(null);
        setActiveDraggingId(null);

        if (!over) return;

        let activeId = active.id as string;
        let overId = over.id as string;

        // Handle drop zone overlay IDs (strip -dropzone suffix to get actual container ID)
        if (overId.endsWith('-dropzone')) {
            overId = overId.replace('-dropzone', '');
        }

        const elementData = active.data.current?.element;
        if ((active.data.current?.isFromPool || activeId.startsWith('sidebar-') || activeId.startsWith('pool-')) && elementData) {
            const targetId = overId === 'canvas-root' ? null : overId;
            addElementToState(elementData, targetId);
            return;
        }

        if (activeId !== overId) {
            if (overId === 'canvas-root') {
                const clone = (data: ExtendedElement[]): ExtendedElement[] => JSON.parse(JSON.stringify(data));
                const tree = clone(elements);
                let movedElement: ExtendedElement | null = null;
                const removeElement = (nodes: ExtendedElement[]): ExtendedElement[] => {
                    for (let i = 0; i < nodes.length; i++) {
                        if (nodes[i].id === activeId) {
                            movedElement = nodes[i];
                            nodes.splice(i, 1);
                            return nodes;
                        }
                        if (nodes[i].children) {
                            nodes[i].children = removeElement(nodes[i].children!);
                        }
                    }
                    return nodes;
                };
                const treeWithoutActive = removeElement(tree);
                if (movedElement) {
                    setElements([...treeWithoutActive, { ...(movedElement as any), parentId: null, order: treeWithoutActive.length }]);
                }
            } else {
                const overData = over.data.current;
                const isOverContainer = overData?.isContainer || false;

                const clone = (data: ExtendedElement[]): ExtendedElement[] => JSON.parse(JSON.stringify(data));
                const tree = clone(elements);

                let movedElement: ExtendedElement | null = null;
                const findElement = (nodes: ExtendedElement[]): ExtendedElement | null => {
                    for (const node of nodes) {
                        if (node.id === activeId) return node;
                        if (node.children) {
                            const found = findElement(node.children);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                movedElement = findElement(tree);
                if (!movedElement) return;

                const isActiveAlreadyChild = movedElement.parentId === overId;

                if (isOverContainer && isActiveAlreadyChild) {
                    // ESCAPE LOGIC: dropping onto own parent container moves it to the grandparent lvl (sibling of parent)
                    const removeElement = (nodes: ExtendedElement[]): ExtendedElement[] => {
                        for (let i = 0; i < nodes.length; i++) {
                            if (nodes[i].id === activeId) {
                                nodes.splice(i, 1);
                                return nodes;
                            }
                            if (nodes[i].children) {
                                nodes[i].children = removeElement(nodes[i].children!);
                            }
                        }
                        return nodes;
                    };
                    const treeWithoutActive = removeElement(tree);
                    const insertAfterParent = (nodes: ExtendedElement[]): boolean => {
                        const parentIndex = nodes.findIndex(n => n.id === overId);
                        if (parentIndex !== -1) {
                            nodes.splice(parentIndex + 1, 0, {
                                ...movedElement!,
                                parentId: nodes[parentIndex].parentId,
                                order: nodes[parentIndex].order + 1
                            });
                            nodes.forEach((n, i) => n.order = i);
                            return true;
                        }
                        for (const node of nodes) {
                            if (node.children) {
                                if (insertAfterParent(node.children)) return true;
                            }
                        }
                        return false;
                    };
                    if (insertAfterParent(treeWithoutActive)) {
                        setElements(treeWithoutActive);
                    }
                } else if (isOverContainer && !isActiveAlreadyChild) {
                    const removeElement = (nodes: ExtendedElement[]): ExtendedElement[] => {
                        for (let i = 0; i < nodes.length; i++) {
                            if (nodes[i].id === activeId) {
                                nodes.splice(i, 1);
                                return nodes;
                            }
                            if (nodes[i].children) {
                                nodes[i].children = removeElement(nodes[i].children!);
                            }
                        }
                        return nodes;
                    };
                    const treeWithoutActive = removeElement(tree);
                    const insertIntoContainer = (nodes: ExtendedElement[]): boolean => {
                        for (const node of nodes) {
                            if (node.id === overId) {
                                node.children = [...(node.children || []), {
                                    ...(movedElement as any),
                                    parentId: node.id,
                                    order: node.children?.length || 0
                                }];
                                return true;
                            }
                            if (node.children) {
                                if (insertIntoContainer(node.children)) return true;
                            }
                        }
                        return false;
                    };
                    if (insertIntoContainer(treeWithoutActive)) {
                        setElements(treeWithoutActive);
                    }
                } else {
                    reorderElements(activeId, overId);
                }
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full flex-col bg-gray-50">
                {toolbar}
                <div className="flex flex-1 overflow-hidden">
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
                                    isDragActive={isDragging}
                                    onSelect={setSelectedElementId}
                                    onHover={setHoveredElementId}
                                    onReorder={setElements}
                                />
                            )}
                        </div>
                    </div>
                    <EditorSidebar
                        selectedElementId={selectedElementId}
                        elements={elements}
                        onElementUpdate={(id, updates) => {
                            const updateInTree = (els: ExtendedElement[]): ExtendedElement[] => {
                                return els.map(el => {
                                    if (el.id === id) return { ...el, ...updates };
                                    if (el.children) return { ...el, children: updateInTree(el.children) };
                                    return el;
                                });
                            };
                            setElements(updateInTree(elements));
                        }}
                        onElementSelect={setSelectedElementId}
                        onAddElement={(element, targetId) => addElementToState(element, targetId)}
                        setElements={setElements}
                        mode={mode}
                        showAI={showAI}
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
