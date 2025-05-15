import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/user';
import { PasswordResetTokenModel } from '@/models/passwordResetToken';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, password, confirmPassword } = body;

    // Basic validation
    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find the reset token
    const resetToken = await PasswordResetTokenModel.findValidToken(token);
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Verify the email matches the token
    if (resetToken.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Invalid reset request' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await UserModel.findById(resetToken.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user's password
    await UserModel.updateUser(user._id, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    // Mark the token as used
    await PasswordResetTokenModel.markTokenAsUsed(token);

    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
