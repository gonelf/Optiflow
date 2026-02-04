'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, MousePointerClick, Zap, Check, CheckCircle2, Globe, Target, X, MousePointer2 } from 'lucide-react';
import { PageRenderer } from '@/components/page-renderer';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PageEditor } from '@/components/builder/PageEditor';
import { ExtendedElement } from '@/components/builder/Canvas';
import { Element } from '@prisma/client';

interface Page {
    id: string;
    title: string;
    slug: string;
    updatedAt: string;
    status: string;
    screenshotUrl: string | null;
    _count: {
        components: number;
    };
}

const PageCard = ({ page, selected, onClick }: { page: Page; selected: boolean; onClick: () => void }) => (
    <div
        onClick={onClick}
        className={cn(
            "group relative flex flex-col rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200",
            selected
                ? "border-blue-500 ring-2 ring-blue-200 shadow-lg shadow-blue-100 scale-[1.02]"
                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-[1.01]"
        )}
    >
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
            {page.screenshotUrl ? (
                <img
                    src={page.screenshotUrl}
                    alt={page.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
                    <Globe className="h-12 w-12 text-gray-300" />
                </div>
            )}
            {/* Overlay gradient on hover */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-200",
                !selected && "group-hover:opacity-100"
            )}></div>

            {selected && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white p-2 rounded-full shadow-lg animate-in fade-in zoom-in duration-200">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
            )}
        </div>
        <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-white to-gray-50/50">
            <h3 className="font-bold text-gray-900 line-clamp-1 text-base mb-1">{page.title}</h3>
            <p className="text-xs text-gray-500 mb-4 line-clamp-1 font-mono">/{page.slug}</p>

            <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <span className="font-semibold">{page._count?.components || 0}</span>
                        <span className="text-gray-500">components</span>
                    </div>
                    <span className={cn(
                        "px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wider",
                        page.status === 'PUBLISHED'
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                    )}>
                        {page.status}
                    </span>
                </div>
                <div className="pt-3 border-t border-gray-200 text-[10px] text-gray-400 font-medium">
                    Updated {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </div>
        </div>
    </div>
);

