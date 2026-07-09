import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    // 1. Create a transporter
    let transporter;

    if (
      process.env.SMTP_USER &&
      process.env.SMTP_USER !== 'mock_email@gmail.com' &&
      process.env.SMTP_PASS &&
      process.env.SMTP_PASS !== 'mock_password'
    ) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Mock SMTP logging for development
      console.log('\n--- EMAIL SENT (MOCK DEVELOPMENT MODE) ---');
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body: ${options.html ? 'HTML content omitted' : options.message}`);
      console.log(`Content:\n${options.message || options.html}\n`);
      console.log('-------------------------------------------\n');
      return true;
    }

    // 2. Define email options
    const mailOptions = {
      from: process.env.SMTP_FROM || 'Youngo Subscription <noreply@youngo.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    // 3. Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Email sending failed, logging fallback:', error.message);
    // Silent fallback to console log for testing integrity
    return false;
  }
};

export default sendEmail;
