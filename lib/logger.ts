import { promises as fs } from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const SECURITY_LOG = path.join(LOG_DIR, 'security-events.log');

function safeString(value: string) {
  return value.replace(/\s+/g, ' ').slice(0, 450);
}

async function ensureLogDir() {
  await fs.mkdir(LOG_DIR, { recursive: true });
}

export async function logSecurityEvent(event: string, details: Record<string, string | number | boolean>) {
  await ensureLogDir();
  const detailString = Object.entries(details)
    .map(([key, value]) => `${key}=${safeString(String(value))}`)
    .join(' ');
  const entry = `${new Date().toISOString()} | ${event} | ${detailString}\n`;
  await fs.appendFile(SECURITY_LOG, entry, 'utf8');
}
