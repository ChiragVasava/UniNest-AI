import nodemailer from "nodemailer";
import twilio from "twilio";

// Configure Nodemailer SMTP Transporter
const createMailTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for port 465, false for other ports
      auth: { user, pass },
    });
  }

  // Fallback Transporter that logs to console
  return {
    sendMail: async (options: nodemailer.SendMailOptions) => {
      console.log("------------------------------------------");
      console.log(`✉️  [SIMULATED EMAIL SENT]`);
      console.log(`To:      ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body:\n${options.text || options.html}`);
      console.log("------------------------------------------");
      return { messageId: "simulated-id" };
    },
  };
};

const mailTransporter = createMailTransporter();

/**
 * Send an email using SMTP or simulated console log fallback
 */
export const sendEmail = async (to: string, subject: string, body: string, htmlBody?: string) => {
  const from = process.env.SMTP_FROM || '"UniNest AI" <noreply@uninest.com>';
  try {
    await mailTransporter.sendMail({
      from,
      to,
      subject,
      text: body,
      html: htmlBody || body,
    });
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

/**
 * Send an SMS using Twilio or simulated console log fallback
 */
export const sendSMS = async (to: string, message: string) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (sid && token && from) {
    try {
      const client = twilio(sid, token);
      await client.messages.create({
        body: message,
        from,
        to,
      });
      console.log(`📲 SMS sent successfully to ${to}`);
    } catch (error) {
      console.error(`❌ Twilio failed to send SMS to ${to}:`, error);
    }
  } else {
    // Simulated logger fallback
    console.log("------------------------------------------");
    console.log(`📲 [SIMULATED SMS SENT]`);
    console.log(`To:      ${to}`);
    console.log(`Message: ${message}`);
    console.log("------------------------------------------");
  }
};
