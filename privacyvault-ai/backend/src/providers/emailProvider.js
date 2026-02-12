const nodemailer = require('nodemailer');
const { env } = require('../config/env');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: env.smtpUser
        ? {
            user: env.smtpUser,
            pass: env.smtpPass
          }
        : undefined
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  if (env.nodeEnv === 'test') return;

  const client = getTransporter();
  try {
    await client.sendMail({
      from: env.mailFrom,
      to,
      subject,
      html
    });
  } catch (error) {
    // Keep auth flows usable in local/dev even without SMTP infrastructure.
    console.warn('Email delivery failed, continuing in fallback mode:', error.message);
  }
}

module.exports = { sendEmail };
