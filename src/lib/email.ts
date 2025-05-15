import nodemailer from 'nodemailer';

// Configure nodemailer with environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Template for password reset email
const createResetPasswordTemplate = (
  name: string,
  resetLink: string
): { subject: string; html: string } => {
  const subject = 'Reset Your Password - AI Content Generator';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password for your AI Content Generator account. To proceed with the password reset, please click on the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #4A7AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <p>Best regards,<br>AI Content Generator Team</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888;">This is an automated email. Please do not reply to this message.</p>
    </div>
  `;
  
  return { subject, html };
};

/**
 * Sends a password reset email to the user
 * @param email Recipient email address
 * @param name User's name
 * @param resetLink Password reset link with token
 */
export async function sendResetPasswordEmail(
  email: string,
  name: string,
  resetLink: string
): Promise<void> {
  try {
    const { subject, html } = createResetPasswordTemplate(name, resetLink);
    
    await transporter.sendMail({
      from: `"AI Content Generator" <${process.env.EMAIL_FROM || 'noreply@aicontentgenerator.com'}>`,
      to: email,
      subject,
      html,
    });
    
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Test the email configuration by sending a test email
 */
export async function sendTestEmail(email: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"AI Content Generator" <${process.env.EMAIL_FROM || 'noreply@aicontentgenerator.com'}>`,
      to: email,
      subject: 'Email Configuration Test',
      html: '<p>This is a test email to verify that the email configuration is working correctly.</p>',
    });
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}
