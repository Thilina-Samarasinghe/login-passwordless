import { SignJWT, jwtVerify } from 'jose';

const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error('[JWT] FATAL: ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is not set in environment variables.');
}

const ACCESS_SECRET = new TextEncoder().encode(accessSecret);
const REFRESH_SECRET = new TextEncoder().encode(refreshSecret);

console.log('[JWT] Module loaded - using env secrets (ACCESS len:', accessSecret.length, ', REFRESH len:', refreshSecret.length, ')');

export const signAccessToken = async (userId: string) => {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET);
};

export const signRefreshToken = async (userId: string) => {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);
  console.log('[JWT] Signed refresh token, length:', token.length);
  return token;
};

export const verifyAccessToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET, {
      algorithms: ['HS256'],
    });
    return payload as { userId: string };
  } catch (error: any) {
    console.error('[JWT] Access verify error:', error.message);
    return null;
  }
};

export const verifyRefreshToken = async (token: string) => {
  try {
    console.log('[JWT] Verifying refresh token, length:', token.length);
    const { payload } = await jwtVerify(token, REFRESH_SECRET, {
      algorithms: ['HS256'],
    });
    console.log('[JWT] ✅ Refresh token VALID');
    return payload as { userId: string };
  } catch (error: any) {
    console.error('[JWT] ❌ Refresh verify error:', error.message);
    return null;
  }
};
