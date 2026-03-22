import { promises as fs } from 'fs';
import path from 'path';

const ENV_PATH = path.join(process.cwd(), '.env.local');
const LOG_PATH = path.join(process.cwd(), 'logs', 'password-update.log');

function normalizeEnvLines(content: string) {
  const lines = content.split(/\r?\n/);
  const updatedLines: string[] = [];
  let hashWritten = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('ADMIN_PASSWORD=')) {
      continue;
    }
    if (trimmed.startsWith('ADMIN_PASSWORD_HASH=')) {
      updatedLines.push(`ADMIN_PASSWORD_HASH=${trimmed.split('=')[1]}`);
      hashWritten = true;
      continue;
    }
    updatedLines.push(line);
  }

  return { lines: updatedLines, hashWritten };
}

export async function persistPasswordHash(hash: string) {
  let content = '';
  try {
    content = await fs.readFile(ENV_PATH, 'utf8');
  } catch (e) {
    content = '';
  }

  const { lines, hashWritten } = normalizeEnvLines(content);
  const resultLines = [...lines];

  if (hashWritten) {
    const index = resultLines.findIndex((line) => line.startsWith('ADMIN_PASSWORD_HASH='));
    resultLines[index] = `ADMIN_PASSWORD_HASH=${hash}`;
  } else {
    resultLines.push(`ADMIN_PASSWORD_HASH=${hash}`);
  }

  await fs.mkdir(path.dirname(ENV_PATH), { recursive: true });
  await fs.writeFile(ENV_PATH, resultLines.join('\n') + '\n', 'utf8');
}

export async function appendPasswordLog(source: 'api' | 'forgot' | 'reset') {
  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
  const entry = `${new Date().toISOString()} | password ${source} update\n`;
  await fs.appendFile(LOG_PATH, entry, 'utf8');
}
