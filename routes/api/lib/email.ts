import { Resend } from 'resend'
import { loadServerEnv } from './env'

export function getAppUrl() {
  loadServerEnv()
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function isEmailConfigured() {
  loadServerEnv()
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  loadServerEnv()
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — password reset email skipped')
    return false
  }

  const from = process.env.EMAIL_FROM?.trim() || 'Workout Tracker <onboarding@resend.dev>'
  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from,
    to,
    subject: 'Reset your Workout Tracker password',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 20px; margin-bottom: 16px;">Reset your password</h1>
        <p style="color: #475569; line-height: 1.5;">
          We received a request to reset the password for your Workout Tracker account.
          Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <p style="margin: 28px 0;">
          <a href="${resetLink}"
             style="display: inline-block; background: #22c55e; color: #052e16; font-weight: 600;
                    text-decoration: none; padding: 12px 24px; border-radius: 12px;">
            Reset password
          </a>
        </p>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
          If you did not request this, you can ignore this email. Your password will not change.
        </p>
        <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">
          Or copy this link: ${resetLink}
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('[email] Resend error:', error)
    return false
  }

  return true
}
