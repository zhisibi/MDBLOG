import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ThemeProvider } from '@/components/theme-provider';
import { GlobalBackgroundSetter } from '@/components/global-background';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'MDBLOG | 个人博客系统',
    template: '%s | MDBLOG',
  },
  description: '一个基于 Next.js + Tailwind CSS + Markdown 的轻量博客系统，支持分类、标签、响应式设计。',
  keywords: ['博客', 'Blog', 'Markdown', 'Next.js', 'React', 'Tailwind CSS'],
  authors: [{ name: 'MDBLOG' }],
  creator: 'MDBLOG',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: baseUrl,
    siteName: 'MDBLOG',
    title: 'MDBLOG | 个人博客系统',
    description: '一个基于 Next.js + Tailwind CSS + Markdown 的轻量博客系统',
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: 'MDBLOG',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MDBLOG | 个人博客系统',
    description: '一个基于 Next.js + Tailwind CSS + Markdown 的轻量博客系统',
    images: [`${baseUrl}/og.png`],
  },
  alternates: {
    canonical: baseUrl,
    types: {
      'application/rss+xml': `${baseUrl}/rss.xml`,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="bg-slate-50 antialiased dark:bg-slate-950">
        <ThemeProvider>
          <GlobalBackgroundSetter />
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
