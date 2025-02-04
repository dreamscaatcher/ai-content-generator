import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/user';
import * as jwt from 'jsonwebtoken';

// Get JWT secret and ensure it exists with proper typing
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Define the token payload type
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user || !user._id) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Validate password
    const isValidPassword = await UserModel.validatePassword(user, password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Prepare payload with proper typing
    const payload: JWTPayload = {
      userId: user._id.toString(), // Convert ObjectId to string
      email: user.email,
      role: user.role
    };

    // Generate JWT token with typed secret
    const token = jwt.sign(
      payload,
      JWT_SECRET as jwt.Secret,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie with the token
    const response = NextResponse.json(
      { 
        message: 'Logged in successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}