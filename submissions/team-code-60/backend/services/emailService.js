import nodemailer from 'nodemailer';

let transporter;

// Try to create email transporter, fallback to console log for dev
try {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.replace(/\s/g, '')
    },
    tls: { rejectUnauthorized: false }
  });
  console.log('Email service configured');
} catch (err) {
  console.log('Email config failed, using console fallback');
}

export const sendOTPEmail = async (email, otp) => {
  // Always log OTP to console for development
  console.log('========================================');
  console.log(`OTP for ${email}: ${otp}`);
  console.log('========================================');

  // Try to send email if transporter is ready
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"AI Marketing" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - OTP Code',
        html: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4F46E5;">Email Verification</h2><p>Your OTP code is:</p><div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; margin: 20px 0; color: #4F46E5;">${otp}</div><p style="color: #6b7280;">Expires in 10 minutes.</p></div>`
      });
    } catch (err) {
      console.log('Email send failed (check console for OTP)');
    }
  }
};

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
