import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WorkspaceService } from '@/services/workspace.service';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/login');
    }

    const workspaces = await WorkspaceService.findUserWorkspaces(session.user.id);

    if (workspaces.length > 0) {
        // Redirect to the first available workspace
        redirect(`/${workspaces[0].slug}`);
    }

    // If no workspaces, redirect to creation page
    redirect('/dashboard/new');
}
