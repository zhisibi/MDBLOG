create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  cover_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz
);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, tag_id)
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create or replace trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;

create policy "Public can read categories"
on public.categories for select
using (true);

create policy "Public can read tags"
on public.tags for select
using (true);

create policy "Public can read published posts"
on public.posts for select
using (status = 'published');

create policy "Public can read post_tags"
on public.post_tags for select
using (true);

insert into public.categories (name, slug)
values
  ('前端开发', 'frontend'),
  ('后端开发', 'backend'),
  ('随笔', 'essay')
on conflict (slug) do nothing;

insert into public.tags (name, slug)
values
  ('Next.js', 'nextjs'),
  ('Tailwind CSS', 'tailwindcss'),
  ('Supabase', 'supabase'),
  ('Markdown', 'markdown')
on conflict (slug) do nothing;

insert into public.posts (title, slug, excerpt, content, status, category_id, published_at)
select
  '用 Next.js + Supabase 搭一个 Markdown 博客',
  'build-markdown-blog-with-nextjs-supabase',
  '从零搭建一个支持分类、标签与 Markdown 渲染的个人博客系统。',
  E'# 你好，MDBLOG\n\n这是你的第一篇文章。你可以直接在数据库里用 **Markdown** 编写内容，然后自动渲染成网页。\n\n## 这个博客支持什么？\n\n- Markdown 文章渲染\n- 分类和标签\n- 响应式布局\n- 基于 Supabase 存储内容\n\n```ts\nconst hello = "world";\nconsole.log(hello);\n```\n\n> 你现在可以开始写自己的博客了。',
  'published',
  (select id from public.categories where slug = 'frontend' limit 1),
  timezone('utc', now())
where not exists (
  select 1 from public.posts where slug = 'build-markdown-blog-with-nextjs-supabase'
);

insert into public.post_tags (post_id, tag_id)
select p.id, t.id
from public.posts p
cross join public.tags t
where p.slug = 'build-markdown-blog-with-nextjs-supabase'
  and t.slug in ('nextjs', 'tailwindcss', 'supabase', 'markdown')
on conflict do nothing;
