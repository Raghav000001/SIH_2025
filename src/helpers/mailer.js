import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * 
 * @param {string} to 
 * @param {string} subject 
 * @param {string} html
 */
export const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"My App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Mail sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error(" Email sending failed:", error.message);
    throw new Error("Email sending failed");
  }
};
