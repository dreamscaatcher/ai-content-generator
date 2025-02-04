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