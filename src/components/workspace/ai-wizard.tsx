'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useWorkspace } from '@/hooks/use-workspace'
import { WizardStep } from './wizard-step'
import { IndustrySelect, INDUSTRIES } from './industry-select'
import { PageTypeSelector, PAGE_TYPES } from './page-type-selector'
import {
    Sparkles,
    Wand2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Rocket,
    ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Brand voice options
const BRAND_VOICES = [
    { id: 'professional', label: 'Professional', description: 'Formal and trustworthy' },
    { id: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { id: 'bold', label: 'Bold', description: 'Confident and direct' },
    { id: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
    { id: 'innovative', label: 'Innovative', description: 'Modern and cutting-edge' },
    { id: 'elegant', label: 'Elegant', description: 'Sophisticated and refined' },
]

interface WizardData {
    // Step 1: Workspace basics
    name: string
    slug: string
    // Step 2: Business description
    businessDescription: string
    // Step 3: Industry
    industry: string
    customIndustry: string
    // Step 4: Target audience
    targetAudience: string
    // Step 5: Brand voice
    brandVoice: string
    // Step 6: Page selection
    selectedPages: string[]
}

interface AIWizardProps {
    onComplete?: () => void
    onSkip?: () => void
}

type GenerationStatus = 'idle' | 'creating-workspace' | 'generating-pages' | 'complete' | 'error'

interface GeneratedPage {
    id: string
    title: string
    slug: string
    status: 'pending' | 'generating' | 'complete' | 'error'
}

export function AIWizard({ onComplete, onSkip }: AIWizardProps) {
    const router = useRouter()
    const { toast } = useToast()
    const { createWorkspace } = useWorkspace()

    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle')
    const [generatedPages, setGeneratedPages] = useState<GeneratedPage[]>([])
    const [createdWorkspace, setCreatedWorkspace] = useState<{ id: string; slug: string } | null>(null)

    const [wizardData, setWizardData] = useState<WizardData>({
        name: '',
        slug: '',
        businessDescription: '',
        industry: '',
        customIndustry: '',
        targetAudience: '',
        brandVoice: 'professional',
        selectedPages: ['landing', 'about', 'pricing', 'contact'],
    })

    const totalSteps = 7

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    }

    const handleNameChange = (name: string) => {
        setWizardData((prev) => ({
            ...prev,
            name,
            slug: generateSlug(name),
        }))
    }

    const updateData = (updates: Partial<WizardData>) => {
        setWizardData((prev) => ({ ...prev, ...updates }))
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return wizardData.name.length >= 2 && wizardData.slug.length >= 3
            case 2:
                return wizardData.businessDescription.length >= 20
            case 3:
                return wizardData.industry !== '' &&
                    (wizardData.industry !== 'other' || wizardData.customIndustry.length > 0)
            case 4:
                return wizardData.targetAudience.length >= 10
            case 5:
                return wizardData.brandVoice !== ''
            case 6:
                return wizardData.selectedPages.length > 0
            default:
                return true
        }
    }

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    const getIndustryLabel = () => {
        if (wizardData.industry === 'other') {
            return wizardData.customIndustry
        }
        return INDUSTRIES.find((i) => i.id === wizardData.industry)?.label || wizardData.industry
    }

    const handleGenerate = async () => {
        setIsLoading(true)
        setGenerationStatus('creating-workspace')

        try {
            // Step 1: Create the workspace
            const workspace = await createWorkspace({
                name: wizardData.name,
                slug: wizardData.slug,
            })

            setCreatedWorkspace({ id: workspace.id, slug: workspace.slug })

            // Initialize page generation status
            const initialPages: GeneratedPage[] = wizardData.selectedPages.map((pageType) => ({
                id: pageType,
                title: PAGE_TYPES.find((p) => p.id === pageType)?.label || pageType,
                slug: pageType,
                status: 'pending',
            }))
            setGeneratedPages(initialPages)
            setGenerationStatus('generating-pages')

            // Step 2: Generate pages one by one
            for (let i = 0; i < wizardData.selectedPages.length; i++) {
                const pageType = wizardData.selectedPages[i]

                // Update status to generating
                setGeneratedPages((prev) =>
                    prev.map((p) =>
                        p.id === pageType ? { ...p, status: 'generating' } : p
                    )
                )

                try {
                    // Call the AI generation API
                    const response = await fetch('/api/ai/generate-pages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            workspaceId: workspace.id,
                            pageType,
                            businessDescription: wizardData.businessDescription,
                            industry: getIndustryLabel(),
                            targetAudience: wizardData.targetAudience,
                            brandVoice: wizardData.brandVoice,
                        }),
                    })

                    if (!response.ok) {
                        throw new Error('Failed to generate page')
                    }

                    const data = await response.json()

                    // Update status to complete
                    setGeneratedPages((prev) =>
                        prev.map((p) =>
                            p.id === pageType
                                ? { ...p, status: 'complete', title: data.page?.title || p.title }
                                : p
                        )
                    )
                } catch (error) {
                    console.error(`Error generating ${pageType} page:`, error)
                    // Mark as error but continue with other pages
                    setGeneratedPages((prev) =>
                        prev.map((p) =>
                            p.id === pageType ? { ...p, status: 'error' } : p
                        )
                    )
                }
            }

            setGenerationStatus('complete')
            toast({
                title: 'Success!',
                description: 'Your workspace and pages have been created.',
            })
        } catch (error: any) {
            console.error('Wizard error:', error)
            setGenerationStatus('error')
            toast({
                title: 'Error',
                description: error.message || 'Failed to create workspace',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleFinish = () => {
        if (createdWorkspace) {
            router.push(`/${createdWorkspace.slug}`)
        }
        onComplete?.()
    }

    // Step 7: Generation progress/complete
    if (currentStep === 7) {
        return (
            <Card className="w-full max-w-2xl mx-auto p-8 bg-card/80 backdrop-blur-xl border-violet-500/20 shadow-2xl shadow-violet-500/10">
                <div className="text-center mb-8">
                    {generationStatus === 'complete' ? (
                        <>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', duration: 0.5 }}
                                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
                            >
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                                Your workspace is ready!
                            </h2>
                            <p className="text-muted-foreground mt-2">
                                We&apos;ve created your workspace with AI-generated pages
                            </p>
                        </>
                    ) : generationStatus === 'error' ? (
                        <>
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                                Something went wrong
                            </h2>
                            <p className="text-muted-foreground mt-2">
                                Don&apos;t worry, you can try again or skip the wizard
                            </p>
                        </>
                    ) : (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center"
                            >
                                <Sparkles className="w-10 h-10 text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                {generationStatus === 'creating-workspace'
                                    ? 'Creating your workspace...'
                                    : 'Generating your pages...'}
                            </h2>
                            <p className="text-muted-foreground mt-2">
                                Our AI is crafting the perfect pages for your business
                            </p>
                        </>
                    )}
                </div>

                {/* Page generation progress */}
                {generatedPages.length > 0 && (
                    <div className="space-y-3 mb-8">
                        {generatedPages.map((page) => (
                            <motion.div
                                key={page.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    'flex items-center gap-3 p-4 rounded-xl border',
                                    page.status === 'complete' && 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
                                    page.status === 'generating' && 'bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800',
                                    page.status === 'pending' && 'bg-muted/50 border-border',
                                    page.status === 'error' && 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                )}
                            >
                                {page.status === 'complete' && (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                )}
                                {page.status === 'generating' && (
                                    <Loader2 className="w-5 h-5 text-violet-600 dark:text-violet-400 animate-spin" />
                                )}
                                {page.status === 'pending' && (
                                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                                )}
                                {page.status === 'error' && (
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                )}
                                <span className={cn(
                                    'font-medium',
                                    page.status === 'complete' && 'text-green-700 dark:text-green-300',
                                    page.status === 'generating' && 'text-violet-700 dark:text-violet-300',
                                    page.status === 'error' && 'text-red-700 dark:text-red-300'
                                )}>
                                    {page.title}
                                </span>
                                {page.status === 'generating' && (
                                    <span className="text-sm text-violet-600 dark:text-violet-400 ml-auto">
                                        Generating...
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                {generationStatus === 'complete' && (
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleFinish}
                            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                            size="lg"
                        >
                            <Rocket className="w-5 h-5" />
                            Go to my workspace
                        </Button>
                    </div>
                )}

                {generationStatus === 'error' && (
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setCurrentStep(6)} className="flex-1">
                            Go back
                        </Button>
                        <Button onClick={handleGenerate} className="flex-1">
                            Try again
                        </Button>
                    </div>
                )}
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl mx-auto p-8 bg-card/80 backdrop-blur-xl border-violet-500/20 shadow-2xl shadow-violet-500/10">
            <AnimatePresence mode="wait">
                {/* Step 1: Workspace Basics */}
                {currentStep === 1 && (
                    <WizardStep
                        key="step-1"
                        stepNumber={1}
                        totalSteps={totalSteps - 1}
                        title="Name your workspace"
                        description="Choose a name and URL for your new workspace"
                        onNext={handleNext}
                        canProceed={canProceed()}
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Workspace Name</Label>
                                <Input
                                    id="name"
                                    placeholder="My Awesome Business"
                                    value={wizardData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Workspace URL</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">reoptimize.com/</span>
                                    <Input
                                        id="slug"
                                        placeholder="my-awesome-business"
                                        value={wizardData.slug}
                                        onChange={(e) => updateData({ slug: e.target.value })}
                                        pattern="[a-z0-9\-]+"
                                    />
                                </div>
                            </div>
                        </div>
                    </WizardStep>
                )}

                {/* Step 2: Business Description */}
                {currentStep === 2 && (
                    <WizardStep
                        key="step-2"
                        stepNumber={2}
                        totalSteps={totalSteps - 1}
                        title="Tell us about your business"
                        description="Describe what your business does. The more detail you provide, the better the AI can generate your pages."
                        onBack={handleBack}
                        onNext={handleNext}
                        canProceed={canProceed()}
                    >
                        <div className="space-y-4">
                            <Textarea
                                placeholder="We're a SaaS company that helps small businesses manage their inventory. Our software provides real-time tracking, automated reordering, and detailed analytics..."
                                value={wizardData.businessDescription}
                                onChange={(e) => updateData({ businessDescription: e.target.value })}
                                className="min-h-[200px] text-base"
                            />
                            <p className="text-sm text-muted-foreground">
                                {wizardData.businessDescription.length} / 20 minimum characters
                            </p>
                        </div>
                    </WizardStep>
                )}

                {/* Step 3: Industry */}
                {currentStep === 3 && (
                    <WizardStep
                        key="step-3"
                        stepNumber={3}
                        totalSteps={totalSteps - 1}
                        title="What industry are you in?"
                        description="This helps us tailor the design and content to your field"
                        onBack={handleBack}
                        onNext={handleNext}
                        canProceed={canProceed()}
                    >
                        <IndustrySelect
                            value={wizardData.industry}
                            customValue={wizardData.customIndustry}
                            onChange={(industry, customValue) =>
                                updateData({ industry, customIndustry: customValue || '' })
                            }
                        />
                    </WizardStep>
                )}

                {/* Step 4: Target Audience */}
                {currentStep === 4 && (
                    <WizardStep
                        key="step-4"
                        stepNumber={4}
                        totalSteps={totalSteps - 1}
                        title="Who is your target audience?"
                        description="Describe your ideal customers"
                        onBack={handleBack}
                        onNext={handleNext}
                        canProceed={canProceed()}
                    >
                        <div className="space-y-4">
                            <Textarea
                                placeholder="Small to medium business owners, typically with 5-50 employees, who struggle with inventory management and are looking for affordable software solutions..."
                                value={wizardData.targetAudience}
                                onChange={(e) => updateData({ targetAudience: e.target.value })}
                                className="min-h-[150px] text-base"
                            />
                            <p className="text-sm text-muted-foreground">
                                {wizardData.targetAudience.length} / 10 minimum characters
                            </p>
                        </div>
                    </WizardStep>
                )}

                {/* Step 5: Brand Voice */}
                {currentStep === 5 && (
                    <WizardStep
                        key="step-5"
                        stepNumber={5}
                        totalSteps={totalSteps - 1}
                        title="Choose your brand voice"
                        description="How do you want to communicate with your audience?"
                        onBack={handleBack}
                        onNext={handleNext}
                        canProceed={canProceed()}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {BRAND_VOICES.map((voice) => (
                                <button
                                    key={voice.id}
                                    type="button"
                                    onClick={() => updateData({ brandVoice: voice.id })}
                                    className={cn(
                                        'p-4 rounded-xl border-2 text-left transition-all duration-200',
                                        'hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20',
                                        wizardData.brandVoice === voice.id
                                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 shadow-md shadow-violet-500/20'
                                            : 'border-border bg-card'
                                    )}
                                >
                                    <span className={cn(
                                        'font-semibold block',
                                        wizardData.brandVoice === voice.id && 'text-violet-700 dark:text-violet-300'
                                    )}>
                                        {voice.label}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {voice.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </WizardStep>
                )}

                {/* Step 6: Page Selection */}
                {currentStep === 6 && (
                    <WizardStep
                        key="step-6"
                        stepNumber={6}
                        totalSteps={totalSteps - 1}
                        title="Select pages to generate"
                        description="Choose which pages you want the AI to create for you"
                        onBack={handleBack}
                        onNext={handleGenerate}
                        nextLabel="Generate Pages"
                        isLoading={isLoading}
                        canProceed={canProceed()}
                    >
                        <PageTypeSelector
                            selectedTypes={wizardData.selectedPages}
                            onChange={(types) => updateData({ selectedPages: types })}
                        />
                    </WizardStep>
                )}
            </AnimatePresence>

            {/* Skip option */}
            {currentStep === 1 && onSkip && (
                <div className="mt-6 text-center">
                    <button
                        onClick={onSkip}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Skip wizard and create empty workspace
                    </button>
                </div>
            )}
        </Card>
    )
}
