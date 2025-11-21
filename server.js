const express = require('express');
require("dotenv").config();
const cors = require('cors');
const nodemailer = require("nodemailer");
const multer = require("multer");

const app = express();

app.use(cors({
  origin: 'https://ahmedabbassi-portfolio.netlify.app/'
}));

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Parse JSON for non-file fields
app.use(express.json());

app.post("/contact", upload.single("attachment"), async (req, res) => {
  const { fullName, email, phone, service, message } = req.body;
  const file = req.file;

  if (!fullName || !email || !message) {
    return res.status(400).json({ error: "Please fill all required fields" });
  }

  try {
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
      attachments: file ? [{
        filename: file.originalname,
        content: file.buffer
      }] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);

    res.json({ success: true, message: "Email sent successfully" });

  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
