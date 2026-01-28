'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWorkspace } from '@/hooks/use-workspace';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function OnboardingBanner() {
    const { data: session } = useSession();
    const { workspaces, isLoading } = useWorkspace();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (isLoading || !session?.user || isDismissed || pathname === '/onboarding') {
            setIsVisible(false);
            return;
        }

        // Condition to show: User has zero pages across ALL workspaces
        const hasNoPages = workspaces.length === 0 || workspaces.every(w => !w._count?.pages || w._count.pages === 0);

        if (hasNoPages) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [session, workspaces, isLoading, isDismissed]);

    if (!isVisible) return null;

    return (
        <div className="w-full bg-blue-600 px-4 py-2 relative z-[9999] shadow-lg">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-white animate-pulse" />
                    <p className="text-sm font-bold text-white uppercase tracking-tight">
                        Launch your project faster with AI!
                    </p>
                    <p className="hidden md:block text-sm text-blue-100">
                        Our wizard can generate your entire workspace in seconds.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/onboarding">
                        <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 font-bold h-8 px-4">
                            Start AI Wizard
                        </Button>
                    </Link>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setIsDismissed(true);
                        }}
                        className="text-white/80 hover:text-white transition-colors p-1"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
