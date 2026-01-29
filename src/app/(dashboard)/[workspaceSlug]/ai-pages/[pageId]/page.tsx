'use client';

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

interface ExtendedElement extends Element {
    children?: ExtendedElement[];
}

export default function AIPageEditor() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const [elements, setElements] = useState<ExtendedElement[]>([]);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [pageMetadata, setPageMetadata] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
                    />
                )}
            </div>
        </div>
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
    return (
        <div className="p-8">
            {elements.map(el => (
                <ElementNode
                    key={el.id}
                    element={el}
                    isSelected={selectedId === el.id}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}

// Recursive Element Node
function ElementNode({
    element,
    isSelected,
    onSelect,
}: {
    element: ExtendedElement;
    isSelected: boolean;
    onSelect: (id: string) => void;
}) {
    const content = element.content as any;
    const styles = element.styles as any;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(element.id);
    };

    // Render based on type
    const renderContent = () => {
        switch (element.type) {
            case 'text':
                const Tag = (content?.tagName || 'p') as any;
                return <Tag style={styles}>{content?.content || 'Text'}</Tag>;

            case 'button':
                return <button style={styles}>{content?.content || 'Button'}</button>;

            case 'image':
                return <img src={content?.src || 'https://via.placeholder.com/150'} alt={content?.alt || ''} style={styles} />;

            case 'container':
            default:
                const ContainerTag = (content?.tagName || 'div') as any;
                return (
                    <ContainerTag style={styles}>
                        {element.children?.map(child => (
                            <ElementNode
                                key={child.id}
                                element={child}
                                isSelected={false}
                                onSelect={onSelect}
                            />
                        ))}
                    </ContainerTag>
                );
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`relative ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'} transition-all cursor-pointer`}
        >
            {renderContent()}
        </div>
    );
}

function AIPropertyPanel({
    elementId,
    elements,
    onUpdate,
    onClose,
}: {
    elementId: string;
    elements: ExtendedElement[];
    onUpdate: (id: string, updates: Partial<Element>) => void;
    onClose: () => void;
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
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                </Button>
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
