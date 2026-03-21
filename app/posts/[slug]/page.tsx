import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { TableOfContents } from '@/components/toc';
import { getPostBySlug, getPublishedPosts } from '@/lib/blog';
import { formatDate, estimateReadTime } from '@/lib/utils';

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: '文章不存在' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      authors: ['MDBLOG'],
      tags: post.tags.map((t) => t.name),
    },
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const readTime = estimateReadTime(post.content);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_220px]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>{formatDate(post.published_at)}</span>
            <span>·</span>
            <span>{readTime} 分钟阅读</span>
            {post.category ? (
              <Link
                href={`/categories/${post.category.slug}`}
                className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-600 dark:bg-brand-950 dark:text-brand-400"
              >
                {post.category.name}
              </Link>
            ) : null}
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{post.excerpt}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-brand-200 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-800 dark:hover:text-brand-400"
              >
                #{tag.name}
              </Link>
            ))}
          </div>

          <hr className="my-8 border-slate-200 dark:border-slate-800" />

          <div className="mt-6">
            <MarkdownRenderer content={post.content} />
          </div>
        </article>

        <TableOfContents content={post.content} />
      </div>

      <nav className="mt-12 flex justify-center">
        <Link
          href="/"
          className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ← 返回首页
        </Link>
      </nav>
    </div>
  );
}
