import prisma from '@/lib/prisma';
import { generateRawToken, hashToken, verifyHashedToken, hashLongToken, verifyLongToken } from '@/lib/token';
import { sendMagicLink } from '@/lib/email';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/jwt';

export class AuthService {
  /**
   * Request a magic link for an email
   */
  static async requestMagicLink(email: string) {
    const rawToken = generateRawToken();
    const hashedToken = await hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Cleanup existing tokens for this email
    await prisma.magicToken.deleteMany({ where: { email } });

    await prisma.magicToken.create({
      data: {
        email,
        token: hashedToken,
        expiresAt,
      },
    });

    await sendMagicLink(email, rawToken);
    return { success: true };
  }

  /**
   * Verify a magic token and return user + tokens
   */
  static async verifyMagicToken(email: string, rawToken: string, metadata: { ua?: string; ip?: string }) {
    const record = await prisma.magicToken.findFirst({ where: { email } });

    if (!record) throw new Error('Invalid or expired token');
    if (record.expiresAt < new Date()) {
      await prisma.magicToken.delete({ where: { id: record.id } });
      throw new Error('Token has expired');
    }

    const isValid = await verifyHashedToken(rawToken, record.token);
    if (!isValid) throw new Error('Invalid token');

    // Consume token
    await prisma.magicToken.delete({ where: { id: record.id } });

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email } });
    }

    // Issue tokens
    return await this.issueAuthTokens(user.id, metadata);
  }

  /**
   * Issue a new pair of Access and Refresh tokens (Initial Login)
   */
  static async issueAuthTokens(userId: string, metadata: { ua?: string; ip?: string }) {
    const accessToken = await signAccessToken(userId);
    const refreshToken = await signRefreshToken(userId);
    const hashedRefresh = hashLongToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // ENFORCE SESSION LIMIT (Max 2 sessions)
    const existingSessions = await prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (existingSessions.length >= 2) {
      // Remove the oldest session(s) until we have space for the new one
      const sessionsToDelete = existingSessions.length - 2 + 1; // +1 because we are about to add a new one
      const toDelete = existingSessions.slice(0, sessionsToDelete);
      
      for (const session of toDelete) {
        await prisma.refreshToken.delete({ where: { id: session.id } });
      }
    }

    await prisma.refreshToken.create({
      data: {
        userId,
        token: hashedRefresh,
        expiresAt,
        userAgent: metadata.ua,
        ipAddress: metadata.ip,
      },
    });

    return { accessToken, refreshToken, userId };
  }

  /**
   * Refresh Access Token + Rotate Refresh Token (Sliding Session)
   */
  static async refreshTokens(oldRefreshToken: string, metadata: { ua?: string; ip?: string }) {
    // Sanitize token (Postman sometimes adds double quotes or spaces to cookies)
    const sanitizedToken = oldRefreshToken.trim().replace(/^"|"$/g, '');
    
    const payload = await verifyRefreshToken(sanitizedToken);
    if (!payload) {
      console.error('JWT Verification failed for token:', sanitizedToken.substring(0, 20) + '...');
      throw new Error('Invalid refresh token signature');
    }

    const userTokens = await prisma.refreshToken.findMany({
      where: { userId: payload.userId },
    });

    let activeRecord = null;
    for (const record of userTokens) {
      if (verifyLongToken(sanitizedToken, record.token)) {
        activeRecord = record;
        break;
      }
    }

    if (!activeRecord || activeRecord.expiresAt < new Date()) {
      if (activeRecord) await prisma.refreshToken.delete({ where: { id: activeRecord.id } });
      throw new Error('Token expired or revoked');
    }

    // --- ROTATION LOGIC ---
    // 1. Delete the old refresh token record (One-time use)
    await prisma.refreshToken.delete({ where: { id: activeRecord.id } });

    // 2. Issue a NEW pair
    const accessToken = await signAccessToken(payload.userId);
    const newRefreshToken = await signRefreshToken(payload.userId);
    const hashedNewRefresh = hashLongToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        token: hashedNewRefresh,
        expiresAt,
        userAgent: metadata.ua || activeRecord.userAgent,
        ipAddress: metadata.ip || activeRecord.ipAddress,
      },
    });

    // 3. Fetch user to return profile info
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    return { 
      accessToken, 
      refreshToken: newRefreshToken,
      user: user ? { id: user.id, email: user.email } : null
    };
  }

  /**
   * Logout - Revoke a specific refresh token
   */
  static async logout(refreshToken: string) {
    const sanitizedToken = refreshToken.trim().replace(/^"|"$/g, '');
    const payload = await verifyRefreshToken(sanitizedToken);
    if (!payload) return;

    const userTokens = await prisma.refreshToken.findMany({
      where: { userId: payload.userId },
    });

    for (const record of userTokens) {
      if (verifyLongToken(sanitizedToken, record.token)) {
        await prisma.refreshToken.delete({ where: { id: record.id } });
        break;
      }
    }
  }
}
