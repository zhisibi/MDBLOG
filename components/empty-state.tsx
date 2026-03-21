export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-3 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
