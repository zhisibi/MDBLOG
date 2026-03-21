import { PostCard } from '@/components/post-card';
import { EmptyState } from '@/components/empty-state';
import { HeroSection } from '@/components/hero-section';
import { getCategories, getPublishedPosts, getTags } from '@/lib/blog';

export default async function HomePage() {
  const [posts, categories, tags] = await Promise.all([
    getPublishedPosts(),
    getCategories(),
    getTags(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <HeroSection 
        postsCount={posts.length} 
        categoriesCount={categories.length} 
        tagsCount={tags.length} 
      />

      <section id="latest-posts" className="mt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              最新文章
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              支持 Markdown 自动渲染与结构化内容组织。
            </p>
          </div>
        </div>

        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="还没有已发布文章"
            description="先在 content/posts 里放一篇 Markdown 文章试试。"
          />
        )}
      </section>
    </div>
  );
}
