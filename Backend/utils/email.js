const nodemailer = require('nodemailer');

// Build a transporter using either custom SMTP or Gmail fallback
const buildTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
  const port = Number(process.env.EMAIL_PORT || 587);
  const isDev = process.env.NODE_ENV !== 'production';

  if (host && user && pass) {
    const secure = port === 465; // 465 = SSL
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      logger: isDev,
      debug: isDev,
    });
  }

  if (user && pass) {
    // Gmail fallback (requires App Password for accounts with 2FA)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      logger: isDev,
      debug: isDev,
    });
  }

  throw new Error('Email config missing. Set EMAIL_HOST/EMAIL_PORT/EMAIL_USER/(EMAIL_PASS|EMAIL_PASSWORD) or EMAIL_USER/(EMAIL_PASS|EMAIL_PASSWORD).');
};

const sendEmail = async (options) => {
  const transporter = buildTransporter();

  // Try verifying connection (useful in dev); continue even if it fails
  try {
    await transporter.verify();
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Email transporter verified.');
    }
  } catch (err) {
    console.warn('⚠️  Email transporter verification failed (will attempt send):', err.message);
  }

  const mailOptions = {
    from: `"SportNest Admin" <${process.env.EMAIL_USER || ''}>`,
    to: options.to || options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email sent:', info.messageId);
      const preview = nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info);
      if (preview) console.log('🔗 Preview URL:', preview);
    }
    return info;
  } catch (error) {
    console.error('💥 Email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail;