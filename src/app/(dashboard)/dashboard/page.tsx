'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/hooks/use-workspace';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { workspaces, isLoading } = useWorkspace();

    useEffect(() => {
        if (isLoading) return;

        // If we have workspaces and at least one page, redirect to the first workspace
        if (workspaces.length > 0 && workspaces[0]._count?.pages && workspaces[0]._count.pages > 0) {
            router.push(`/${workspaces[0].slug}`);
            return;
        }

        // If no workspaces OR no pages in the first workspace, and not onboarded, go to onboarding
        if (session?.user && session.user.onboarded === false) {
            router.push('/onboarding');
        }
    }, [workspaces, isLoading, router, session]);

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

    // If no workspaces and somehow skipped onboarding, show empty state or redirect
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">No workspaces found</h1>
                <p className="text-slate-500">You haven&apos;t created any workspaces yet.</p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => router.push('/onboarding')}
                        className="bg-primary text-white px-4 py-2 rounded-md"
                    >
                        Start AI Onboarding
                    </button>
                </div>
            </div>
        </div>
    );
}
