import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const generateRawToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = async (token: string) => {
  return await bcrypt.hash(token, SALT_ROUNDS);
};

export const verifyHashedToken = async (rawToken: string, hashedToken: string) => {
  return await bcrypt.compare(rawToken, hashedToken);
};

/**
 * For long tokens (like JWTs) that exceed bcrypt's 72-character limit.
 */
export const hashLongToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const verifyLongToken = (rawToken: string, hashedLongToken: string) => {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return hash === hashedLongToken;
};
