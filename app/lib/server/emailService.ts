import "server-only";

import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || "Andormera <no-reply@andormera.com>";

function getTransporter() {
  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to?: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!to) return;

  const transporter = getTransporter();

  if (!transporter) {
    console.warn("Email service is not configured.");
    return;
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
