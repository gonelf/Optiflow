'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/hooks/use-workspace';
import { AIWizard } from '@/components/builder/ai/AIWizard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { workspaces, isLoading } = useWorkspace();

    useEffect(() => {
        // If we have workspaces, redirect to the first one
        if (!isLoading && workspaces.length > 0) {
            router.push(`/${workspaces[0].slug}`);
        }
    }, [workspaces, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium text-slate-500 text-center">
                        Initializing your workspace...
                    </p>
                </div>
            </div>
        );
    }

    // If no workspaces, show the AI Wizard
    if (workspaces.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    <AIWizard />
                </div>
            </div>
        );
    }

    // Fallback (while redirecting)
    return null;
}
