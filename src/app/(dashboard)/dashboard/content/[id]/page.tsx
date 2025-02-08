'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Content } from '@/types/content';
import { ContentPreview } from '@/components/content/content-preview';

interface ContentDetailProps {
  params: {
    id: string;
  };
}

export default function ContentDetailPage({ params }: ContentDetailProps) {
  const router = useRouter();
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/content/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`/api/content/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      router.push('/dashboard/content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/dashboard/content')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Content List
        </Button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p>Content not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/dashboard/content')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Content List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/content')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/content/${params.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{content.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Created on {formatDate(content.createdAt)}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(content.status)}`}>
              {content.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Content Preview */}
            <ContentPreview
              title={content.title}
              content={content.content}
              type={content.type}
              metadata={content.metadata}
            />

            {/* Metadata */}
            <div>
              <h3 className="font-semibold mb-2">Metadata</h3>
              <dl className="grid grid-cols-2 gap-2">
                <dt className="text-gray-600">Type:</dt>
                <dd>{content.type}</dd>
                <dt className="text-gray-600">Words:</dt>
                <dd>{content.wordCount}</dd>
                <dt className="text-gray-600">Topic:</dt>
                <dd>{content.metadata.topic}</dd>
                <dt className="text-gray-600">Keywords:</dt>
                <dd>{content.metadata.keywords.join(', ')}</dd>
                <dt className="text-gray-600">Tone:</dt>
                <dd>{content.metadata.tone}</dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}