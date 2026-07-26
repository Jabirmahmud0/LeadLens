import { wrapBaseTemplate } from './base';

/**
 * Supabase Verification Email Template
 * In Supabase, the {{ .ConfirmationURL }} variable is replaced at send time.
 */
export function getVerificationEmailTemplate(): { subject: string, html: string } {
  const content = `
    <h1>Verify your email</h1>
    <p>Welcome to LeadLens! Please verify your email address to get started.</p>
    <a href="{{ .ConfirmationURL }}" class="button" target="_blank">Verify Email</a>
    <p style="margin-top: 32px; font-size: 14px; color: #a3a3a3;">
      Or copy and paste this link into your browser:<br/>
      <span style="color: #60a5fa;">{{ .ConfirmationURL }}</span>
    </p>
  `;

  return {
    subject: 'Confirm your email address - LeadLens',
    html: wrapBaseTemplate('Verify your email', 'Please confirm your email address to start using LeadLens.', content),
  };
}

/**
 * Supabase Password Reset Email Template
 * In Supabase, the {{ .ConfirmationURL }} variable is replaced at send time.
 */
export function getPasswordResetTemplate(): { subject: string, html: string } {
  const content = `
    <h1>Reset your password</h1>
    <p>We received a request to reset the password for your LeadLens account.</p>
    <a href="{{ .ConfirmationURL }}" class="button" target="_blank">Reset Password</a>
    <p style="margin-top: 32px; font-size: 14px; color: #a3a3a3;">
      If you did not request a password reset, you can safely ignore this email.
    </p>
  `;

  return {
    subject: 'Reset your password - LeadLens',
    html: wrapBaseTemplate('Reset your password', 'Instructions to reset your LeadLens password.', content),
  };
}
