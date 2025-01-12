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

export async function sendVerificationEmail(email, token) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your email',
    html: `
      <h1>Verify your email address</h1>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}">Verify Email</a>
    `,
  });
}

export async function send2FACode(email, code) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '2FA Code',
    html: `
      <h1>Your 2FA Code</h1>
      <p>Your verification code is: ${code}</p>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
}

export async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  console.log(resetLink);
  
 

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your password',
    text: `Click the link below to reset your password: ${resetLink}`,
    html:`<P>haahahahahah<a href="${resetLink}"> here </a> ajsklansjhka jfbjhs fghukejfhweuihukb </P>`,
  });
  
  
}
