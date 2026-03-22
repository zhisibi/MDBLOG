import type { NextRequest } from 'next/server';

type RequestWithHeaders = Request | NextRequest;

const BUCKETS = new Map<string, { count: number; resetAt: number }>();
const DEFAULT_WINDOW_MS = 60_000;

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  clientId: string;
}

export function getClientIdentifier(request: RequestWithHeaders) {
  const forwarded = request.headers.get?.('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return (
    request.headers.get?.('x-real-ip') || request.headers.get?.('cf-connecting-ip') || 'unknown'
  );
}

export function guardRateLimit(
  request: RequestWithHeaders,
  namespace: string,
  limit = 6,
  windowMs = DEFAULT_WINDOW_MS
): RateLimitStatus {
  const now = Date.now();
  const clientId = `${namespace}:${getClientIdentifier(request)}`;
  const bucket = BUCKETS.get(clientId);
  if (!bucket || now >= bucket.resetAt) {
    BUCKETS.set(clientId, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs, clientId };
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;
  return {
    allowed,
    remaining: allowed ? limit - bucket.count : 0,
    resetAt: bucket.resetAt,
    clientId,
  };
}
