const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Transporter 
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2) Email  define 
    const mailOptions = {
        from: 'SportNest Admin <admin@sportnest.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3) send Email 
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;