import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { UserModel } from '@/models/user';
import { PasswordResetTokenModel } from '@/models/passwordResetToken';
import { sendResetPasswordEmail } from '@/lib/email';

// Rate limiting setup
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;
const requestTracker = new Map<string, { count: number, timestamp: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Apply rate limiting based on IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    if (applyRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Find the user by email
    const user = await UserModel.findByEmail(email);
    if (!user || !user._id) {
      // For security reasons, don't reveal that the email doesn't exist
      // Instead, return a success message to prevent email enumeration attacks
      return NextResponse.json(
        { message: 'If your email is registered in our system, you will receive password reset instructions.' },
        { status: 200 }
      );
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store the token in the database
    await PasswordResetTokenModel.createToken(user._id, email, resetToken);

    // Send email with reset link (we'll implement this in the email library)
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await sendResetPasswordEmail(email, user.name, resetLink);

    return NextResponse.json(
      { message: 'If your email is registered in our system, you will receive password reset instructions.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Rate limiting helper function
function applyRateLimit(key: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  
  // Clean up old entries
  for (const [k, data] of requestTracker.entries()) {
    if (data.timestamp < windowStart) {
      requestTracker.delete(k);
    }
  }
  
  // Check and update rate limit for this key
  const data = requestTracker.get(key) || { count: 0, timestamp: now };
  
  // If within the window, increment the counter
  if (data.timestamp >= windowStart) {
    data.count++;
    if (data.count > MAX_REQUESTS_PER_WINDOW) {
      return true; // Rate limit exceeded
    }
  } else {
    // New window, reset counter
    data.count = 1;
    data.timestamp = now;
  }
  
  requestTracker.set(key, data);
  return false; // Rate limit not exceeded
}
