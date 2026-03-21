import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-custom dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ]}
        components={{
          pre({ children, ...props }) {
            return (
              <pre
                className="not-prose my-6 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-slate-50"
                {...props}
              >
                {children}
              </pre>
            );
          },
          code({ children, className, ...props }) {
            const lang = (className ?? '').replace('language-', '').split(' ')[0];
            const isInline = !className;

            if (isInline) {
              return (
                <code
                  className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code
                className={`language-${lang} block font-mono text-sm leading-relaxed`}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
