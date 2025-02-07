'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from '@/components/ui/select';

const contentTypes = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'article', label: 'Article' },
  { value: 'social', label: 'Social Media Post' },
  { value: 'email', label: 'Email' },
  { value: 'description', label: 'Product Description' }
];

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'humorous', label: 'Humorous' }
];

interface FormData {
  contentType: string;
  topic: string;
  keywords: string;
  tone: string;
  additionalInstructions: string;
}

export default function NewContentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    contentType: '',
    topic: '',
    keywords: '',
    tone: '',
    additionalInstructions: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      // Handle successful content generation
      router.push('/dashboard/content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Generate New Content</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Content Type
          </label>
          <Select
            name="contentType"
            value={formData.contentType}
            onChange={(value) => handleSelectChange('contentType', value)}
            options={contentTypes}
            placeholder="Select content type"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Topic
          </label>
          <textarea
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
            placeholder="Enter your topic"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Keywords
          </label>
          <textarea
            name="keywords"
            value={formData.keywords}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter keywords (comma-separated)"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tone
          </label>
          <Select
            name="tone"
            value={formData.tone}
            onChange={(value) => handleSelectChange('tone', value)}
            options={toneOptions}
            placeholder="Select tone"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Additional Instructions
          </label>
          <textarea
            name="additionalInstructions"
            value={formData.additionalInstructions}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
            placeholder="Any specific requirements or instructions"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>
      </form>
    </div>
  );
}