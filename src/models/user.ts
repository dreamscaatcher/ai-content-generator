import { Db, Collection, ObjectId } from 'mongodb';
import { User, CreateUserInput } from '@/types/user';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs'

export class UserModel {
  private static collection: Collection<User>;

  private static async getCollection(): Promise<Collection<User>> {
    if (!this.collection) {
      const db = await getDb();
      this.collection = db.collection<User>('users');
      // Create indexes
      await this.createIndexes();
    }
    return this.collection;
  }

  private static async createIndexes(): Promise<void> {
    const collection = await this.getCollection();
    await collection.createIndex({ email: 1 }, { unique: true });
  }

  public static async createUser(input: CreateUserInput): Promise<User> {
    const collection = await this.getCollection();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 12);
    
    const user: User = {
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      apiLimit: 10, // Default API limit
      apiResetDate: new Date(),
    };

    const result = await collection.insertOne(user as any);
    return { ...user, _id: result.insertedId };
  }

  public static async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    return collection.findOne({ email: email.toLowerCase() });
  }

  public static async findById(_id: ObjectId): Promise<User | null> {
    const collection = await this.getCollection();
    return collection.findOne({ _id });
  }

  public static async updateUser(_id: ObjectId, update: Partial<User>): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id },
      { 
        $set: { 
          ...update,
          updatedAt: new Date()
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  public static async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }
}