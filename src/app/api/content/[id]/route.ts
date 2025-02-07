import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { ContentModel } from '@/models/content';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/models/user';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate ID
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid content ID' },
        { status: 400 }
      );
    }

    // Get content
    const content = await ContentModel.getContent(
      new ObjectId(params.id),
      user._id
    );

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Get version history if requested
    const includeVersions = request.nextUrl.searchParams.get('versions') === 'true';
    let versions = [];
    
    if (includeVersions) {
      versions = await ContentModel.getContentVersions(new ObjectId(params.id));
    }

    return NextResponse.json({
      content,
      ...(includeVersions && { versions })
    });

  } catch (error) {
    console.error('Content retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// Delete specific content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate ID
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid content ID' },
        { status: 400 }
      );
    }

    // Delete content
    const success = await ContentModel.deleteContent(
      new ObjectId(params.id),
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

// Update specific content
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate ID
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid content ID' },
        { status: 400 }
      );
    }

    // Get update data
    const updateData = await request.json();

    // Update content
    const success = await ContentModel.updateContent(
      new ObjectId(params.id),
      user._id,
      updateData
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Content not found or update failed' },
        { status: 404 }
      );
    }

    // Get updated content
    const updatedContent = await ContentModel.getContent(
      new ObjectId(params.id),
      user._id
    );

    return NextResponse.json({
      message: 'Content updated successfully',
      content: updatedContent
    });

  } catch (error) {
    console.error('Content update error:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}