import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Content } from '@/types/content';

interface VersionHistoryProps {
  currentVersion: Content;
  versions: Content[];
  onRevertToVersion?: (version: Content) => void;
}

interface DiffResult {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

export function VersionHistory({ currentVersion, versions, onRevertToVersion }: VersionHistoryProps) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Simple diff implementation for text comparison
  const computeDiff = (oldText: string, newText: string): DiffResult[] => {
    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);
    const diff: DiffResult[] = [];
    
    let i = 0, j = 0;
    while (i < oldWords.length || j < newWords.length) {
      if (i >= oldWords.length) {
        // All remaining words in newWords are additions
        diff.push({ type: 'added', value: newWords[j] });
        j++;
      } else if (j >= newWords.length) {
        // All remaining words in oldWords are removals
        diff.push({ type: 'removed', value: oldWords[i] });
        i++;
      } else if (oldWords[i] === newWords[j]) {
        // Words match
        diff.push({ type: 'unchanged', value: oldWords[i] });
        i++;
        j++;
      } else {
        // Words differ
        diff.push({ type: 'removed', value: oldWords[i] });
        diff.push({ type: 'added', value: newWords[j] });
        i++;
        j++;
      }
    }
    
    return diff;
  };

  const renderDiff = (oldContent: string, newContent: string) => {
    const diff = computeDiff(oldContent, newContent);
    
    return (
      <div className="font-mono text-sm whitespace-pre-wrap">
        {diff.map((change, index) => (
          <span
            key={index}
            className={
              change.type === 'added'
                ? 'bg-green-100 text-green-800'
                : change.type === 'removed'
                ? 'bg-red-100 text-red-800 line-through'
                : ''
            }
          >
            {change.value}{' '}
          </span>
        ))}
      </div>
    );
  };

  const toggleVersion = (versionId: string) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId);
  };

  const handleRevert = async (version: Content) => {
    if (onRevertToVersion && confirm('Are you sure you want to revert to this version?')) {
      onRevertToVersion(version);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Version History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Version */}
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">Current Version</span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(currentVersion.updatedAt)}
              </span>
            </div>
          </div>

          {/* Version History */}
          {versions.map((version) => (
            <div key={version._id?.toString()} className="border rounded-md">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleVersion(version._id?.toString() || '')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Version {version.version}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {formatDate(version.updatedAt)}
                    </span>
                    {expandedVersion === version._id?.toString() ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>

              {expandedVersion === version._id?.toString() && (
                <div className="px-4 pb-4 border-t">
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Changes from previous version:</h4>
                      {renderDiff(version.content, currentVersion.content)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-1">Metadata Changes:</h4>
                        <dl className="grid grid-cols-2 gap-2">
                          <dt className="text-gray-600">Topic:</dt>
                          <dd>{version.metadata.topic}</dd>
                          <dt className="text-gray-600">Keywords:</dt>
                          <dd>{version.metadata.keywords.join(', ')}</dd>
                          <dt className="text-gray-600">Tone:</dt>
                          <dd>{version.metadata.tone}</dd>
                        </dl>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Status:</h4>
                        <p>{version.status}</p>
                      </div>
                    </div>

                    {onRevertToVersion && (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevert(version)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Revert to this version
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}