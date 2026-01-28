'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Rocket, Layout, Globe, ArrowRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIWizard() {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        workspaceName: '',
        productName: '',
        businessDescription: '',
        targetAudience: '',
        keyBenefits: '',
        pageGoal: 'Get Signups',
        brandVoice: 'Professional',
    });

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => setStep((s) => s - 1);

    const handleOnboard = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/workspaces/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Onboarding failed');
            }

            const data = await response.json();

            // Mark user as onboarded if not already
            await fetch('/api/auth/onboarding', { method: 'POST' });

            toast({
                title: 'Success!',
                description: 'Your workspace and page have been generated.',
            });

            // Redirect to the newly created builder page
            router.push(`/${data.workspace.slug}/pages/${data.page.id}`);
            router.refresh();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
            setIsGenerating(false);
        }
    };

    if (isGenerating) {
        return (
            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="h-2 bg-slate-100 w-full overflow-hidden">
                    <div className="h-full bg-primary animate-progress-glow" style={{ width: '100%' }} />
                </div>
                <CardContent className="py-20 flex flex-col items-center text-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                        <Sparkles className="h-16 w-16 text-primary relative animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Magic is happening...</h2>
                    <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                        Our AI is crafting your workspace, setting up your design system, and building your first landing page based on your product needs.
                        This usually takes about 10-20 seconds.
                    </p>
                    <div className="mt-12 flex items-center gap-2 text-primary font-medium bg-primary/5 px-4 py-2 rounded-full">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing product requirements...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="h-3 w-3" />
                    Powered by Google Gemini
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                    Launch your vision in seconds
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                    Answer a few questions and our AI will build your workspace and first page.
                </p>
            </div>

            <div className="grid grid-cols-5 gap-4 max-w-3xl mx-auto mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div
                        key={s}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            step >= s ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-slate-200"
                        )}
                    />
                ))}
            </div>

            <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm relative overflow-hidden">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <Globe className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl">First, name your space</CardTitle>
                            <CardDescription>
                                This will be your workspace name. You can invite your team here later.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="wsName">Workspace Name</Label>
                                <Input
                                    id="wsName"
                                    placeholder="e.g. Acme Marketing"
                                    value={formData.workspaceName}
                                    onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
                                    className="text-lg py-6 focus-visible:ring-primary/30"
                                    autoFocus
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={nextStep}
                                disabled={!formData.workspaceName}
                                className="ml-auto group px-8 py-6 h-auto text-lg"
                            >
                                Next Step
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </CardFooter>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                                <Rocket className="h-6 w-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-2xl">Tell us about your product</CardTitle>
                            <CardDescription>
                                What are you building? And who is it for?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="productName">Product Name</Label>
                                <Input
                                    id="productName"
                                    placeholder="e.g. OptiFlow"
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    className="text-base focus-visible:ring-primary/30"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Detailed Description</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="e.g. A modern CRM for boutique creative agencies. We want to emphasize ease of use and visual project tracking."
                                    rows={3}
                                    value={formData.businessDescription}
                                    onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                                    className="text-base focus-visible:ring-primary/30 resize-none"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-4">
                            <Button variant="ghost" onClick={prevStep} className="py-6 h-auto px-8">Back</Button>
                            <Button
                                onClick={nextStep}
                                disabled={!formData.productName || formData.businessDescription.length < 10}
                                className="group px-8 py-6 h-auto text-lg"
                            >
                                Target Audience
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </CardFooter>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-orange-600" />
                            </div>
                            <CardTitle className="text-2xl">Who is your ideal customer?</CardTitle>
                            <CardDescription>
                                Describe your target audience so we can tailor the copy.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="audience">Target Audience</Label>
                                <Input
                                    id="audience"
                                    placeholder="e.g. Freelance designers, SaaS founders with < 10 employees"
                                    value={formData.targetAudience}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                    className="text-base focus-visible:ring-primary/30"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="benefits">Key Benefits (comma separated)</Label>
                                <Textarea
                                    id="benefits"
                                    placeholder="e.g. Real-time updates, No-code builder, Native A/B testing"
                                    rows={2}
                                    value={formData.keyBenefits}
                                    onChange={(e) => setFormData({ ...formData, keyBenefits: e.target.value })}
                                    className="text-base focus-visible:ring-primary/30 resize-none"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-4">
                            <Button variant="ghost" onClick={prevStep} className="py-6 h-auto px-8">Back</Button>
                            <Button
                                onClick={nextStep}
                                disabled={!formData.targetAudience || !formData.keyBenefits}
                                className="group px-8 py-6 h-auto text-lg"
                            >
                                Set Goals
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </CardFooter>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <Layout className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl">What is the main goal?</CardTitle>
                            <CardDescription>
                                We will optimize the layout and CTAs for this objective.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {['Get Signups', 'Book Demos', 'Direct Sale', 'Waitlist'].map((goal) => (
                                    <button
                                        key={goal}
                                        onClick={() => setFormData({ ...formData, pageGoal: goal })}
                                        className={cn(
                                            "p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50",
                                            formData.pageGoal === goal ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-slate-100 bg-white"
                                        )}
                                    >
                                        <span className="font-bold text-slate-900 block">{goal}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-4">
                            <Button variant="ghost" onClick={prevStep} className="py-6 h-auto px-8">Back</Button>
                            <Button
                                onClick={nextStep}
                                className="group px-8 py-6 h-auto text-lg"
                            >
                                Refine Style
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </CardFooter>
                    </div>
                )}

                {step === 5 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                                <Sparkles className="h-6 w-6 text-amber-600" />
                            </div>
                            <CardTitle className="text-2xl">Almost there!</CardTitle>
                            <CardDescription>
                                How should your site sound to your visitors?
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {['Professional', 'Friendly', 'Bold', 'Minimalist'].map((voice) => (
                                    <button
                                        key={voice}
                                        onClick={() => setFormData({ ...formData, brandVoice: voice })}
                                        className={cn(
                                            "p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50",
                                            formData.brandVoice === voice ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-slate-100 bg-white"
                                        )}
                                    >
                                        <span className="font-bold text-slate-900 block">{voice}</span>
                                        <span className="text-xs text-slate-500">
                                            {voice === 'Professional' && 'Trustworthy and expert'}
                                            {voice === 'Friendly' && 'Approachable and warm'}
                                            {voice === 'Bold' && 'Energetic and impactful'}
                                            {voice === 'Minimalist' && 'Clean and clear'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-4">
                            <Button variant="ghost" onClick={prevStep} className="py-6 h-auto px-8">Back</Button>
                            <Button
                                onClick={handleOnboard}
                                className="px-10 py-6 h-auto text-lg shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90"
                            >
                                Launch Workspace
                                <Sparkles className="ml-2 h-5 w-5" />
                            </Button>
                        </CardFooter>
                    </div>
                )}
            </Card>

            <p className="text-center text-sm text-slate-400">
                Skip wizard and <button
                    onClick={async () => {
                        await fetch('/api/auth/onboarding', { method: 'POST' });
                        router.push('/dashboard');
                    }}
                    className="text-slate-600 font-medium hover:underline"
                >
                    create manually
                </button>
            </p>
        </div>
    );
}
