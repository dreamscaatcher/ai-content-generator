import { Collection, ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

export interface PasswordResetToken {
  _id?: ObjectId;
  userId: ObjectId;
  email: string;
  resetToken: string;
  expiration: Date;
  createdAt: Date;
  isUsed: boolean;
}

export class PasswordResetTokenModel {
  private static collection: Collection<PasswordResetToken>;

  private static async getCollection(): Promise<Collection<PasswordResetToken>> {
    if (!this.collection) {
      const db = await getDb();
      this.collection = db.collection<PasswordResetToken>('passwordResetTokens');
      // Create indexes
      await this.createIndexes();
    }
    return this.collection;
  }

  private static async createIndexes(): Promise<void> {
    const collection = await this.getCollection();
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ email: 1 });
    await collection.createIndex({ resetToken: 1 }, { unique: true });
    await collection.createIndex({ expiration: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic removal
    await collection.createIndex({ createdAt: -1 });
  }

  public static async createToken(
    userId: ObjectId, 
    email: string, 
    resetToken: string,
    expirationHours: number = 1
  ): Promise<PasswordResetToken> {
    const collection = await this.getCollection();
    
    // Set expiration time (default 1 hour from now)
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + expirationHours);
    
    // Create new token document
    const tokenDoc: PasswordResetToken = {
      userId,
      email: email.toLowerCase(),
      resetToken,
      expiration,
      createdAt: new Date(),
      isUsed: false
    };
    
    // Remove any existing tokens for this user
    await collection.deleteMany({ userId });
    
    // Insert the new token
    const result = await collection.insertOne(tokenDoc as any);
    return { ...tokenDoc, _id: result.insertedId };
  }

  public static async findValidToken(resetToken: string): Promise<PasswordResetToken | null> {
    const collection = await this.getCollection();
    const now = new Date();
    
    return collection.findOne({ 
      resetToken, 
      expiration: { $gt: now },
      isUsed: false
    });
  }

  public static async markTokenAsUsed(resetToken: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { resetToken },
      { $set: { isUsed: true } }
    );
    
    return result.modifiedCount > 0;
  }

  public static async cleanupExpiredTokens(): Promise<number> {
    const collection = await this.getCollection();
    const now = new Date();
    
    const result = await collection.deleteMany({
      expiration: { $lt: now }
    });
    
    return result.deletedCount;
  }
}
