import { notFound } from 'next/navigation';
import { EmptyState } from '@/components/empty-state';
import { PostCard } from '@/components/post-card';
import { getCategories, getPostsByCategory } from '@/lib/blog';

const decodeParam = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// 移除 generateStaticParams，使用动态路由
export const dynamicParams = true;

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeParam(rawSlug);
  
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const posts = await getPostsByCategory(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
        {category.name}
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">这个分类下共有 {posts.length} 篇文章。</p>

      <div className="mt-10">
        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState title="这个分类还没有文章" description="可以先新增一篇已发布文章并绑定分类。" />
        )}
      </div>
    </div>
  );
}
