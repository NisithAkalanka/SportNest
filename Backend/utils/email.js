const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        console.log('Attempting to send email to:', options.to);
        console.log('Email subject:', options.subject);
        
        // Check if email configuration is available
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('Email configuration missing. Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in .env file');
            console.log('Using Gmail SMTP as fallback...');
            
            // Fallback to Gmail SMTP
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || 'your-email@gmail.com',
                    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
                }
            });
            
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: options.to || options.email,
                subject: options.subject,
                text: options.message,
                html: options.html
            };
            
            const result = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return result;
        }
        
        // 1) Transporter with custom SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // 2) Email options
        const mailOptions = {
            from: `SportNest Admin <${process.env.EMAIL_USER}>`,
            to: options.to || options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        // 3) Send email
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return result;
        
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

module.exports = sendEmail;