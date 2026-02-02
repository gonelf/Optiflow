'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
            "group relative flex flex-col rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:border-blue-400 hover:shadow-sm",
            selected ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50/10" : "border-muted bg-white"
        )}
    >
        <div className="aspect-video bg-gray-100 relative overflow-hidden border-b">
            {page.screenshotUrl ? (
                <img
                    src={page.screenshotUrl}
                    alt={page.title}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400">
                    <span className="text-sm font-medium">No Preview</span>
                </div>
            )}
            {selected && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-md">
                    <CheckCircle2 className="h-4 w-4" />
                </div>
            )}
        </div>
        <div className="p-4 flex flex-col flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{page.title}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-1">/{page.slug}</p>

            <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <span className="font-medium">{page._count?.components || 0}</span> components
                </div>
                <span className={cn(
                    "px-2 py-0.5 rounded-full font-medium text-[10px] uppercase tracking-wider",
                    page.status === 'PUBLISHED' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                )}>
                    {page.status}
                </span>
            </div>
            <div className="pt-3 mt-3 border-t text-[10px] text-gray-400">
                Updated {new Date(page.updatedAt).toLocaleDateString()}
            </div>
        </div>
    </div>
);

export default function NewABTestPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const workspaceSlug = params.workspaceSlug as string;

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
                // Redirect to editor for the first variant (not control)
                const variantB = data.test.variants.find((v: any) => !v.isControl);
                if (variantB) {
                    router.push(`/${workspaceSlug}/pages/${pageId}?variantId=${variantB.id}`);
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
        <div className={cn("container mx-auto py-8 px-4", step === 3 ? "max-w-7xl" : "max-w-4xl")}>
            <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tests
            </Button>

            <h1 className="text-3xl font-bold mb-2">Create New A/B Test</h1>
            <p className="text-gray-600 mb-8">Define your test, set up variants, and configure goals.</p>

            {/* Progress Steps */}
            <div className="flex items-center mb-8">
                <div className={cn("flex items-center justify-center w-8 h-8 rounded-full font-medium transition-colors", step >= 1 ? "bg-black text-white" : "bg-gray-200 text-gray-500")}>1</div>
                <div className={cn("h-1 w-16 mx-2 transition-colors", step >= 2 ? "bg-black" : "bg-gray-200")}></div>
                <div className={cn("flex items-center justify-center w-8 h-8 rounded-full font-medium transition-colors", step >= 2 ? "bg-black text-white" : "bg-gray-200 text-gray-500")}>2</div>
                <div className={cn("h-1 w-16 mx-2 transition-colors", step >= 3 ? "bg-black" : "bg-gray-200")}></div>
                <div className={cn("flex items-center justify-center w-8 h-8 rounded-full font-medium transition-colors", step >= 3 ? "bg-black text-white" : "bg-gray-200 text-gray-500")}>3</div>
                <span className="ml-3 font-medium text-sm">
                    {step === 1 ? 'Test Details' : step === 2 ? 'Configuration' : 'Goal Selection'}
                </span>
            </div>

            <div className="grid gap-6">
                {step === 1 && (
                    <Card className="border-none shadow-none md:border md:shadow-sm">
                        <CardHeader className="px-0 md:px-6">
                            {/* Header content implied by page title */}
                        </CardHeader>
                        <CardContent className="space-y-8 px-0 md:px-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold">Test Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Homepage Hero Test"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="What are you testing and why?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Test Type <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Page Redirect Card */}
                                    <div
                                        onClick={() => setTestType('PAGE_REDIRECT')}
                                        className={cn(
                                            "cursor-pointer rounded-xl border-2 p-6 transition-all relative",
                                            testType === 'PAGE_REDIRECT'
                                                ? "border-blue-500 bg-blue-50/50"
                                                : "border-muted bg-white hover:bg-gray-50 hover:border-gray-300"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <Zap className="h-6 w-6 text-gray-700" />
                                            </div>
                                            {testType === 'PAGE_REDIRECT' && (
                                                <CheckCircle2 className="h-6 w-6 text-blue-500" />
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold mb-1">Page Redirect</h3>
                                        <p className="text-sm text-gray-500 mb-6">Compare two different pages against each other</p>

                                        <ul className="space-y-2 mt-auto">
                                            {[
                                                'Test completely different page designs',
                                                'Compare existing pages',
                                                'Quick setup - just select 2 pages'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start text-sm text-gray-600">
                                                    <Check className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Element Test Card */}
                                    <div
                                        onClick={() => setTestType('ELEMENT_TEST')}
                                        className={cn(
                                            "cursor-pointer rounded-xl border-2 p-6 transition-all relative",
                                            testType === 'ELEMENT_TEST'
                                                ? "border-blue-500 bg-blue-50/50"
                                                : "border-muted bg-white hover:bg-gray-50 hover:border-gray-300"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <MousePointerClick className="h-6 w-6 text-blue-600" />
                                            </div>
                                            {testType === 'ELEMENT_TEST' && (
                                                <CheckCircle2 className="h-6 w-6 text-blue-500" />
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold mb-1 text-blue-900">Element Test</h3>
                                        <p className="text-sm text-gray-500 mb-6">Use visual editor to create variants with element changes</p>

                                        <ul className="space-y-2 mt-auto">
                                            {[
                                                'Change copy, colors, and styles',
                                                'Add or remove elements',
                                                'Visual editor for precise control'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start text-sm text-gray-600">
                                                    <Check className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end px-0 md:px-6">
                            <Button onClick={() => setStep(2)} disabled={!isStep1Valid} size="lg">
                                Next Step
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="border-none shadow-none md:border md:shadow-sm">
                        <CardHeader className="px-0 md:px-6">
                            <CardTitle className="text-xl">Configuration</CardTitle>
                            <CardDescription className="text-base text-gray-500">
                                {testType === 'PAGE_REDIRECT'
                                    ? 'Select the pages you want to compare.'
                                    : 'Select the page you want to optimize.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 px-0 md:px-6">

                            <div className="space-y-3">
                                <Label className="text-base font-semibold text-gray-900">Select Control Page</Label>
                                <p className="text-sm text-gray-500 mb-4">The original page that represents your baseline.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <div className="space-y-3 pt-8 border-t border-gray-100">
                                    <Label className="text-base font-semibold text-gray-900">Select Variant B Page</Label>
                                    <p className="text-sm text-gray-500 mb-4">The new page design you want to test against the control.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                            {testType === 'ELEMENT_TEST' && (
                                <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-start gap-3 mt-4 border border-blue-100">
                                    <MousePointerClick className="h-5 w-5 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold">Ready to Edit</h4>
                                        <p className="mt-1 opacity-90">
                                            Once created, we&apos;ll take you to the visual editor to make changes to Variant B.
                                        </p>
                                    </div>
                                </div>
                            )}

                        </CardContent>
                        <CardFooter className="flex justify-between px-0 md:px-6">
                            <Button variant="outline" onClick={() => setStep(1)} size="lg" className="h-11 px-8">
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

                                        setStep(3);
                                    } catch (e) {
                                        toast({ title: 'Error', description: 'Failed to load page data', variant: 'destructive' });
                                    } finally {
                                        setLoadingPage(false);
                                    }
                                }}
                                disabled={!isStep2Valid || loadingPage}
                                size="lg"
                                className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loadingPage ? 'Loading...' : 'Next Step'}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {step === 3 && (
                    <div className="flex gap-6 h-[calc(100vh-200px)]">
                        {/* Sidebar */}
                        <Card className="w-1/3 flex flex-col h-full border-none shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-blue-600" />
                                    Select Goals
                                </CardTitle>
                                <CardDescription>
                                    Click on elements in the preview to track them as conversion goals.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden flex flex-col p-4">
                                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 flex gap-2">
                                    <MousePointer2 className="h-4 w-4 shrink-0 mt-0.5" />
                                    <p>Interact with the preview on the right to select buttons or links.</p>
                                </div>

                                <h3 className="font-semibold text-sm text-gray-700 mb-2">Selected Elements ({selectedGoals.length})</h3>
                                <ScrollArea className="flex-1 pr-4">
                                    {selectedGoals.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                                            No elements selected
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedGoals.map((goal, idx) => (
                                                <div key={`${goal.id}-${idx}`} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm group">
                                                    <div>
                                                        <div className="font-medium text-sm flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px] h-5 px-1 uppercase">{goal.type}</Badge>
                                                            <span className="truncate max-w-[150px]">{goal.text || 'Unnamed Element'}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1 font-mono">
                                                            {/* Show which page is this from if we have multiple pages */}
                                                            {testType === 'PAGE_REDIRECT' && (
                                                                <span className="mr-2 text-indigo-500 font-semibold">
                                                                    {goal.pageId === pageId ? 'Control' : 'Variant B'}
                                                                </span>
                                                            )}
                                                            {goal.id.substring(0, 8)}...
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-gray-400 hover:text-red-500"
                                                        onClick={() => setSelectedGoals(prev => prev.filter(g => g.id !== goal.id))}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="border-t p-4 bg-gray-50 flex justify-between">
                                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                                <Button onClick={handleSubmit} disabled={loading || selectedGoals.length === 0} className="bg-green-600 hover:bg-green-700 text-white">
                                    {loading ? 'Creating...' : 'Create Test'}
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Visual Preview */}
                        <div className="flex-1 flex flex-col gap-4">

                            {/* Page Switcher for Redirect Tests */}
                            {testType === 'PAGE_REDIRECT' && variantPageData && (
                                <div className="bg-white p-1 rounded-lg border shadow-sm inline-flex self-start">
                                    <button
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                            activePreviewPageId === pageId
                                                ? "bg-gray-900 text-white shadow-sm"
                                                : "text-gray-600 hover:bg-gray-100"
                                        )}
                                        onClick={() => switchPreviewPage(pageId)}
                                    >
                                        Control Page
                                    </button>
                                    <button
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                            activePreviewPageId === variantPageId
                                                ? "bg-gray-900 text-white shadow-sm"
                                                : "text-gray-600 hover:bg-gray-100"
                                        )}
                                        onClick={() => switchPreviewPage(variantPageId)}
                                    >
                                        Variant B Page
                                    </button>
                                </div>
                            )}

                            <div className={cn(
                                "flex-1 bg-gray-100 rounded-xl border overflow-hidden relative shadow-inner",
                                testType !== 'PAGE_REDIRECT' ? "h-full" : ""
                            )}>
                                {selectedPageData ? (
                                    <div className="absolute inset-0 overflow-y-auto">
                                        <div className="min-h-full bg-white origin-top transform scale-[0.8] origin-top-left w-[125%]">
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
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
