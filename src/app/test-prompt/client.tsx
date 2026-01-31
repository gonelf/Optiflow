'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Wand2, RefreshCw, Search, ArrowRight, ArrowLeft, Check, Image as ImageIcon } from 'lucide-react';

interface Workspace {
    id: string;
    name: string;
}

interface DribbbleShot {
    id: number;
    title: string;
    images: {
        hidpi?: string;
        normal: string;
        teaser: string;
    };
    html_url: string;
}

export function TestPromptClient() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

    const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

    // Step 1: Inputs
    const [workspaceId, setWorkspaceId] = useState('');
    const [description, setDescription] = useState('');
    const [industry, setIndustry] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [brandVoice, setBrandVoice] = useState('');
    const [pageType, setPageType] = useState('landing');

    // Prompt State
    const [activePrompt, setActivePrompt] = useState('');
    const [loadingPrompt, setLoadingPrompt] = useState(false);
    const [promptEdited, setPromptEdited] = useState(false);

    // Step 2: Inspiration
    const [inspirationQuery, setInspirationQuery] = useState('');
    const [loadingInspiration, setLoadingInspiration] = useState(false);
    const [inspirationShots, setInspirationShots] = useState<DribbbleShot[]>([]);
    const [selectedShot, setSelectedShot] = useState<DribbbleShot | null>(null);

    // Step 3: Result
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');

    useEffect(() => {
        fetch('/api/workspaces')
            .then(res => res.json())
            .then(data => {
                if (data.workspaces) {
                    setWorkspaces(data.workspaces);
                    if (data.workspaces.length > 0) {
                        setWorkspaceId(data.workspaces[0].id);
                    }
                }
            })
            .catch(err => console.error('Failed to load workspaces', err))
            .finally(() => setLoadingWorkspaces(false));
    }, []);

    // Use effect to pre-fill inspiration query from description
    useEffect(() => {
        if (description && !inspirationQuery) {
            setInspirationQuery(`${pageType} page for ${industry || 'modern startup'} ${description.slice(0, 20)}...`);
        }
    }, [description, industry, pageType]);


    // Helper: Fetch Default Prompt
    const fetchDefaultPrompt = useCallback(async () => {
        if (!description && !industry && !targetAudience && !brandVoice) return;

        setLoadingPrompt(true);
        try {
            const res = await fetch('/api/ai/prompt-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    industry,
                    targetAudience,
                    brandVoice,
                    pageType
                })
            });
            const data = await res.json();
            if (data.prompt) {
                if (!promptEdited) {
                    setActivePrompt(data.prompt);
                }
            }
        } catch (err) {
            console.error('Failed to fetch prompt preview', err);
        } finally {
            setLoadingPrompt(false);
        }
    }, [description, industry, targetAudience, brandVoice, pageType, promptEdited]);

    // Debounced Prompt Update
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDefaultPrompt();
        }, 800);
        return () => clearTimeout(timer);
    }, [fetchDefaultPrompt]);


    // Step 2 Action: Fetch Inspiration
    const handleSearchInspiration = async () => {
        setLoadingInspiration(true);
        try {
            const res = await fetch('/api/inspiration/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: inspirationQuery || description })
            });
            const data = await res.json();
            if (data.shots) {
                setInspirationShots(data.shots);
            }
        } catch (err) {
            console.error('Failed to search inspiration', err);
        } finally {
            setLoadingInspiration(false);
        }
    };

    // Step 3 Action: Generate Page
    const handleGenerate = async () => {
        if (!workspaceId) {
            setError('Please select a workspace');
            return;
        }
        if (!description) {
            setError('Please enter a description');
            return;
        }

        setGenerating(true);
        setError('');
        setResult(null);
        setActiveStep(3); // Ensure we are on result step

        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId,
                    description,
                    industry,
                    targetAudience,
                    brandVoice,
                    pageType,
                    customPrompt: activePrompt,
                    designImageUrl: selectedShot?.images.hidpi || selectedShot?.images.normal || undefined // Pass selected image URL
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.details
                    ? `${data.error}: ${data.details.map((d: any) => d.message).join(', ')}`
                    : data.error || 'Failed to generate page';
                throw new Error(errorMessage);
            }

            setResult(data);
            if (data.page) {
                setActiveTab('preview');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header with Steps */}
                <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Design-AI Page Generator</h1>
                        <p className="text-gray-500 text-sm">Create stunning pages from text and visual inspiration</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${activeStep >= 1 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                            <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">1</div>
                            <span>Describe</span>
                        </div>
                        <div className="w-8 h-px bg-gray-300"></div>
                        <div className={`flex items-center gap-2 ${activeStep >= 2 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                            <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">2</div>
                            <span>Inspire</span>
                        </div>
                        <div className="w-8 h-px bg-gray-300"></div>
                        <div className={`flex items-center gap-2 ${activeStep >= 3 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                            <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">3</div>
                            <span>Generate</span>
                        </div>
                    </div>
                </div>

                {/* Access denied overlay for small validations */}
                {error && activeStep === 3 && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => { setError(''); setActiveStep(1); }} className="text-sm underline">Edit Inputs</button>
                    </div>
                )}

                {/* STEP 1: DESCRIBE */}
                {activeStep === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Inputs */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                            <h2 className="text-lg font-bold">Project Details</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Workspace
                                    </label>
                                    <select
                                        value={workspaceId}
                                        onChange={(e) => setWorkspaceId(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="" disabled>Select a workspace</option>
                                        {workspaces.map((ws) => (
                                            <option key={ws.id} value={ws.id}>
                                                {ws.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Page Type
                                    </label>
                                    <select
                                        value={pageType}
                                        onChange={(e) => setPageType(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="landing">Landing Page</option>
                                        <option value="pricing">Pricing Page</option>
                                        <option value="about">About Page</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe the page you want to generate (e.g., A minimalist landing page for an organic coffee brand...)"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <input placeholder="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
                                <input placeholder="Audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
                                <input placeholder="Tone" value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
                            </div>

                            <button
                                onClick={() => {
                                    if (!description) return setError('Description is required');
                                    setActiveStep(2);
                                    handleSearchInspiration(); // Auto-search on next if empty
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                            >
                                Next: Find Inspiration <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Prompt Preview */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">System Prompt (Optional Edit)</h2>
                                <span className="text-xs text-gray-400">Auto-generated</span>
                            </div>
                            <textarea
                                value={activePrompt}
                                onChange={(e) => { setActivePrompt(e.target.value); setPromptEdited(true); }}
                                className="flex-1 w-full rounded-md border border-gray-300 p-4 text-xs font-mono bg-gray-50 resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: INSPIRE */}
                {activeStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <button onClick={() => setActiveStep(1)} className="p-2 hover:bg-gray-100 rounded-full">
                                <ArrowLeft className="h-5 w-5 text-gray-500" />
                            </button>
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    value={inspirationQuery}
                                    onChange={(e) => setInspirationQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchInspiration()}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search for design inspiration..."
                                />
                            </div>
                            <button
                                onClick={handleSearchInspiration}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                            >
                                Search
                            </button>
                        </div>

                        {loadingInspiration ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/3] bg-gray-200 animate-pulse rounded-lg"></div>)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {/* Option to skip */}
                                <div
                                    onClick={() => setSelectedShot(null)}
                                    className={`aspect-[4/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${!selectedShot ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
                                >
                                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                                    <span className="text-sm font-medium text-gray-600">No Image (Text Only)</span>
                                    {!selectedShot && <Check className="h-5 w-5 text-blue-500 mt-2" />}
                                </div>

                                {inspirationShots.map(shot => (
                                    <div
                                        key={shot.id}
                                        onClick={() => setSelectedShot(shot)}
                                        className={`group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedShot?.id === shot.id ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-transparent hover:border-blue-300'}`}
                                    >
                                        <img src={shot.images.teaser} alt={shot.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <span className="text-white text-sm font-medium truncate">{shot.title}</span>
                                        </div>
                                        {selectedShot?.id === shot.id && (
                                            <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end pt-6 border-t border-gray-200">
                            <button
                                onClick={handleGenerate}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                            >
                                <Wand2 className="h-5 w-5" />
                                Generate Page {selectedShot ? 'with Image Context' : ''}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: RESULTS (Reusing existing layout) */}
                {activeStep === 3 && (
                    <div className="flex flex-col h-[calc(100vh-16rem)] min-h-[600px]">
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => setActiveStep(2)} className="text-sm flex items-center gap-1 text-gray-500 hover:text-blue-600">
                                <ArrowLeft className="h-4 w-4" /> Back to Inspiration
                            </button>
                            {generating && <div className="text-blue-600 font-medium animate-pulse flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> AI is crafting your page...</div>}
                        </div>

                        <div className="flex-1 bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800 flex flex-col">
                            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center shrink-0">
                                <div className="flex gap-4">
                                    <button onClick={() => setActiveTab('preview')} className={`text-xs font-mono py-1 border-b-2 transition-colors ${activeTab === 'preview' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}>Visual Preview</button>
                                    <button onClick={() => setActiveTab('json')} className={`text-xs font-mono py-1 border-b-2 transition-colors ${activeTab === 'json' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}>Debug Info (JSON)</button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto bg-gray-900 relative">
                                {result ? (
                                    activeTab === 'json' ? (
                                        <div className="p-4"><pre className="text-xs font-mono text-green-300 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre></div>
                                    ) : (
                                        <div className="h-full bg-white text-black overflow-auto">
                                            {result.page?.elements && result.page.elements[0]?.type === 'html-content' ? (
                                                <iframe title="preview" srcDoc={result.page.elements[0].content} className="w-full h-full border-0" />
                                            ) : (
                                                <div className="p-8"><h1 className="text-2xl text-center">Preview JSON Mode</h1></div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                        {generating ? <Wand2 className="h-16 w-16 text-blue-500 animate-pulse" /> : <p>Waiting for generation...</p>}
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
