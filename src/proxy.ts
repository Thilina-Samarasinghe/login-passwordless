import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret-key';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API routes that need authentication via Bearer token
  if (pathname.startsWith('/api/protected')) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/protected/:path*'],
};

