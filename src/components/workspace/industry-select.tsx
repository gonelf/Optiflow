'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
    Building2,
    ShoppingBag,
    Briefcase,
    Heart,
    GraduationCap,
    Home,
    UtensilsCrossed,
    Dumbbell,
    Megaphone,
    HandHeart,
    Laptop,
    MoreHorizontal,
} from 'lucide-react'

const INDUSTRIES = [
    { id: 'saas', label: 'SaaS / Software', icon: Laptop },
    { id: 'ecommerce', label: 'E-commerce / Retail', icon: ShoppingBag },
    { id: 'professional', label: 'Professional Services', icon: Briefcase },
    { id: 'healthcare', label: 'Healthcare', icon: Heart },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'realestate', label: 'Real Estate', icon: Home },
    { id: 'restaurant', label: 'Restaurant / Food', icon: UtensilsCrossed },
    { id: 'fitness', label: 'Fitness / Wellness', icon: Dumbbell },
    { id: 'agency', label: 'Agency / Marketing', icon: Megaphone },
    { id: 'nonprofit', label: 'Non-profit', icon: HandHeart },
    { id: 'enterprise', label: 'Enterprise / B2B', icon: Building2 },
    { id: 'other', label: 'Other', icon: MoreHorizontal },
]

interface IndustrySelectProps {
    value: string
    customValue?: string
    onChange: (industry: string, customValue?: string) => void
}

export function IndustrySelect({ value, customValue, onChange }: IndustrySelectProps) {
    const [showCustomInput, setShowCustomInput] = useState(value === 'other')

    const handleSelect = (industryId: string) => {
        if (industryId === 'other') {
            setShowCustomInput(true)
            onChange(industryId, customValue || '')
        } else {
            setShowCustomInput(false)
            onChange(industryId)
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INDUSTRIES.map((industry) => {
                    const Icon = industry.icon
                    const isSelected = value === industry.id

                    return (
                        <button
                            key={industry.id}
                            type="button"
                            onClick={() => handleSelect(industry.id)}
                            className={cn(
                                'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                                'hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20',
                                isSelected
                                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 shadow-md shadow-violet-500/20'
                                    : 'border-border bg-card'
                            )}
                        >
                            <div
                                className={cn(
                                    'p-2 rounded-lg',
                                    isSelected
                                        ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                                        : 'bg-muted text-muted-foreground'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                'text-sm font-medium text-left',
                                isSelected && 'text-violet-700 dark:text-violet-300'
                            )}>
                                {industry.label}
                            </span>
                        </button>
                    )
                })}
            </div>

            {showCustomInput && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="customIndustry">Describe your industry</Label>
                    <Input
                        id="customIndustry"
                        placeholder="e.g., Pet grooming services"
                        value={customValue || ''}
                        onChange={(e) => onChange('other', e.target.value)}
                        className="border-violet-300 focus:border-violet-500"
                    />
                </div>
            )}
        </div>
    )
}

export { INDUSTRIES }
