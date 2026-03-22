import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'crypto';

const AUTH_COOKIE = 'mdblog_admin_session';

export function hashPassword(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function getPasswordHash() {
  const plain = process.env.ADMIN_PASSWORD;
  const hashed = process.env.ADMIN_PASSWORD_HASH;

  if (hashed) return hashed;
  if (plain) return hashPassword(plain);

  return hashPassword('admin123456');
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'mdblog-dev-session-secret';
}

function signSession() {
  return hashPassword(`${getSessionSecret()}:logged-in`);
}

export function verifyPassword(input: string) {
  const expected = Buffer.from(getPasswordHash());
  const actual = Buffer.from(hashPassword(input));

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === signSession();
}

export async function createSession() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, signSession(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}
