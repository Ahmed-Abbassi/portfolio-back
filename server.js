import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";

// Multer setup for temporary memory storage (avoid disk on Vercel)
const storage = multer.memoryStorage();
const upload = multer({ storage });
const parseForm = upload.single("attachment");

// Helper to promisify multer
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)));
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await runMiddleware(req, res, parseForm);

    const { fullName, email, phone, service, message } = req.body;
    const file = req.file;

    if (!fullName || !email || !message) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Portfolio Contact" <${email}>`,
      to: process.env.EMAIL,
      subject: `New Contact Form Submission from ${fullName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Service:</strong> ${service || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
      attachments: file ? [{ filename: file.originalname, content: file.buffer }] : [],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
}
