'use client';

export function DeleteButton({ slug, onDeleted }: { slug: string; onDeleted?: () => void }) {
  const handleDelete = async () => {
    if (!confirm('确定删除?')) return;
    
    const formData = new FormData();
    formData.append('slug', slug);
    
    try {
      await fetch('/api/admin/delete', {
        method: 'POST',
        body: formData
      });
      if (onDeleted) {
        onDeleted();
      } else {
        window.location.reload();
      }
    } catch (e) {
      alert('删除失败');
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded p-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
      title="删除"
    >
      🗑
    </button>
  );
}
