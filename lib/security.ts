import { promises as fs } from 'fs';
import path from 'path';
import { TOTP } from '@otplib/totp';
import { OTP } from 'otplib';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'security-settings.json');
const ACCOUNT = process.env.ADMIN_TOTP_ACCOUNT || 'admin@mdb.local';
const ISSUER = process.env.ADMIN_TOTP_ISSUER || 'MDBLOG';

const otp = new OTP();

export interface SecuritySettings {
  totpEnabled: boolean;
  totpSecret?: string;
}

async function writeSettings(settings: SecuritySettings) {
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n', 'utf8');
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      totpEnabled: Boolean(parsed.totpEnabled),
      totpSecret: typeof parsed.totpSecret === 'string' ? parsed.totpSecret : undefined,
    };
  } catch (error) {
    return { totpEnabled: false };
  }
}

export async function updateSecuritySettings(update: Partial<SecuritySettings>) {
  const current = await getSecuritySettings();
  const next: SecuritySettings = {
    totpEnabled: update.totpEnabled ?? current.totpEnabled,
    totpSecret: update.totpSecret ?? current.totpSecret,
  };

  if (!next.totpEnabled) {
    delete next.totpSecret;
  }

  await writeSettings(next);
  return next;
}

export async function enableTotp(secret: string) {
  return updateSecuritySettings({ totpEnabled: true, totpSecret: secret });
}

export async function disableTotp() {
  return updateSecuritySettings({ totpEnabled: false });
}

export function generateTotpSecret() {
  return otp.generateSecret();
}

export function getTotpOtpAuthUrl(secret: string) {
  return otp.generateURI({ issuer: ISSUER, label: ACCOUNT, secret });
}

export function verifyTotpToken(secret: string, token: string) {
  const result = otp.verifySync({ secret, token });
  return result?.valid === true;
}
