import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentType, ContentMetadata } from '@/types/content';
import { Globe, Mail, MessageSquare, FileText, Tag } from 'lucide-react';

interface ContentPreviewProps {
  title: string;
  content: string;
  type: ContentType;
  metadata: ContentMetadata;
}

export function ContentPreview({ title, content, type, metadata }: ContentPreviewProps) {
  const [currentView, setCurrentView] = useState<'desktop' | 'mobile'>('desktop');

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'blog':
        return <FileText className="h-4 w-4" />;
      case 'social':
        return <MessageSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'article':
        return <Globe className="h-4 w-4" />;
      case 'description':
        return <Tag className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderBlogPreview = () => (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>Topic: {metadata.topic}</span>
        <span>•</span>
        <span>Tone: {metadata.tone}</span>
      </div>
      {content.split('\n').map((paragraph, index) => (
        <p key={index} className="mb-4">
          {paragraph}
        </p>
      ))}
      <div className="flex flex-wrap gap-2 mt-6">
        {metadata.keywords.map((keyword, index) => (
          <span
            key={index}
            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );

  const renderSocialPreview = () => (
    <div className={`bg-white ${currentView === 'mobile' ? 'max-w-[375px]' : 'max-w-[600px]'} mx-auto rounded-lg shadow-sm border p-4`}>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-gray-200 w-10 h-10" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">Account Name</span>
            <span className="text-gray-500">• Now</span>
          </div>
          <p className="mt-2 text-gray-900">{content}</p>
          {metadata.keywords.length > 0 && (
            <div className="mt-3">
              {metadata.keywords.map((keyword, index) => (
                <span key={index} className="text-blue-500">
                  #{keyword.replace(/\s+/g, '')}{' '}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEmailPreview = () => (
    <div className={`bg-white ${currentView === 'mobile' ? 'max-w-[375px]' : 'max-w-[600px]'} mx-auto rounded-lg shadow-sm border p-6`}>
      <div className="mb-4">
        <div className="text-xl font-bold mb-2">{title}</div>
        <div className="text-gray-500 text-sm">From: Your Name</div>
        <div className="text-gray-500 text-sm">Subject: {title}</div>
      </div>
      <div className="border-t pt-4">
        {content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );

  const renderDescriptionPreview = () => (
    <div className={`bg-white ${currentView === 'mobile' ? 'max-w-[375px]' : 'max-w-[600px]'} mx-auto rounded-lg shadow-sm border p-4`}>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-700">{content}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {metadata.keywords.map((keyword, index) => (
          <span
            key={index}
            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );

  const renderArticlePreview = () => (
    <div className="prose max-w-none">
      <h1 className="text-4xl font-bold mb-6">{title}</h1>
      <div className="flex items-center gap-4 mb-8 text-gray-500">
        <span>By Author Name</span>
        <span>•</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>
      {content.split('\n').map((paragraph, index) => (
        <p key={index} className="mb-4">
          {paragraph}
        </p>
      ))}
      <div className="mt-8 pt-4 border-t">
        <h4 className="text-lg font-semibold mb-2">Topics</h4>
        <div className="flex flex-wrap gap-2">
          {metadata.keywords.map((keyword, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (type) {
      case 'blog':
        return renderBlogPreview();
      case 'social':
        return renderSocialPreview();
      case 'email':
        return renderEmailPreview();
      case 'description':
        return renderDescriptionPreview();
      case 'article':
        return renderArticlePreview();
      default:
        return renderBlogPreview();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {getContentTypeIcon(type)}
          Preview
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant={currentView === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('desktop')}
          >
            Desktop
          </Button>
          <Button
            variant={currentView === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('mobile')}
          >
            Mobile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`
          overflow-auto bg-gray-50 rounded-lg p-6
          ${currentView === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'}
        `}>
          {renderPreview()}
        </div>
      </CardContent>
    </Card>
  );
}