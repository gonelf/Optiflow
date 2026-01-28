'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

interface WizardStepProps {
    stepNumber: number
    totalSteps: number
    title: string
    description: string
    children: ReactNode
    onBack?: () => void
    onNext?: () => void
    nextLabel?: string
    isLoading?: boolean
    canProceed?: boolean
}

export function WizardStep({
    stepNumber,
    totalSteps,
    title,
    description,
    children,
    onBack,
    onNext,
    nextLabel = 'Continue',
    isLoading = false,
    canProceed = true,
}: WizardStepProps) {
    const progress = (stepNumber / totalSteps) * 100

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col h-full"
        >
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Step {stepNumber} of {totalSteps}</span>
                    <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Step Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {title}
                </h2>
                <p className="text-muted-foreground mt-1">{description}</p>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-4 border-t">
                {onBack ? (
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </Button>
                ) : (
                    <div />
                )}
                {onNext && (
                    <Button
                        onClick={onNext}
                        disabled={isLoading || !canProceed}
                        className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                    >
                        {isLoading ? (
                            <>
                                <Sparkles className="w-4 h-4 animate-pulse" />
                                Generating...
                            </>
                        ) : (
                            <>
                                {nextLabel}
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                )}
            </div>
        </motion.div>
    )
}
