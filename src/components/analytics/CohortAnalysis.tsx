'use client';

/**
 * Cohort Analysis Component
 * Displays cohort retention and conversion analysis
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  CohortDefinition,
  CohortRetentionData,
  CohortConversionData,
} from '@/services/analytics/cohort.service';

interface CohortAnalysisProps {
  workspaceSlug: string;
  startDate?: Date;
  endDate?: Date;
}

export function CohortAnalysis({
  workspaceSlug,
  startDate,
  endDate
}: CohortAnalysisProps) {
  const [cohortType, setCohortType] = useState<'weekly' | 'source' | 'geo'>('weekly');
  const [cohorts, setCohorts] = useState<CohortDefinition[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<CohortDefinition | null>(null);
  const [retentionData, setRetentionData] = useState<CohortRetentionData | null>(null);
  const [conversionData, setConversionData] = useState<CohortConversionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cohorts based on type
  useEffect(() => {
    const fetchCohorts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          workspaceSlug,
          type: cohortType,
        });

        if (startDate) {
          params.append('startDate', startDate.toISOString());
        }
        if (endDate) {
          params.append('endDate', endDate.toISOString());
        }

        const response = await fetch(`/api/analytics/cohorts?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch cohorts');
        }

        const data: CohortDefinition[] = await response.json();
        setCohorts(data);

        if (data.length > 0 && !selectedCohort) {
          setSelectedCohort(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCohorts();
  }, [workspaceSlug, cohortType, startDate, endDate]);

  // Fetch retention and conversion data for selected cohort
  useEffect(() => {
    if (!selectedCohort) return;

    const fetchCohortData = async () => {
      try {
        // Fetch retention data
        const retentionParams = new URLSearchParams({
          workspaceSlug,
          type: 'retention',
          cohort: JSON.stringify(selectedCohort),
          periods: '12',
        });

        const retentionResponse = await fetch(
          `/api/analytics/cohorts?${retentionParams.toString()}`
        );

        if (retentionResponse.ok) {
          const retData: CohortRetentionData = await retentionResponse.json();
          setRetentionData(retData);
        }

        // Fetch conversion data
        const conversionParams = new URLSearchParams({
          workspaceSlug,
          type: 'conversion',
          cohort: JSON.stringify(selectedCohort),
        });

        const conversionResponse = await fetch(
          `/api/analytics/cohorts?${conversionParams.toString()}`
        );

        if (conversionResponse.ok) {
          const convData: CohortConversionData = await conversionResponse.json();
          setConversionData(convData);
        }
      } catch (err) {
        console.error('Error fetching cohort data:', err);
      }
    };

    fetchCohortData();
  }, [selectedCohort, workspaceSlug]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const formatCurrency = (num: number): string => {
    return `$${num.toFixed(2)}`;
  };

  if (loading && cohorts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading cohorts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cohort type selector */}
      <div className="flex items-center gap-4">
        <label className="font-medium text-sm">Cohort Type:</label>
        <div className="flex gap-2">
          <Button
            variant={cohortType === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCohortType('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={cohortType === 'source' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCohortType('source')}
          >
            Traffic Source
          </Button>
          <Button
            variant={cohortType === 'geo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCohortType('geo')}
          >
            Geographic
          </Button>
        </div>
      </div>

      {cohorts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">👥</div>
          <p>No cohorts available for the selected period</p>
        </div>
      ) : (
        <>
          {/* Cohort selector */}
          <div className="flex items-center gap-4">
            <label className="font-medium text-sm">Select Cohort:</label>
            <select
              className="px-4 py-2 border rounded-lg bg-white"
              value={selectedCohort?.id || ''}
              onChange={(e) => {
                const cohort = cohorts.find(c => c.id === e.target.value);
                setSelectedCohort(cohort || null);
              }}
            >
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCohort && (
            <Tabs defaultValue="retention" className="space-y-4">
              <TabsList>
                <TabsTrigger value="retention">Retention</TabsTrigger>
                <TabsTrigger value="conversion">Conversion</TabsTrigger>
              </TabsList>

              <TabsContent value="retention">
                {retentionData ? (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Retention Analysis: {retentionData.cohortName}
                    </h3>
                    <div className="mb-4 text-sm text-gray-600">
                      Cohort size: {formatNumber(retentionData.cohortSize)} visitors
                    </div>

                    {/* Retention curve */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-xs font-medium text-gray-500 border-b">
                            <th className="pb-3 pr-4">Week</th>
                            <th className="pb-3 pr-4 text-right">Visitors</th>
                            <th className="pb-3 pr-4 text-right">Retention Rate</th>
                            <th className="pb-3">Retention Bar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {retentionData.periods.map((period) => (
                            <tr key={period.period} className="hover:bg-gray-50">
                              <td className="py-3 pr-4 text-sm font-medium">
                                Week {period.period}
                              </td>
                              <td className="py-3 pr-4 text-right text-sm">
                                {formatNumber(period.visitors)}
                              </td>
                              <td className="py-3 pr-4 text-right">
                                <span className={`text-sm font-medium ${
                                  period.retentionRate >= 50 ? 'text-green-600' :
                                  period.retentionRate >= 25 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {formatPercentage(period.retentionRate)}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${period.retentionRate}%` }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Loading retention data...
                  </div>
                )}
              </TabsContent>

              <TabsContent value="conversion">
                {conversionData ? (
                  <div className="space-y-4">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Conversion Metrics: {conversionData.cohortName}
                      </h3>

                      <div className="grid gap-4 md:grid-cols-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Cohort Size</div>
                          <div className="text-2xl font-bold">
                            {formatNumber(conversionData.cohortSize)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Conversions</div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatNumber(conversionData.conversions)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Conversion Rate</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPercentage(conversionData.conversionRate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(conversionData.totalRevenue)}
                          </div>
                        </div>
                      </div>

                      {conversionData.avgConversionValue > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium">
                            Average Conversion Value: {formatCurrency(conversionData.avgConversionValue)}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Loading conversion data...
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
