/**
 * Analytics Dashboard Page
 * Main analytics overview page
 */

import { Dashboard } from '@/components/analytics/Dashboard';

interface AnalyticsPageProps {
  params: {
    workspaceSlug: string;
  };
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <Dashboard workspaceSlug={params.workspaceSlug} />
    </div>
  );
}

export const metadata = {
  title: 'Analytics - Reoptimize',
  description: 'View analytics and insights for your pages',
};
