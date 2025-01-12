import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expires,
      }
    });

    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.log(error);
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
