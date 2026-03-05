import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { VerificationEmail } from "../../emails/verification-email";

type SendVerificationEmailInput = {
  email: string;
  name?: string;
  verificationUrl: string;
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

export async function sendVerificationEmailViaSmtp({
  email,
  name,
  verificationUrl,
}: SendVerificationEmailInput) {
  if (!transporter || !smtpFrom) {
    console.warn(
      "[auth] SMTP is not configured. Skipping verification email delivery."
    );
    return;
  }

  const html = await render(
    VerificationEmail({
      userName: name,
      verificationUrl,
    })
  );

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Verify your Hack4Us account",
    html,
  });
}
