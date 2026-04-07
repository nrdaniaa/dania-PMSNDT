// Test the exact verification email sending process
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.g7aerospace.com.my',
  port: 587,
  secure: false,
  auth: {
    user: 'rahman@g7aerospace.com.my',
    pass: 'G7aerospace123@@'
  }
});

async function testVerificationEmail() {
  try {
    const testToken = 'test-verification-token-12345';
    const verifyUrl = `http://localhost:3000/api/auth/verify-email?token=${encodeURIComponent(testToken)}`;
    
    console.log('Sending verification email...');
    console.log('To:', 'rahman@g7aerospace.com.my');
    console.log('Verification URL:', verifyUrl);
    
    const info = await transporter.sendMail({
      from: 'Admin PMS NDT <rahman@g7aerospace.com.my>',
      to: 'rahman@g7aerospace.com.my',
      subject: 'Please verify your email - NDT System',
      text: `Please verify your account by visiting: ${verifyUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification Required</h2>
          <p>Thank you for registering with the NDT System. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${verifyUrl}</p>
          <p><small>This verification link will expire in 24 hours.</small></p>
        </div>
      `,
    });

    console.log('✅ Verification email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📋 Server Response:', info.response);
    console.log('\n🔍 Email Details:');
    console.log('   From:', 'Admin PMS NDT <rahman@g7aerospace.com.my>');
    console.log('   To:', 'rahman@g7aerospace.com.my');
    console.log('   Subject:', 'Please verify your email - NDT System');
    
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    console.error('Error details:', error);
  }
}

testVerificationEmail();