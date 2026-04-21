import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password
  },
});

export const sendMagicLink = async (email: string, token: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const magicLink = `${baseUrl}/verify?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: `"Auth Service" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Magic Login Link',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Sign in to your account</h2>
        <p>Click the button below to log in. This link will expire in 15 minutes.</p>
        <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Sign In</a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">If you didn't request this email, you can safely ignore it.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">Or copy and paste this link into your browser: <br>${magicLink}</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
