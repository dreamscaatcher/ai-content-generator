import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "user" | "admin";
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  apiLimit: number;
  apiResetDate: Date;
  apiUsed: number; // Added this field for tracking API usage
}

export interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

// Additional type for updating user properties
export interface UpdateUserInput extends Partial<Omit<User, '_id'>> {
  apiUsed?: number;
}