import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { hashPassword, verifyPassword } from '@/lib/auth';

const ENV_CANDIDATES = ['.env.local', '.env'];
const HASH_KEY = 'ADMIN_PASSWORD_HASH';
const PLAIN_KEY = 'ADMIN_PASSWORD';

async function locateEnvFile() {
  for (const candidate of ENV_CANDIDATES) {
    const candidatePath = path.join(process.cwd(), candidate);
    try {
      await fs.access(candidatePath);
      return candidatePath;
    } catch {
      // continue to next candidate
    }
  }

  const fallbackPath = path.join(process.cwd(), ENV_CANDIDATES[0]);
  await fs.writeFile(fallbackPath, '', 'utf8');
  return fallbackPath;
}

async function persistPasswordHash(filePath: string, newHash: string) {
  let content = '';
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch {
    content = '';
  }

  const hashRegex = /^\s*ADMIN_PASSWORD_HASH\s*=/i;
  const plainRegex = /^\s*ADMIN_PASSWORD\s*=/i;
  const lines = content.split(/\r?\n/);
  const updatedLines: string[] = [];
  let hashReplaced = false;

  for (const line of lines) {
    if (hashRegex.test(line)) {
      updatedLines.push(`${HASH_KEY}=${newHash}`);
      hashReplaced = true;
      continue;
    }
    if (plainRegex.test(line)) {
      continue;
    }
    updatedLines.push(line);
  }

  if (!hashReplaced) {
    if (updatedLines.length && updatedLines[updatedLines.length - 1].trim() !== '') {
      updatedLines.push('');
    }
    updatedLines.push(`${HASH_KEY}=${newHash}`);
  }

  const collapsed = updatedLines.join('\n').replace(/(\r?\n){3,}/g, '\n\n');
  const finalContent = collapsed.endsWith('\n') || collapsed === '' ? collapsed : `${collapsed}\n`;
  await fs.writeFile(filePath, finalContent, 'utf8');
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch (err) {
    return NextResponse.json({ error: '请求必须是 JSON' }, { status: 400 });
  }

  const currentPassword = String(payload?.currentPassword ?? '').trim();
  const newPassword = String(payload?.newPassword ?? '');

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: '当前密码和新密码都必须填写' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: '新密码最少 8 位' }, { status: 400 });
  }

  if (!verifyPassword(currentPassword)) {
    return NextResponse.json({ error: '当前密码不正确' }, { status: 403 });
  }

  try {
    const newHash = hashPassword(newPassword);
    const targetFile = await locateEnvFile();
    await persistPasswordHash(targetFile, newHash);
    process.env.ADMIN_PASSWORD_HASH = newHash;
    delete process.env.ADMIN_PASSWORD;

    console.info('[admin/password] 更新密码 hash 写入', targetFile);

    return NextResponse.json({ message: '密码已更新，下一次登录即可使用新密码' });
  } catch (error) {
    console.error('[admin/password] 更新密码失败', error);
    return NextResponse.json({ error: '更新密码失败，请稍后重试' }, { status: 500 });
  }
}