export default function NewABTestPage() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const workspaceSlug = params.workspaceSlug as string;

    const isEditorMode = searchParams.get('mode') === 'editor';

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [pages, setPages] = useState<Page[]>([]);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [testType, setTestType] = useState<"PAGE_REDIRECT" | "ELEMENT_TEST">('ELEMENT_TEST');

    const [pageId, setPageId] = useState('');
    const [variantPageId, setVariantPageId] = useState('');

    // Step 3 (Goal Selection) State
    const [selectedPageData, setSelectedPageData] = useState<any>(null); // This will hold the *currently viewed* page data
    const [variantPageData, setVariantPageData] = useState<any>(null); // For holding Variant B data cache
    const [controlPageData, setControlPageData] = useState<any>(null); // For holding Control data cache
    const [activePreviewPageId, setActivePreviewPageId] = useState(''); // ID of page currently being previewed

    // Updated goal state to include pageId
    const [selectedGoals, setSelectedGoals] = useState<Array<{ id: string, type: string, text?: string, pageId: string }>>([]);
    const [loadingPage, setLoadingPage] = useState(false);

    // Element Test Editor State
    const [variantElements, setVariantElements] = useState<ExtendedElement[]>([]);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    // Goal Settings (Defaults)
    const [primaryGoal, setPrimaryGoal] = useState('CONVERSION');
    const [conversionEvent, setConversionEvent] = useState('CLICK');

    useEffect(() => {
        // Fetch pages for selection
        const fetchPages = async () => {
            try {
                const response = await fetch(`/api/ab-tests?workspaceSlug=${workspaceSlug}&_listPages=true`);
                if (response.ok) {
                    const data = await response.json();
                    setPages(data.pages || []);
                }
            } catch (error) {
                console.error('Failed to fetch pages:', error);
            }
        };
        fetchPages();
    }, [workspaceSlug]);

    // Helper: Build tree structure from flat list (duplicated from Page Editor logic)
    const buildElementTree = (flatElements: Element[]): ExtendedElement[] => {
        const elementMap = new Map<string, ExtendedElement>();

        // Create map of all elements
        flatElements.forEach(el => {
            elementMap.set(el.id, { ...el, children: [], content: el.content || {}, styles: el.styles || {} });
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

    // Helper: Flatten tree back to list
    const flattenElements = (els: ExtendedElement[], parentId: string | null = null, depth = 0, parentPath = ''): any[] => {
        let flatElements: any[] = [];
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
                flatElements = [...flatElements, ...flattenElements(children, el.id, depth + 1, elementPath)];
            }
        });
        return flatElements;
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Construct conversion event string from selected goals
            // Format: CLICK:elementId1,elementId2
            // Note: In strict tracking, we might want to know WHICH page the click happened on for the goal, 
            // but usually a click on "Sign Up" is a "Sign Up" regardless of page for goal tracking purposes.
            // If the element IDs are unique per page (which they are), simply listing them is fine.
            const conversionEventString = selectedGoals.length > 0
                ? `CLICK:${selectedGoals.map(g => g.id).join(',')}`
                : conversionEvent;

            const payload: any = {
                name,
                description,
                testType,
                pageId, // This is the Control page
                primaryGoal,
                conversionEvent: conversionEventString,
            };

            if (testType === 'PAGE_REDIRECT') {
                if (!variantPageId) {
                    toast({
                        title: 'Error',
                        description: 'Please select a variant page',
                        variant: 'destructive',
                    });
                    setLoading(false);
                    return;
                }

                const controlPage = pages.find(p => p.id === pageId);
                const variantPage = pages.find(p => p.id === variantPageId);

                payload.variantConfigs = [
                    { name: controlPage?.title || 'Control', pageId: pageId },
                    { name: variantPage?.title || 'Variant B', pageId: variantPageId, redirectUrl: `/p/${variantPage?.id}` }
                ];
            } else {
                // Element Test
                payload.variantNames = ['Control', 'Variant B'];
            }

            const response = await fetch('/api/ab-tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create test');
            }

            const data = await response.json();
            const testId = data.test.id;

            toast({
                title: 'Success',
                description: 'A/B Test created successfully',
            });

            if (testType === 'ELEMENT_TEST') {
                // Find the non-control variant (Variant B)
                // And SAVE the changes we made in the editor
                const variantB = data.test.variants.find((v: any) => !v.isControl);

                if (variantB && variantElements.length > 0) {
                    // Save changes to Variant B
                    const flatElements = flattenElements(variantElements);

                    await fetch(`/api/pages/${pageId}/variants/${variantB.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            elements: flatElements,
                        }),
                    });

                    // Redirect to test dashboard
                    router.push(`/${workspaceSlug}/ab-tests/${testId}`);
                } else {
                    router.push(`/${workspaceSlug}/ab-tests/${testId}`);
                }
            } else {
                // Redirect to test dashboard
                router.push(`/${workspaceSlug}/ab-tests/${testId}`);
            }

        } catch (error) {
            console.error('Error creating test:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to create test',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = name.length > 0;
    const isStep2Valid = pageId.length > 0;

    // Helper to switch active preview page
    const switchPreviewPage = (id: string) => {
        setActivePreviewPageId(id);
        if (id === pageId) {
            setSelectedPageData(controlPageData);
        } else if (id === variantPageId) {
            setSelectedPageData(variantPageData);
        }
    };

    return (
        <div className={cn(
            "flex flex-col",
            isEditorMode ? "h-full p-0" : "container mx-auto py-8 px-4",
            !isEditorMode && (step === 3 ? "max-w-7xl" : "max-w-4xl")
        )}>
            {!isEditorMode && (
                <>
                    <Button
                        variant="ghost"
                        className="mb-8 pl-0 hover:bg-gray-100 -ml-2"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Tests
                    </Button>

                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Create New A/B Test
                        </h1>
                        <p className="text-lg text-gray-600">
                            Define your test, set up variants, and configure goals to optimize your pages.
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center flex-1">
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 mb-2",
                                    step >= 1
                                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200"
                                        : "bg-gray-200 text-gray-500"
                                )}>
                                    {step > 1 ? <Check className="h-5 w-5" /> : "1"}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium transition-colors",
                                    step >= 1 ? "text-blue-700" : "text-gray-400"
                                )}>
                                    Details
                                </span>
                            </div>

                            {/* Connector 1 */}
                            <div className={cn(
                                "h-0.5 flex-1 mx-2 transition-all duration-300 -mt-6",
                                step >= 2 ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gray-200"
                            )}></div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center flex-1">
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 mb-2",
                                    step >= 2
                                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200"
                                        : "bg-gray-200 text-gray-500"
                                )}>
                                    {step > 2 ? <Check className="h-5 w-5" /> : "2"}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium transition-colors",
                                    step >= 2 ? "text-blue-700" : "text-gray-400"
                                )}>
                                    Setup
                                </span>
                            </div>

                            {/* Connector 2 */}
                            <div className={cn(
                                "h-0.5 flex-1 mx-2 transition-all duration-300 -mt-6",
                                step >= 3 ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gray-200"
                            )}></div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center flex-1">
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 mb-2",
                                    step >= 3
                                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200"
                                        : "bg-gray-200 text-gray-500"
                                )}>
                                    {step > 3 ? <Check className="h-5 w-5" /> : "3"}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium transition-colors",
                                    step >= 3 ? "text-blue-700" : "text-gray-400"
                                )}>
                                    {testType === 'ELEMENT_TEST' ? 'Customize' : 'Goals'}
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className={cn(
                isEditorMode ? "flex flex-col h-full min-h-0" : "grid gap-6"
            )}>
                {step === 1 && (
                    <Card className="border-none shadow-none md:border-2 md:shadow-lg md:rounded-2xl">
                        <CardHeader className="px-0 md:px-8 pb-6">
                            <CardTitle className="text-2xl font-bold text-gray-900">Test Details</CardTitle>
                            <CardDescription className="text-base text-gray-600 mt-1">
                                Let&apos;s start by defining what you want to test
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 px-0 md:px-8">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-base font-semibold text-gray-900">
                                    Test Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Homepage Hero Test"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 text-base border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                                <p className="text-sm text-gray-500">Give your test a descriptive name</p>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="description" className="text-base font-semibold text-gray-900">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="What are you testing and why? E.g., Testing new headline to improve click-through rate..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[100px] resize-none border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                                <p className="text-sm text-gray-500">Explain the purpose and hypothesis of this test</p>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Test Type <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Page Redirect Card */}
                                    <div
                                        onClick={() => setTestType('PAGE_REDIRECT')}
                                        className={cn(
                                            "cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 relative group overflow-hidden",
                                            testType === 'PAGE_REDIRECT'
                                                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-100"
                                                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                                        )}
                                    >
                                        {/* Subtle gradient overlay on hover */}
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 transition-opacity duration-200",
                                            testType !== 'PAGE_REDIRECT' && "group-hover:from-blue-50/50 group-hover:to-indigo-50/30"
                                        )}></div>

                                        <div className="relative">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={cn(
                                                    "p-3 rounded-xl transition-all duration-200",
                                                    testType === 'PAGE_REDIRECT'
                                                        ? "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg"
                                                        : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-purple-100 group-hover:to-indigo-100"
                                                )}>
                                                    <Zap className={cn(
                                                        "h-6 w-6 transition-colors",
                                                        testType === 'PAGE_REDIRECT' ? "text-white" : "text-gray-600 group-hover:text-purple-600"
                                                    )} />
                                                </div>
                                                {testType === 'PAGE_REDIRECT' && (
                                                    <div className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg animate-in fade-in zoom-in duration-200">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold mb-2 text-gray-900">Page Redirect</h3>
                                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">Compare two different pages against each other</p>

                                            <ul className="space-y-2.5">
                                                {[
                                                    'Test completely different page designs',
                                                    'Compare existing pages',
                                                    'Quick setup - just select 2 pages'
                                                ].map((item, i) => (
                                                    <li key={i} className="flex items-start text-sm text-gray-700">
                                                        <div className={cn(
                                                            "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2.5 mt-0.5 transition-colors",
                                                            testType === 'PAGE_REDIRECT' ? "bg-blue-200" : "bg-gray-200 group-hover:bg-purple-100"
                                                        )}>
                                                            <Check className={cn(
                                                                "h-3 w-3 transition-colors",
                                                                testType === 'PAGE_REDIRECT' ? "text-blue-700" : "text-gray-500 group-hover:text-purple-600"
                                                            )} />
                                                        </div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Element Test Card */}
                                    <div
                                        onClick={() => setTestType('ELEMENT_TEST')}
                                        className={cn(
                                            "cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 relative group overflow-hidden",
                                            testType === 'ELEMENT_TEST'
                                                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg shadow-blue-100"
                                                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                                        )}
                                    >
                                        {/* Subtle gradient overlay on hover */}
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-br from-blue-50/0 to-cyan-50/0 transition-opacity duration-200",
                                            testType !== 'ELEMENT_TEST' && "group-hover:from-blue-50/50 group-hover:to-cyan-50/30"
                                        )}></div>

                                        <div className="relative">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={cn(
                                                    "p-3 rounded-xl transition-all duration-200",
                                                    testType === 'ELEMENT_TEST'
                                                        ? "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg"
                                                        : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-cyan-100"
                                                )}>
                                                    <MousePointerClick className={cn(
                                                        "h-6 w-6 transition-colors",
                                                        testType === 'ELEMENT_TEST' ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                                                    )} />
                                                </div>
                                                {testType === 'ELEMENT_TEST' && (
                                                    <div className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg animate-in fade-in zoom-in duration-200">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold mb-2 text-gray-900">Element Test</h3>
                                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">Use visual editor to create variants with element changes</p>

                                            <ul className="space-y-2.5">
                                                {[
                                                    'Change copy, colors, and styles',
                                                    'Add or remove elements',
                                                    'Visual editor for precise control'
                                                ].map((item, i) => (
                                                    <li key={i} className="flex items-start text-sm text-gray-700">
                                                        <div className={cn(
                                                            "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2.5 mt-0.5 transition-colors",
                                                            testType === 'ELEMENT_TEST' ? "bg-blue-200" : "bg-gray-200 group-hover:bg-blue-100"
                                                        )}>
                                                            <Check className={cn(
                                                                "h-3 w-3 transition-colors",
                                                                testType === 'ELEMENT_TEST' ? "text-blue-700" : "text-gray-500 group-hover:text-blue-600"
                                                            )} />
                                                        </div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end px-0 md:px-8 pt-8 border-t-2 border-gray-100">
                            <Button
                                onClick={() => setStep(2)}
                                disabled={!isStep1Valid}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-8 font-semibold"
                            >
                                Continue to Setup
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="border-none shadow-none md:border-2 md:shadow-lg md:rounded-2xl">
                        <CardHeader className="px-0 md:px-8 pb-6">
                            <CardTitle className="text-2xl font-bold">Configuration</CardTitle>
                            <CardDescription className="text-base text-gray-600 mt-1">
                                {testType === 'PAGE_REDIRECT'
                                    ? 'Select the pages you want to compare.'
                                    : 'Select the page you want to optimize.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-10 px-0 md:px-8">

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        A
                                    </div>
                                    <div>
                                        <Label className="text-base font-bold text-gray-900">Control Page</Label>
                                        <p className="text-sm text-gray-500 mt-0.5">The original page that represents your baseline</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {pages.map((page) => (
                                        <PageCard
                                            key={page.id}
                                            page={page}
                                            selected={pageId === page.id}
                                            onClick={() => setPageId(page.id)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {testType === 'PAGE_REDIRECT' && pageId && (
                                <div className="space-y-4 pt-8 border-t border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            B
                                        </div>
                                        <div>
                                            <Label className="text-base font-bold text-gray-900">Variant B Page</Label>
                                            <p className="text-sm text-gray-500 mt-0.5">The new page design you want to test against the control</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {pages.filter(p => p.id !== pageId).map((page) => (
                                            <PageCard
                                                key={page.id}
                                                page={page}
                                                selected={variantPageId === page.id}
                                                onClick={() => setVariantPageId(page.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {testType === 'ELEMENT_TEST' && pageId && (
                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 p-6 shadow-sm">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-200/30 rounded-full -ml-12 -mb-12"></div>
                                    <div className="relative flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                            <MousePointerClick className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-blue-900 text-lg mb-1">Ready to Customize</h4>
                                            <p className="text-blue-800 text-sm leading-relaxed">
                                                In the next step, you&apos;ll use our visual editor to create variations of the selected page. Make changes to text, colors, images, and more to create your Variant B.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </CardContent>
                        <CardFooter className="flex justify-between px-0 md:px-8 pt-8 border-t-2 border-gray-100">
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                                size="lg"
                                className="h-12 px-8 font-semibold border-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button
                                onClick={async () => {
                                    setLoadingPage(true);
                                    try {
                                        // Always fetch Control page
                                        const controlRes = await fetch(`/api/pages/${pageId}`);
                                        if (!controlRes.ok) throw new Error('Failed to load control page');
                                        const controlData = await controlRes.json();
                                        setControlPageData(controlData);

                                        // Initially show Control page
                                        setSelectedPageData(controlData);
                                        setActivePreviewPageId(pageId);

                                        // If Redirect Test, fetch Variant B page as well
                                        if (testType === 'PAGE_REDIRECT' && variantPageId) {
                                            const variantRes = await fetch(`/api/pages/${variantPageId}`);
                                            if (variantRes.ok) {
                                                const variantData = await variantRes.json();
                                                setVariantPageData(variantData);
                                            }
                                        }

                                        // For Element Test, initialize editor with control elements
                                        if (testType === 'ELEMENT_TEST') {
                                            const tree = buildElementTree(controlData.elements || []);
                                            setVariantElements(tree);
                                            // Add mode=editor to URL to collapse sidebar
                                            // Using replace to avoid adding to history stack unnecessarily for UI toggle
                                            router.replace(`${pathname}?mode=editor`);
                                        }

                                        setStep(3);
                                    } catch (e) {
                                        toast({ title: 'Error', description: 'Failed to load page data', variant: 'destructive' });
                                    } finally {
                                        setLoadingPage(false);
                                    }
                                }}
                                disabled={!isStep2Valid || loadingPage}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-8 font-semibold"
                            >
                                {loadingPage ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        {testType === 'ELEMENT_TEST' ? 'Continue to Editor' : 'Continue to Goals'}
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {step === 3 && (
                    <div className={cn("flex gap-6", isEditorMode ? "h-full flex-1" : "h-[calc(100vh-200px)]")}>
                        {testType === 'ELEMENT_TEST' ? (
                            <div className="w-full h-full flex flex-col">
                                <div className="flex justify-between items-center px-4 py-2 border-b bg-white">
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            router.replace(pathname || '/');
                                            setStep(2);
                                        }}>
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back
                                        </Button>
                                        <div>
                                            <h3 className="text-sm font-bold">Customize Variant B</h3>
                                            <p className="text-xs text-gray-500">Visual Editor Mode</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={handleSubmit} disabled={loading} size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8">
                                            {loading ? 'Creating...' : 'Create Test'}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-hidden relative">
                                    <PageEditor
                                        elements={variantElements}
                                        setElements={setVariantElements}
                                        selectedElementId={selectedElementId}
                                        setSelectedElementId={setSelectedElementId}
                                        pageId={pageId}
                                        mode="ab-test"
                                    />
                                </div>
                            </div>
                        ) : (
                            // Original Step 3 for PAGE_REDIRECT (Goal Selection)
                            <>
                                {/* Sidebar */}
                                <Card className="w-1/3 flex flex-col h-full border-2 border-gray-200 shadow-lg">
                                    <CardHeader className="border-b bg-gradient-to-br from-blue-50 to-cyan-50 pb-6">
                                        <CardTitle className="flex items-center gap-3 text-xl">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                                                <Target className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-gray-900">Conversion Goals</span>
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-700 mt-2 leading-relaxed">
                                            Click on elements in the preview to track them as conversion goals.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-hidden flex flex-col p-5">
                                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-900 p-4 rounded-xl text-sm mb-5 flex gap-3 shadow-sm">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                                <MousePointer2 className="h-4 w-4 text-white" />
                                            </div>
                                            <p className="leading-relaxed">
                                                Interact with the preview on the right to select buttons or links you want to track.
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-sm text-gray-900">Selected Elements</h3>
                                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                                {selectedGoals.length}
                                            </span>
                                        </div>
                                        <ScrollArea className="flex-1 pr-2">
                                            {selectedGoals.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                                                    <Target className="h-12 w-12 mb-3 opacity-50" />
                                                    <p className="text-sm font-medium">No elements selected</p>
                                                    <p className="text-xs mt-1">Click elements in the preview</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2.5">
                                                    {selectedGoals.map((goal, idx) => (
                                                        <div key={`${goal.id}-${idx}`} className="flex items-center justify-between p-3.5 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 group">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-sm flex items-center gap-2 mb-1.5">
                                                                    <Badge variant="outline" className="text-[10px] h-5 px-2 uppercase font-bold bg-gray-100 border-gray-300">
                                                                        {goal.type}
                                                                    </Badge>
                                                                    <span className="truncate text-gray-900">{goal.text || 'Unnamed Element'}</span>
                                                                </div>
                                                                <div className="text-[11px] text-gray-500 font-mono flex items-center gap-2">
                                                                    {/* Show which page is this from if we have multiple pages */}
                                                                    {testType === 'PAGE_REDIRECT' && (
                                                                        <span className={cn(
                                                                            "px-2 py-0.5 rounded-full font-bold text-[10px]",
                                                                            goal.pageId === pageId
                                                                                ? "bg-blue-100 text-blue-700"
                                                                                : "bg-purple-100 text-purple-700"
                                                                        )}>
                                                                            {goal.pageId === pageId ? 'Control' : 'Variant B'}
                                                                        </span>
                                                                    )}
                                                                    <span className="opacity-60">{goal.id.substring(0, 8)}...</span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 ml-2 flex-shrink-0"
                                                                onClick={() => setSelectedGoals(prev => prev.filter(g => g.id !== goal.id))}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </CardContent>
                                    <CardFooter className="border-t-2 p-5 bg-gradient-to-br from-gray-50 to-white flex flex-col gap-3">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={loading || selectedGoals.length === 0}
                                            size="lg"
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 font-semibold"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Create Test
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep(2)}
                                            size="lg"
                                            className="w-full h-11"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back
                                        </Button>
                                    </CardFooter>
                                </Card>

                                {/* Visual Preview */}
                                <div className="flex-1 flex flex-col gap-5">

                                    {/* Page Switcher for Redirect Tests */}
                                    {testType === 'PAGE_REDIRECT' && variantPageData && (
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-1.5 rounded-xl border-2 border-gray-200 inline-flex self-start shadow-sm">
                                            <button
                                                className={cn(
                                                    "px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2",
                                                    activePreviewPageId === pageId
                                                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg"
                                                        : "text-gray-700 hover:bg-white/70"
                                                )}
                                                onClick={() => switchPreviewPage(pageId)}
                                            >
                                                <div className={cn(
                                                    "w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold",
                                                    activePreviewPageId === pageId
                                                        ? "bg-white/20"
                                                        : "bg-blue-100 text-blue-700"
                                                )}>
                                                    A
                                                </div>
                                                Control Page
                                            </button>
                                            <button
                                                className={cn(
                                                    "px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2",
                                                    activePreviewPageId === variantPageId
                                                        ? "bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg"
                                                        : "text-gray-700 hover:bg-white/70"
                                                )}
                                                onClick={() => switchPreviewPage(variantPageId)}
                                            >
                                                <div className={cn(
                                                    "w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold",
                                                    activePreviewPageId === variantPageId
                                                        ? "bg-white/20"
                                                        : "bg-purple-100 text-purple-700"
                                                )}>
                                                    B
                                                </div>
                                                Variant B Page
                                            </button>
                                        </div>
                                    )}

                                    <div className={cn(
                                        "flex-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-2 border-gray-300 overflow-hidden relative shadow-lg",
                                        testType !== 'PAGE_REDIRECT' ? "h-full" : ""
                                    )}>
                                        {selectedPageData ? (
                                            <div className="absolute inset-0 overflow-y-auto">
                                                <div className="min-h-full bg-white origin-top transform scale-[0.8] origin-top-left w-[125%] shadow-xl">
                                                    <PageRenderer
                                                        pageId={selectedPageData.id}
                                                        components={selectedPageData.components}
                                                        elements={selectedPageData.elements}
                                                        selectionMode={true}
                                                        selectedElementIds={selectedGoals.filter(g => g.pageId === selectedPageData.id).map(g => g.id)}
                                                        onElementSelect={(id, type, text) => {
                                                            if (selectedGoals.find(g => g.id === id)) {
                                                                setSelectedGoals(prev => prev.filter(g => g.id !== id));
                                                            } else {
                                                                setSelectedGoals(prev => [...prev, { id, type, text, pageId: selectedPageData.id }]);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
                                                <p className="text-sm font-medium text-gray-600">Loading preview...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
