import { promises as fs } from 'fs';
import path from 'path';

export interface BlogSettings {
  siteName: string;
  heroTitle: string;
  heroDescription: string;
  heroTextColor: string;
  heroBgColor: string;
  heroBgGradient: string;
  heroBadge: string;
  backgroundImage: string;
  globalBackgroundColor: string;
  globalBackgroundImage: string;
  postDisplayMode: 'card' | 'list';
  defaultCoverImage: string;
}

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'blog-settings.json');

export const defaultBlogSettings: BlogSettings = {
  siteName: 'MDBLOG',
  heroTitle: '一个简洁、现代、移动端友好的个人博客系统',
  heroDescription: '支持使用 Markdown 发布文章，自动渲染为完整网页，同时具备分类、标签、文章详情和归档浏览能力。',
  heroTextColor: '#ffffff',
  heroBgColor: '#0f172a',
  heroBgGradient: 'from-slate-900 via-slate-800 to-brand-900',
  heroBadge: 'Markdown · 响应式 · 暗黑模式',
  backgroundImage: '',
  globalBackgroundColor: '#f8fafc',
  globalBackgroundImage: '',
  postDisplayMode: 'card',
  defaultCoverImage: '',
};

async function readRawSettings(): Promise<Partial<BlogSettings>> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf8');
    return JSON.parse(raw) as Partial<BlogSettings>;
  } catch (error) {
    return {};
  }
}

export async function getBlogSettings(): Promise<BlogSettings> {
  const current = await readRawSettings();
  return { ...defaultBlogSettings, ...current };
}

export async function saveBlogSettings(update: Partial<BlogSettings>): Promise<BlogSettings> {
  const current = await getBlogSettings();
  const next: BlogSettings = { ...current, ...update };
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(next, null, 2) + '\n', 'utf8');
  return next;
}
