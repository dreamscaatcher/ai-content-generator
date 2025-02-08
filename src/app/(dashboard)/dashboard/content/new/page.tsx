'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

type ContentType = 'blog' | 'article' | 'social' | 'email' | 'description';
type ToneType = 'professional' | 'casual' | 'friendly' | 'formal' | 'humorous';

interface FormData {
  contentType: ContentType;
  topic: string;
  keywords: string;
  tone: ToneType;
  additionalInstructions: string;
}

const contentTypes = [
  { id: 'blog' as ContentType, name: 'Blog Post' },
  { id: 'article' as ContentType, name: 'Article' },
  { id: 'social' as ContentType, name: 'Social Media Post' },
  { id: 'email' as ContentType, name: 'Email' },
  { id: 'description' as ContentType, name: 'Product Description' }
];

const toneOptions = [
  { id: 'professional' as ToneType, name: 'Professional' },
  { id: 'casual' as ToneType, name: 'Casual' },
  { id: 'friendly' as ToneType, name: 'Friendly' },
  { id: 'formal' as ToneType, name: 'Formal' },
  { id: 'humorous' as ToneType, name: 'Humorous' }
];

export default function NewContentPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    contentType: 'blog',
    topic: '',
    keywords: '',
    tone: 'professional',
    additionalInstructions: ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate content');
      }

      const data = await response.json();
      
      // Create new content with the generated text
      const contentResponse = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.topic,
          type: formData.contentType,
          content: data.content,
          metadata: {
            topic: formData.topic,
            keywords: formData.keywords.split(',').map(k => k.trim()),
            tone: formData.tone,
            additionalInstructions: formData.additionalInstructions
          }
        }),
      });

      if (!contentResponse.ok) {
        throw new Error('Failed to save generated content');
      }

      const contentData = await contentResponse.json();
      router.push(`/dashboard/content/${contentData._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate New Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <Select
                name="contentType"
                value={formData.contentType}
                onValueChange={(value: string) => handleSelectChange('contentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Textarea
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Enter the main topic or subject"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Keywords</label>
              <Input
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="Enter keywords (comma-separated)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select
                name="tone"
                value={formData.tone}
                onValueChange={(value: string) => handleSelectChange('tone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((tone) => (
                    <SelectItem key={tone.id} value={tone.id}>
                      {tone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Instructions</label>
              <Textarea
                name="additionalInstructions"
                value={formData.additionalInstructions}
                onChange={handleChange}
                placeholder="Any specific requirements or instructions"
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Content'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}