import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { ContentModel } from '@/models/content';
import { CreateContentInput, UpdateContentInput } from '@/types/content';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/models/user';

// Create new content
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

    // Get user
    const user = await UserModel.findByEmail(session.user.email);
    if (!user?._id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const input: CreateContentInput = await request.json();

    // Basic validation
    if (!input.title || !input.content || !input.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create content
    const content = await ContentModel.createContent(user._id, input);

    return NextResponse.json(content, { status: 201 });

  } catch (error) {
    console.error('Content creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

// Get content list with filters and pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await UserModel.findByEmail(session.user.email);
    if (!user?._id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    // Get content list
    const result = await ContentModel.listContents(
      user._id,
      { type, status, search },
      { page, limit }
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Content list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content list' },
      { status: 500 }
    );
  }
}

// Update existing content
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await UserModel.findByEmail(session.user.email);
    if (!user?._id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const { id, ...updateData }: { id: string } & UpdateContentInput = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Update content
    const success = await ContentModel.updateContent(
      new ObjectId(id),
      user._id,
      updateData
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Content not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Content updated successfully' });

  } catch (error) {
    console.error('Content update error:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

// Delete content
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await UserModel.findByEmail(session.user.email);
    if (!user?._id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get content ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Delete content
    const success = await ContentModel.deleteContent(
      new ObjectId(id),
      user._id
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Content not found or delete failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Content deleted successfully' });

  } catch (error) {
    console.error('Content deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}