const nodemailer = require('nodemailer');

const sendResetEmail = async (toEmail, resetToken) => {
  let transporter;

  // 1. If user provided credentials, use them
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // 2. AUTOMATIC MODE: Generate a temporary test account (Ethereal)
    console.log('No email credentials found. Generating a temporary test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`Temporary account created: ${testAccount.user}`);
  }

  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: '"Task Manager AI" <noreply@taskmanager.com>',
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

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('-----------------------------------------');
    console.log(`Email sent to: ${toEmail}`);
    
    // If using Ethereal, show the preview URL
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('VIEW YOUR SENT EMAIL HERE:');
      console.log(nodemailer.getTestMessageUrl(info));
      console.log('-----------------------------------------');
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendResetEmail };
