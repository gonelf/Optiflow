import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendPasswordResetEmailParams {
  to: string
  resetUrl: string
  userName?: string
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}: SendPasswordResetEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@reoptimize.xyz',
      to,
      subject: 'Reset Your Password - Reoptimize',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Reoptimize</h1>
            </div>

            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>

              ${userName ? `<p>Hi ${userName},</p>` : '<p>Hi there,</p>'}

              <p>We received a request to reset your password for your Reoptimize account. Click the button below to create a new password:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Reset Password</a>
              </div>

              <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #667eea; word-break: break-all; font-size: 14px;">${resetUrl}</p>

              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px;"><strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.</p>
              </div>

              <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated email from Reoptimize. Please do not reply to this message.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error }
  }
}
