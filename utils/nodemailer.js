const nodemailer = require("nodemailer");

async function sendVerificationEmail(email, verifyCode) {
  try {
    // Create transporter to connect with SMTP service
    const transporter = nodemailer.createTransport({
      service: "Gmail", // You can use other email services (e.g., Mailgun, SendGrid)
      auth: {
        user: "kumaracheles@gmail.com",
        pass: "rdjj kbin gbqx rxti",
      },
    });

    // HTML content of the verification email
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en" dir="ltr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .code {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .message {
              font-size: 18px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h2>Hello ${email},</h2>
          <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
          <p class="code">${verifyCode}</p>
          <p class="message">
            If you did not request this code, please ignore this email.
          </p>
        </body>
      </html>
    `;

    // Send the email
    const mailOptions = {
      from: "kumaracheles@gmail.com",
      to: email,
      subject: "Lelekart Verification Code",
      html: htmlContent,
    };

    const res = await transporter.sendMail(mailOptions);
    console.log(res);

    return { success: true, message: "Verification email sent successfully." };
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return { success: false, message: "Failed to send verification email." };
  }
}

// Example usage

module.exports = { sendVerificationEmail };
