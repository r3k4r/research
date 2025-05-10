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

export async function sendProviderApplicationEmail(data) {
  const {
    fullName,
    email,
    phone,
    businessName,
    businessType,
    businessYears,
    foodTypes,
    reason
  } = data;
  
  const currentDate = new Date().toLocaleDateString();
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to admin email
    subject: `New Food Provider Application: ${businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">New Food Provider Application</h1>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Date Submitted:</strong> ${currentDate}</p>
          <p><strong>Contact Person:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Business Name:</strong> ${businessName}</p>
          <p><strong>Business Type:</strong> ${businessType}</p>
          <p><strong>Years in Business:</strong> ${businessYears}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h2 style="color: #4f46e5;">Types of Food Offered</h2>
          <p style="white-space: pre-line;">${foodTypes}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h2 style="color: #4f46e5;">Reason for Joining</h2>
          <p style="white-space: pre-line;">${reason}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p><strong>Action Required:</strong> Please review this application and contact the business to proceed with onboarding or request additional information.</p>
        </div>
      </div>
    `,
    replyTo: email, // Allow direct reply to the applicant
  });
  
  // Also send a confirmation email to the provider
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Application Received - Thank You for Applying to Second Serve',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">Thank You for Your Application</h1>
        
        <p>Dear ${fullName},</p>
        
        <p>Thank you for applying to join Second Serve as a food provider. We're excited about the possibility of partnering with ${businessName} to help reduce food waste while offering great deals to customers.</p>
        
        <p>Here's what happens next:</p>
        <ol>
          <li>Our team will review your application (typically within 3-5 business days)</li>
          <li>We may contact you for additional information or to schedule a brief call</li>
          <li>Once approved, we'll send you onboarding instructions and details on how to start listing your surplus food items</li>
        </ol>
        
        <p>If you have any questions in the meantime, feel free to reply to this email.</p>
        
        <div style="margin-top: 30px;">
          <p>Best regards,</p>
          <p><strong>The Second Serve Team</strong></p>
        </div>
      </div>
    `,
  });
}