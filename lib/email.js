import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, 
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendVerificationCode(email, code, type) {
  let subject, html;
  if (type === '2fa') {
    subject = '2FA Verification Code';
    html = `
      <h1>Your 2FA Verification Code</h1>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;
  } else {
    subject = 'Email Verification Code';
    html = `
      <h1>Verify your email address</h1>
      <p>Your email verification code is: <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html,
  });
}

export async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your password',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    `,
  });
}

export async function sendWelcomeEmail(email, name) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Our Platform',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
    `,
  });
}

export async function contactSupport(name, email, userRole, subject, message) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to yourself
    subject: `Contact Form: ${subject}`,
    html: `
      <h1>New Contact Form Submission</h1>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>User Role:</strong> ${userRole}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <h2>Message:</h2>
      <p>${message}</p>
    `,
  });
}