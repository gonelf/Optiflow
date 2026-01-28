'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useWorkspace } from '@/hooks/use-workspace'
import { AIWizard } from '@/components/workspace/ai-wizard'
import { Sparkles, Zap, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type SetupMode = 'select' | 'wizard' | 'quick'

export default function NewWorkspacePage() {
    const router = useRouter()
    const { toast } = useToast()
    const { createWorkspace } = useWorkspace()
    const [mode, setMode] = useState<SetupMode>('select')
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
    })

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    }

    const handleNameChange = (name: string) => {
        setFormData({
            name,
            slug: generateSlug(name),
        })
    }

    const handleQuickSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const workspace = await createWorkspace(formData)
            toast({
                title: 'Success',
                description: 'Workspace created successfully',
            })
            router.push(`/${workspace.slug}`)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create workspace',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-4">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <AnimatePresence mode="wait">
                {/* Mode Selection */}
                {mode === 'select' && (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-3xl z-10"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-3">
                                Create your workspace
                            </h1>
                            <p className="text-lg text-slate-300">
                                Choose how you&apos;d like to get started
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* AI Wizard Option */}
                            <button
                                onClick={() => setMode('wizard')}
                                className={cn(
                                    'relative group p-8 rounded-2xl border-2 text-left transition-all duration-300',
                                    'bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border-violet-500/50',
                                    'hover:border-violet-400 hover:shadow-2xl hover:shadow-violet-500/20',
                                    'hover:scale-[1.02]'
                                )}
                            >
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
                                        <Sparkles className="w-7 h-7 text-white" />
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        AI Wizard
                                    </h2>
                                    <p className="text-slate-300 mb-4">
                                        Tell us about your business and let AI generate your pages automatically
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 text-xs font-medium bg-violet-500/30 text-violet-200 rounded-full">
                                            Recommended
                                        </span>
                                        <span className="px-3 py-1 text-xs font-medium bg-white/10 text-slate-300 rounded-full">
                                            ~2 min setup
                                        </span>
                                    </div>
                                </div>
                            </button>

                            {/* Quick Setup Option */}
                            <button
                                onClick={() => setMode('quick')}
                                className={cn(
                                    'relative group p-8 rounded-2xl border-2 text-left transition-all duration-300',
                                    'bg-slate-800/50 border-slate-600/50',
                                    'hover:border-slate-500 hover:shadow-xl',
                                    'hover:scale-[1.02]'
                                )}
                            >
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-xl bg-slate-700 flex items-center justify-center mb-4">
                                        <Zap className="w-7 h-7 text-slate-300" />
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        Quick Setup
                                    </h2>
                                    <p className="text-slate-400 mb-4">
                                        Create an empty workspace and build your pages from scratch
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 text-xs font-medium bg-white/10 text-slate-300 rounded-full">
                                            30 sec setup
                                        </span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* AI Wizard */}
                {mode === 'wizard' && (
                    <motion.div
                        key="wizard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-2xl z-10"
                    >
                        <button
                            onClick={() => setMode('select')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to options
                        </button>
                        <AIWizard
                            onComplete={() => { }}
                            onSkip={() => setMode('quick')}
                        />
                    </motion.div>
                )}

                {/* Quick Setup Form */}
                {mode === 'quick' && (
                    <motion.div
                        key="quick"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-md z-10"
                    >
                        <button
                            onClick={() => setMode('select')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to options
                        </button>

                        <Card className="bg-card/80 backdrop-blur-xl border-slate-700/50">
                            <CardHeader>
                                <CardTitle>Quick Setup</CardTitle>
                                <CardDescription>
                                    Create an empty workspace and start building
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleQuickSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Workspace Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="My Awesome Project"
                                            value={formData.name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Workspace Slug</Label>
                                        <Input
                                            id="slug"
                                            placeholder="my-awesome-project"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            disabled={isLoading}
                                            pattern="[a-z0-9\-]+"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            This will be used in your workspace URL
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Creating...' : 'Create Workspace'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
