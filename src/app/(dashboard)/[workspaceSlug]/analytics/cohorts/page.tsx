/**
 * Cohort Analysis Page
 * Analyze user cohorts and retention
 */

import { CohortAnalysis } from '@/components/analytics/CohortAnalysis';

interface CohortsPageProps {
  params: {
    workspaceSlug: string;
  };
}

export default function CohortsPage({ params }: CohortsPageProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cohort Analysis</h1>
        <p className="text-gray-600 mt-1">
          Track retention and conversion rates across different user segments
        </p>
      </div>

      <CohortAnalysis workspaceSlug={params.workspaceSlug} />
    </div>
  );
}

export const metadata = {
  title: 'Cohort Analysis - OptiFlow',
  description: 'Analyze user cohorts and retention',
};
