const nodemailer = require('nodemailer');

const sendResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
  
  console.log('-----------------------------------------');
  console.log(`[EMAIL SYSTEM] Generating reset link for: ${toEmail}`);
  console.log(`[LINK] ${resetUrl}`);
  console.log('-----------------------------------------');

  // If user provided real credentials, send the real email
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Task Manager" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6366f1;">Reset Your Password</h2>
            <p>You requested a password reset. Click the button below to continue:</p>
            <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
            <p>If you didn't request this, ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[SUCCESS] Real email sent to ${toEmail}`);
    } catch (error) {
      console.error('[ERROR] Failed to send real email:', error.message);
      // Don't crash the whole app, the link is still in the terminal!
    }
  } else {
    console.log('[INFO] No email credentials found. Use the link above in your terminal to test!');
  }
};

module.exports = { sendResetEmail };
