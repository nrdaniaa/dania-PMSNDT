const nodemailer = require('nodemailer');

// Use the same configuration as your .env file
const transporter = nodemailer.createTransport({
  host: 'mail.g7aerospace.com.my',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'rahman@g7aerospace.com.my',
    pass: 'G7aerospace123@@'
  }
});

async function testEmailSending() {
  try {
    console.log('Testing email sending...');
    
    const info = await transporter.sendMail({
      from: 'Admin PMS NDT <rahman@g7aerospace.com.my>',
      to: 'rahman@g7aerospace.com.my', // Send to the same email to test
      subject: 'Test Email - NDT System',
      text: 'This is a test email to verify SMTP configuration',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Test Email</h2>
          <p>This is a test email to verify that the SMTP configuration is working correctly.</p>
          <p>If you receive this, the email system is working!</p>
        </div>
      `,
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('Failed to send email:', error.message);
    console.error('Error details:', error);
  }
}

testEmailSending();