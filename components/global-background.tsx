'use client';

import { useEffect } from 'react';

const DEFAULT_COLOR = '#f8fafc';

function extractSettings() {
  try {
    const cached = window.localStorage.getItem('mdblog_settings');
    if (!cached) return { color: DEFAULT_COLOR, image: '' };
    const parsed = JSON.parse(cached);
    return {
      color: parsed?.globalBackgroundColor || DEFAULT_COLOR,
      image: parsed?.globalBackgroundImage || '',
    };
  } catch (error) {
    console.error('解析背景配置失败', error);
    return { color: DEFAULT_COLOR, image: '' };
  }
}

export function GlobalBackgroundSetter() {
  useEffect(() => {
    const apply = () => {
      const { color, image } = extractSettings();
      document.body.style.backgroundImage = image ? `url(${image})` : '';
      document.body.style.backgroundSize = image ? 'cover' : '';
      document.body.style.backgroundRepeat = image ? 'no-repeat' : '';
      document.body.style.backgroundAttachment = image ? 'fixed' : '';
      document.body.style.backgroundColor = color;
    };

    apply();

    const handler = () => apply();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return null;
}
