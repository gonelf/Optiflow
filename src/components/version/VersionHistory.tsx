/**
 * Version History Component
 * Displays page version history with rollback functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, RotateCcw, GitBranch, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PageVersion {
  id: string;
  versionNumber: number;
  title: string;
  changeType: string;
  changeSummary: string | null;
  changedBy: string;
  isRestorePoint: boolean;
  createdAt: string;
}

interface VersionHistoryProps {
  pageId: string;
  onRollback?: (versionNumber: number) => void;
}

export function VersionHistory({ pageId, onRollback }: VersionHistoryProps) {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  useEffect(() => {
    fetchVersionHistory();
  }, [pageId]);

  const fetchVersionHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/versions/${pageId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch version history');
      }

      const data = await response.json();
      setVersions(data.versions);
    } catch (error) {
      console.error('Error fetching version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (versionNumber: number) => {
    if (!confirm(`Are you sure you want to rollback to version ${versionNumber}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/versions/${pageId}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to rollback');
      }

      // Refresh version history
      await fetchVersionHistory();

      // Call parent callback
      onRollback?.(versionNumber);

      alert('Successfully rolled back to version ' + versionNumber);
    } catch (error) {
      console.error('Error rolling back:', error);
      alert('Failed to rollback. Please try again.');
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'MANUAL_SAVE':
        return 'bg-blue-100 text-blue-800';
      case 'AUTO_SAVE':
        return 'bg-gray-100 text-gray-800';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'ROLLBACK':
        return 'bg-orange-100 text-orange-800';
      case 'COLLABORATION_MERGE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    return changeType.replace(/_/g, ' ').toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Loading version history...</p>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <GitBranch className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-gray-600">No version history available</p>
        <p className="text-sm text-gray-500 mt-1">
          Version history will appear here as you make changes
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Version History
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {versions.length} version{versions.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="divide-y">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedVersion === version.versionNumber ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedVersion(version.versionNumber)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      v{version.versionNumber}
                    </span>

                    {version.isRestorePoint && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        <Tag className="w-3 h-3" />
                        Restore Point
                      </span>
                    )}

                    {index === 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  <h3 className="font-medium text-gray-900">{version.title}</h3>

                  {version.changeSummary && (
                    <p className="text-sm text-gray-600 mt-1">
                      {version.changeSummary}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full ${getChangeTypeColor(version.changeType)}`}
                    >
                      {getChangeTypeLabel(version.changeType)}
                    </span>

                    <span>
                      {formatDistanceToNow(new Date(version.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                {index !== 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRollback(version.versionNumber);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
