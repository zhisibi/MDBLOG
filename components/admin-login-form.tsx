'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '@/lib/admin';

const initialState = { error: '' };

interface AdminLoginFormProps {
  totpEnabled: boolean;
}

export function AdminLoginForm({ totpEnabled }: AdminLoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showReset, setShowReset] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetPending, setResetPending] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetMessage(null);

    if (!resetToken.trim() || !resetPassword.trim() || !resetConfirm.trim()) {
      setResetMessage({ type: 'error', text: '请输入验证码和新密码' });
      return;
    }

    if (resetPassword !== resetConfirm) {
      setResetMessage({ type: 'error', text: '两次输入的新密码不一致' });
      return;
    }

    if (resetPassword.length < 8) {
      setResetMessage({ type: 'error', text: '新密码需要至少 8 位' });
      return;
    }

    setResetPending(true);
    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), newPassword: resetPassword, confirmPassword: resetConfirm }),
      });
      const payload = await response.json().catch(() => ({} as Record<string, string>));

      if (!response.ok) {
        throw new Error(payload.error || '密码重置失败');
      }

      setResetMessage({ type: 'success', text: payload.message || '密码已重置，请使用新密码登录' });
      setResetToken('');
      setResetPassword('');
      setResetConfirm('');
      setShowReset(false);
    } catch (error) {
      setResetMessage({ type: 'error', text: error instanceof Error ? error.message : '密码重置失败' });
    } finally {
      setResetPending(false);
    }
  };

  return (
    <>
      <form action={formAction} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">管理员密码</span>
          <input
            name="password"
            type="password"
            placeholder="请输入管理员密码"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
            required
          />
        </label>

        {totpEnabled && (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">二步验证验证码</span>
            <input
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6位验证码"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">登录时会向 Authenticator / OTP app 请求 6 位动态码。</p>
          </label>
        )}

        {state.error ? (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          {pending ? '登录中...' : '登录后台'}
        </button>
      </form>

      {totpEnabled && (
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => setShowReset((prev) => !prev)}
            className="text-xs font-medium text-brand-600 hover:text-brand-500"
          >
            {showReset ? '取消忘记密码' : '忘记密码？'}
          </button>
          {showReset && (
            <form onSubmit={handleForgotPassword} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                输入二步验证码和新密码即可重置，无需旧密码。
              </p>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">6位验证码</span>
                <input
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">新密码</span>
                <input
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">重复新密码</span>
                <input
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </label>
              {resetMessage && (
                <p
                  className={`rounded-lg px-3 py-2 text-xs font-medium ${
                    resetMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100'
                      : 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-200'
                  }`}
                >
                  {resetMessage.text}
                </p>
              )}
              <button
                type="submit"
                disabled={resetPending}
                className="w-full rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {resetPending ? '处理中...' : '发送验证码重置'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
