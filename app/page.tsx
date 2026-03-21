import { EmptyState } from '@/components/empty-state';
import { HeroSection } from '@/components/hero-section';
import { HomePostsSection } from '@/components/home-posts-section';
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

      {posts.length ? (
        <HomePostsSection posts={posts} />
      ) : (
        <section id="latest-posts" className="mt-12">
          <EmptyState
            title="还没有已发布文章"
            description="先在 content/posts 里放一篇 Markdown 文章试试。"
          />
        </section>
      )}
    </div>
  );
}
