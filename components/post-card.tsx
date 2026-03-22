'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { PostRecord } from '@/lib/types';

export function PostCard({ post }: { post: PostRecord }) {
  const hasCover = Boolean(post.cover_image);
  const cardRef = useRef<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof window === 'undefined') return;

    const thresholds = Array.from({ length: 11 }, (_, index) => index / 10);
    let rafId: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const viewportHeight = window.innerHeight || entry.rootBounds?.height || 1;
        const cardCenter = entry.boundingClientRect.top + entry.boundingClientRect.height / 2;
        const viewportCenter = viewportHeight / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        const proximity = Math.max(0, 1 - distance / (viewportHeight / 2));
        const isDesktop = window.matchMedia('(min-width: 640px)').matches;
        const baseScale = isDesktop ? 0.05 : 0.2;
        const targetScale = entry.isIntersecting ? 1 + proximity * baseScale : 1;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(() => setScale(targetScale));
      },
      { threshold: thresholds }
    );

    observer.observe(node);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const combinedScale = hovered ? scale * 1.05 : scale;
  const translateY = hovered ? -4 : 0;

  return (
    <article
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group rounded-3xl border border-slate-200 bg-white p-0 shadow-sm transition duration-150 will-change-transform dark:border-slate-800 dark:bg-slate-900"
      style={{
        transform: `translateY(${translateY}px) scale(${combinedScale})`,
        transition: 'transform 150ms cubic-bezier(0.45, 0, 0.3, 1)',
      }}
    >
      <div className="relative mb-4 h-56 overflow-hidden rounded-3xl border-b border-slate-200 bg-slate-900 dark:border-slate-800">
        {hasCover ? (
          <img
            src={post.cover_image || ''}
            alt={`${post.title} 封面`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-6">
          <Link
            href={`/posts/${post.slug}`}
            className="text-3xl font-black leading-tight text-white drop-shadow-lg transition group-hover:text-brand-200"
          >
            {post.title}
          </Link>
        </div>
      </div>

      <div className="px-6 pb-2.5">
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-brand-200 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-700 dark:hover:text-brand-400"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
