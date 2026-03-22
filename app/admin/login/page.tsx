import { AdminLoginForm } from '@/components/admin-login-form';
import { getSecuritySettings } from '@/lib/security';

export default async function AdminLoginPage() {
  const securitySettings = await getSecuritySettings();

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">Admin</p>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">后台登录</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            登录后可创建、编辑、删除 Markdown 文章。
          </p>
        </div>

        <AdminLoginForm totpEnabled={securitySettings.totpEnabled} />

        <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
          默认密码通过 <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">ADMIN_PASSWORD</code> 环境变量配置。
        </p>
      </div>
    </section>
  );
}
