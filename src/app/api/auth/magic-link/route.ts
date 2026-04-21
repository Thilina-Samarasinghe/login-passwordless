import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await AuthService.requestMagicLink(email);

    return NextResponse.json({ message: 'Magic link sent successfully' });
  } catch (error: any) {
    console.error('Magic link error:', error);
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
  }
}
