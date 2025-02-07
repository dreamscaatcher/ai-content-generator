import { ObjectId } from "mongodb";

export interface Content {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  type: ContentType;
  content: string;
  metadata: ContentMetadata;
  version: number;
  wordCount: number;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentType = 'blog' | 'article' | 'social' | 'email' | 'description';

export type ContentStatus = 'draft' | 'published' | 'archived';

export interface ContentMetadata {
  topic: string;
  keywords: string[];
  tone: string;
  additionalInstructions?: string;
}

export interface CreateContentInput {
  title: string;
  type: ContentType;
  content: string;
  metadata: ContentMetadata;
}

export interface UpdateContentInput {
  title?: string;
  content?: string;
  metadata?: Partial<ContentMetadata>;
  status?: ContentStatus;
}