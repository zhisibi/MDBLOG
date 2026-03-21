export function formatDate(date: string | null) {
  if (!date) return '未发布';

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function absoluteUrl(path: string) {
  return path.startsWith('http') ? path : `/${path.replace(/^\//, '')}`;
}

export function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const chineseCharsPerMinute = 400;

  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  const codeChars = (content.match(/`[\s\S]*?`|```[\s\S]*?```/g) || []).join('').length;

  const totalMinutes =
    chineseChars / chineseCharsPerMinute + englishWords / wordsPerMinute + codeChars / 600;

  return Math.max(1, Math.ceil(totalMinutes));
}
