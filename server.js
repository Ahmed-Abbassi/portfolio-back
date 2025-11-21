const express = require('express');
require("dotenv").config();
const cors = require('cors');
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors({
  origin: 'https://ahmedabbassi-portfolio.netlify.app/'
}));


// Use multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder to store uploaded files temporarily
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Parse JSON for non-file fields
app.use(express.json());

// Route: receive contact form
app.post("/contact", upload.single("attachment"), async (req, res) => {
  const { fullName, email, phone, service, message } = req.body;
  const file = req.file;


  if (!fullName || !email || !message) {
    return res.status(400).json({ error: "Please fill all required fields" });
  }

  try {
    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,       // your Gmail
        pass: process.env.EMAIL_PASS,  // Gmail App Password
      },
    });

    // Email options
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
        path: file.path
      }] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);

    // Delete the file after sending email
    if (file) {
      fs.unlinkSync(file.path);
    }

    res.json({ success: true, message: "Email sent successfully" });

  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
