import nodemailer from 'nodemailer';

// Nodemailer transport singleton
let _transport: nodemailer.Transporter | null = null;

/**
 * Gets or initializes the Nodemailer transport.
 * Uses Brevo (Sendinblue) by default based on SMTP env vars.
 */
export function getTransport(): nodemailer.Transporter {
  if (_transport) {
    return _transport;
  }

  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('SMTP_USER or SMTP_PASS not provided. Email delivery may fail in production.');
  }

  _transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: user || 'test',
      pass: pass || 'test',
    },
  });

  return _transport;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Generic email sender.
 */
export async function sendEmail(options: SendEmailOptions) {
  const transport = getTransport();
  
  const from = options.from || process.env.SMTP_FROM || '"LeadLens" <hello@leadlens.com>';
  
  return transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>?/gm, ''), // naive html-to-text fallback
  });
}
