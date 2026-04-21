import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/services/auth.service';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const oldRefreshToken = cookieStore.get('refreshToken')?.value;

    let tokenToUse = oldRefreshToken;
    let source = "COOKIE";

    if (!tokenToUse) {
      try {
        const body = await request.clone().json();
        if (body.refreshToken) {
          tokenToUse = body.refreshToken;
          source = "BODY";
        }
      } catch (e) {}
    }

    if (!tokenToUse) {
      return NextResponse.json({ error: 'Refresh token missing' }, { status: 401 });
    }

    console.log(`Using Refresh Token from ${source} (length: ${tokenToUse.length})`);
    console.log('[REFRESH] Token start:', tokenToUse.substring(0, 40));
    console.log('[REFRESH] Token end:', tokenToUse.substring(tokenToUse.length - 20));

    const ua = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    const { accessToken, refreshToken: newRefreshToken, user } = await AuthService.refreshTokens(tokenToUse, { ua, ip });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // ROTATION: Update the refresh token cookie
    cookieStore.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({ accessToken, user });

  } catch (error: any) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: error.message || 'Refresh failed' }, { status: 401 });
  }
}
