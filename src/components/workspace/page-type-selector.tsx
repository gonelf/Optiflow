'use client'

import { cn } from '@/lib/utils'
import {
    Rocket,
    Users,
    CreditCard,
    Mail,
    FileText,
    Package,
    Check,
} from 'lucide-react'

const PAGE_TYPES = [
    {
        id: 'landing',
        label: 'Landing Page',
        description: 'Hero section, features, and call-to-action',
        icon: Rocket,
        recommended: true,
    },
    {
        id: 'about',
        label: 'About Page',
        description: 'Your story, mission, and team',
        icon: Users,
        recommended: true,
    },
    {
        id: 'pricing',
        label: 'Pricing Page',
        description: 'Plans, features, and pricing tables',
        icon: CreditCard,
        recommended: true,
    },
    {
        id: 'contact',
        label: 'Contact Page',
        description: 'Contact form and information',
        icon: Mail,
        recommended: true,
    },
    {
        id: 'blog',
        label: 'Blog',
        description: 'Articles and content hub',
        icon: FileText,
        recommended: false,
    },
    {
        id: 'product',
        label: 'Product/Services',
        description: 'Showcase your offerings',
        icon: Package,
        recommended: false,
    },
]

interface PageTypeSelectorProps {
    selectedTypes: string[]
    onChange: (types: string[]) => void
}

export function PageTypeSelector({ selectedTypes, onChange }: PageTypeSelectorProps) {
    const toggleType = (typeId: string) => {
        if (selectedTypes.includes(typeId)) {
            onChange(selectedTypes.filter((t) => t !== typeId))
        } else {
            onChange([...selectedTypes, typeId])
        }
    }

    const selectAll = () => {
        onChange(PAGE_TYPES.map((t) => t.id))
    }

    const selectRecommended = () => {
        onChange(PAGE_TYPES.filter((t) => t.recommended).map((t) => t.id))
    }

    return (
        <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={selectRecommended}
                    className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
                >
                    Select recommended
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                    type="button"
                    onClick={selectAll}
                    className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
                >
                    Select all
                </button>
            </div>

            {/* Page Type Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PAGE_TYPES.map((pageType) => {
                    const Icon = pageType.icon
                    const isSelected = selectedTypes.includes(pageType.id)

                    return (
                        <button
                            key={pageType.id}
                            type="button"
                            onClick={() => toggleType(pageType.id)}
                            className={cn(
                                'relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                                'hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20',
                                isSelected
                                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 shadow-md shadow-violet-500/20'
                                    : 'border-border bg-card'
                            )}
                        >
                            {/* Checkbox indicator */}
                            <div
                                className={cn(
                                    'absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                                    isSelected
                                        ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 border-transparent'
                                        : 'border-muted-foreground/30'
                                )}
                            >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>

                            {/* Icon */}
                            <div
                                className={cn(
                                    'p-3 rounded-xl shrink-0',
                                    isSelected
                                        ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                                        : 'bg-muted text-muted-foreground'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-6">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            'font-semibold',
                                            isSelected && 'text-violet-700 dark:text-violet-300'
                                        )}
                                    >
                                        {pageType.label}
                                    </span>
                                    {pageType.recommended && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/50 dark:to-fuchsia-900/50 text-violet-700 dark:text-violet-300 rounded-full">
                                            Recommended
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {pageType.description}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Selection count */}
            <p className="text-sm text-muted-foreground text-center">
                {selectedTypes.length} page{selectedTypes.length !== 1 ? 's' : ''} selected
            </p>
        </div>
    )
}

export { PAGE_TYPES }
