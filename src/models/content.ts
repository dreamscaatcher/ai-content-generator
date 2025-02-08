import { Collection, ObjectId } from 'mongodb';
import { Content, CreateContentInput, UpdateContentInput } from '@/types/content';
import { getDb } from '@/lib/mongodb';

export class ContentModel {
  private static collection: Collection<Content>;

  private static async getCollection(): Promise<Collection<Content>> {
    if (!this.collection) {
      const db = await getDb();
      this.collection = db.collection<Content>('contents');
      // Create indexes
      await this.createIndexes();
    }
    return this.collection;
  }

  private static async createIndexes(): Promise<void> {
    const collection = await this.getCollection();
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ type: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ createdAt: -1 });
  }

  public static async createContent(userId: ObjectId, input: CreateContentInput): Promise<Content> {
    const collection = await this.getCollection();
    
    // Calculate word count
    const wordCount = input.content.trim().split(/\s+/).length;
    
    const content: Content = {
      userId,
      title: input.title,
      type: input.type,
      content: input.content,
      metadata: input.metadata,
      version: 1,
      wordCount,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(content as any);
    return { ...content, _id: result.insertedId };
  }

  public static async updateContent(_id: ObjectId, userId: ObjectId, update: UpdateContentInput): Promise<boolean> {
    const collection = await this.getCollection();
    
    // Get current content to properly merge metadata
    const currentContent = await this.getContent(_id, userId);
    if (!currentContent) return false;

    // Prepare update data with type safety
    const updateData: { [key: string]: any } = {
      updatedAt: new Date()
    };

    // Only include defined fields in the update
    if (update.title !== undefined) updateData.title = update.title;
    if (update.content !== undefined) {
      updateData.content = update.content;
      updateData.wordCount = update.content.trim().split(/\s+/).length;
      updateData.version = currentContent.version + 1;
    }
    if (update.status !== undefined) updateData.status = update.status;
    
    // Handle metadata updates by merging with existing metadata
    if (update.metadata) {
      updateData.metadata = {
        ...currentContent.metadata,
        ...update.metadata
      };
    }

    const result = await collection.updateOne(
      { _id, userId },
      { $set: updateData }
    );
    
    return result.modifiedCount > 0;
  }

  public static async getContent(_id: ObjectId, userId: ObjectId): Promise<Content | null> {
    const collection = await this.getCollection();
    return collection.findOne({ _id, userId });
  }

  public static async listContents(
    userId: ObjectId,
    filters?: {
      type?: string;
      status?: string;
      search?: string;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{ contents: Content[]; total: number }> {
    const collection = await this.getCollection();
    
    const query: any = { userId };
    
    if (filters?.type) {
      query.type = filters.type;
    }
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { content: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [contents, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return { contents, total };
  }

  public static async deleteContent(_id: ObjectId, userId: ObjectId): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id, userId });
    return result.deletedCount > 0;
  }

  public static async getContentVersions(contentId: ObjectId): Promise<Content[]> {
    const collection = await this.getCollection();
    return collection
      .find({ originalContentId: contentId })
      .sort({ version: -1 })
      .toArray();
  }
}