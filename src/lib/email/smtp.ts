import nodemailer from "nodemailer";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM;

const hasSmtpConfig =
  !!smtpHost && !!smtpPort && !!smtpUser && !!smtpPass && !!smtpFrom;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  if (!transporter || !smtpFrom) {
    console.warn("[auth] SMTP is not configured. Skipping email delivery.");
    return;
  }

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    html,
    text,
  });
}
