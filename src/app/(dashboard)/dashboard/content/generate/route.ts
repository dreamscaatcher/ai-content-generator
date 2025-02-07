import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/models/user';

interface GenerationRequest {
  contentType: string;
  topic: string;
  keywords: string;
  tone: string;
  additionalInstructions: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user and check API limit
    const user = await UserModel.findByEmail(session.user.email);
    if (!user || !user._id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const apiUsed = user.apiUsed || 0;
    if (apiUsed >= user.apiLimit) {
      return NextResponse.json(
        { error: 'API limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body: GenerationRequest = await request.json();
    const { contentType, topic, keywords, tone, additionalInstructions } = body;

    // Basic validation
    if (!contentType || !topic) {
      return NextResponse.json(
        { error: 'Content type and topic are required' },
        { status: 400 }
      );
    }

    // Construct the prompt
    const prompt = `Please create a ${contentType} about ${topic}.
    Tone: ${tone}
    Keywords to include: ${keywords}
    Additional instructions: ${additionalInstructions}

    The content should be well-structured, engaging, and optimized for the specified content type.
    Please ensure proper formatting and a natural flow of ideas.`;

    // Initialize Anthropic client
    const API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    // Make API request to Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    const generatedContent = data.content[0].text;

    // Update user's API usage
    await UserModel.updateUser(user._id, {
      apiUsed: apiUsed + 1
    });

    return NextResponse.json({ content: generatedContent });

  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}