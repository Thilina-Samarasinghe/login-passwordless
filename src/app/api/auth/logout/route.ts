import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/services/auth.service';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    // Clear the cookie
    cookieStore.delete('refreshToken');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
