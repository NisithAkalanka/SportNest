const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log("--- 1. Attempting to send email ---");
  console.log("Recipient:", options.to);
  console.log("Subject:", options.subject);
  
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Adding full debug logging to see the entire communication with Gmail
    debug: true, 
    logger: true 
  });
  
  // Verify connection configuration (optional but very useful)
  try {
    await transporter.verify();
    console.log("--- 2. Nodemailer Transporter verified successfully! Ready to send emails. ---");
  } catch(error){
    console.error("--- 💥 2. Transporter Verification FAILED! 💥 ---");
    console.error("This means Nodemailer cannot connect to Gmail. Check your EMAIL_USER and EMAIL_PASS in the .env file.");
    console.error("Verification Error:", error);
    // Throw an error to stop the process if connection fails
    throw new Error("Email transporter verification failed.");
  }

  // 2. Define the email options
  const mailOptions = {
    from: `"SportNest Admin" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // 3. Send the email and get the result
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("--- 3. Email sent successfully! ---");
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info; // Return the success info
  } catch(error) {
      console.error("--- 💥 3. transporter.sendMail FAILED! 💥 ---");
      console.error("Even after successful connection, sending the email failed.");
      console.error("This could be a temporary Gmail issue or a problem with the recipient's address.");
      console.error("Sending Error:", error);
      throw error; // Re-throw the error so the controller can know it failed
  }
};

module.exports = sendEmail;