export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type PostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  published_at: string | null;
  category: Category | null;
  tags: Tag[];
  fileName: string;
};
