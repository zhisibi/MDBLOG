import Link from 'next/link';
import { getCategories, getPostsByCategory } from '@/lib/blog';
import { EmptyState } from '@/components/empty-state';

export default async function CategoriesPage() {
  const categories = await getCategories();

  if (!categories.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="暂无分类"
          description="给 Markdown 文章补上 category 后，这里会自动展示。"
        />
      </div>
    );
  }

  const items = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      posts: await getPostsByCategory(category.slug),
    }))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
        文章分类
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">按主题查看所有博客内容。</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{category.name}</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">共 {category.posts.length} 篇文章</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
