require('dotenv').config();
const { sendResetEmail } = require('./src/emailService');

const testEmail = async () => {
  console.log('--- Email Configuration Test ---');
  console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'gmail');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '******** (Hidden for security)' : 'MISSING');
  console.log('--------------------------------');

  try {
    await sendResetEmail(process.env.EMAIL_USER, 'test-token-123');
    console.log('SUCCESS! The test email should be in your inbox.');
  } catch (error) {
    console.error('FAILED! Here is the exact error from the email provider:');
    console.error(error.message);
    console.log('\nCommon Fixes:');
    console.log('1. If using Gmail, ensure you use an "App Password", not your normal password.');
    console.log('2. Ensure "2-Step Verification" is ON in your Google Account.');
  }
};

testEmail();
