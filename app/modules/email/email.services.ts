import nodemailer from 'nodemailer';
import type { EmailOptions } from './email.dto.js';
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const sendEmail = async (data: EmailOptions) => {
  const { to, subject, html } = data;
  try {
    const info = await transporter.sendMail({
      from: `"Kafka Dev" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};
