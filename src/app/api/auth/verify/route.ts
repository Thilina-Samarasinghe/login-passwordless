import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/services/auth.service';

export async function POST(request: Request) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json({ error: 'Missing token or email' }, { status: 400 });
    }

    // Capture metadata for session tracking
    const ua = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    const { accessToken, refreshToken, userId } = await AuthService.verifyMagicToken(email, token, { ua, ip });

    // Set refresh token cookie
    const cookieStore = await cookies();
    console.log('[VERIFY] Setting cookie, token length:', refreshToken.length);
    console.log('[VERIFY] Token start:', refreshToken.substring(0, 40));
    console.log('[VERIFY] Token end:', refreshToken.substring(refreshToken.length - 20));
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({ 
      accessToken, 
      user: { id: userId, email } 
    });

  } catch (error: any) {
    console.error('Verify error:', error);
    const status = error.message.includes('expired') || error.message.includes('Invalid') ? 401 : 500;
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status });
  }
}
