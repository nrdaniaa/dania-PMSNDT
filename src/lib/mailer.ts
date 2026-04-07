import nodemailer from 'nodemailer'

const host = process.env.SMTP_HOST
const port = Number(process.env.SMTP_PORT || 587)
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const from = process.env.SMTP_FROM

if (!host || !user || !pass || !from) {
  console.warn('SMTP environment variables are not fully set. Mailer may fail.')
}

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass,
  },
})

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${encodeURIComponent(token)}`
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Please verify your email - NDT System',
    text: `Please verify your account by visiting: ${verifyUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification Required</h2>
        <p>Thank you for registering with the NDT System. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${verifyUrl}</p>
        <p><small>This verification link will expire in 24 hours.</small></p>
      </div>
    `,
  })
  return info
}

export async function sendWelcomeEmail(to: string, name: string) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Welcome to NDT System',
    text: `Welcome ${name}! Your email has been successfully verified and your account is now active.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to NDT System!</h2>
        <p>Hello ${name},</p>
        <p>Your email has been successfully verified and your account is now active. You can now log in and start using the NDT System.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to Your Account</a>
        </div>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>NDT System Team</p>
      </div>
    `,
  })
  return info
}
