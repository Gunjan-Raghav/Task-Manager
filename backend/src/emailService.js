const nodemailer = require('nodemailer');

const sendResetEmail = async (toEmail, resetToken) => {
  // Check if we have credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('--- EMAIL SIMULATION (No Credentials) ---');
    console.log(`To: ${toEmail}`);
    console.log(`Link: http://localhost:5173/reset-password?token=${resetToken}`);
    console.log('-----------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // For Gmail, use an "App Password"
    },
  });

  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Password Reset Request - Task Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">Password Reset</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your Task Manager account. Click the button below to set a new password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8rem; color: #999; text-align: center;">Task Manager Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send reset email');
  }
};

module.exports = { sendResetEmail };
