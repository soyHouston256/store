import nodemailer from 'nodemailer';
import type { Config } from '../config.js';
import type { ComplaintDocument } from '../models/Complaint.js';
import { renderComplaintMail } from './templates/complaint.js';

/**
 * Optional outgoing mail for the Libro de Reclamaciones (design §5.4, C6).
 *
 * `createMailer` returns `null` — and creates NO transport — unless both
 * `SMTP_HOST` and `COMPLAINTS_EMAIL` are configured. `SMTP_USER`/`SMTP_PASS`
 * are optional (auth only when present). The warning line
 * `complaints: SMTP not configured` is the operator's signal that complaints
 * are being stored without email.
 */
export interface MailMessage {
  from: string;
  to: string;
  cc?: string;
  subject: string;
  text: string;
  html: string;
}

export interface MailTransport {
  sendMail(message: MailMessage): Promise<unknown>;
}

export interface Mailer {
  transport: MailTransport;
  from: string;
  complaintsEmail: string;
}

export const SMTP_NOT_CONFIGURED = 'complaints: SMTP not configured';

type MailerConfig = Pick<Config, 'smtp' | 'complaints'>;

export interface CreateMailerOptions {
  /** Injectable for tests; defaults to nodemailer's SMTP transport. */
  createTransport?: (config: MailerConfig['smtp']) => MailTransport;
  warn?: (message: string) => void;
}

function defaultCreateTransport(smtp: MailerConfig['smtp']): MailTransport {
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    ...(smtp.user && smtp.pass ? { auth: { user: smtp.user, pass: smtp.pass } } : {}),
  });
}

export function createMailer(
  config: MailerConfig,
  { createTransport = defaultCreateTransport, warn = console.warn }: CreateMailerOptions = {},
): Mailer | null {
  const { smtp, complaints } = config;
  if (!smtp.host || !complaints.email) {
    warn(SMTP_NOT_CONFIGURED);
    return null;
  }
  return {
    transport: createTransport(smtp),
    from: smtp.from ?? complaints.email,
    complaintsEmail: complaints.email,
  };
}

/**
 * Sends the hoja to the business mailbox with a copy (cc) to the consumer —
 * the copy is mandatory by norm. Resolves `true` on success and `false` on
 * any transport failure (logged); it never throws, so the request that
 * created the complaint always answers 201.
 */
export async function sendComplaintEmail(mailer: Mailer, complaint: ComplaintDocument): Promise<boolean> {
  const rendered = renderComplaintMail(complaint);
  try {
    await mailer.transport.sendMail({
      from: mailer.from,
      to: mailer.complaintsEmail,
      cc: complaint.consumer.email,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
    return true;
  } catch (err) {
    console.error(`complaints: email for ${complaint.code} failed`, err);
    return false;
  }
}
