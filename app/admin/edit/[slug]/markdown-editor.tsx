'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MarkdownRenderer } from '@/components/markdown-renderer';

export function MarkdownEditor({ initialValue }: { initialValue: string }) {
  const [content, setContent] = useState(initialValue);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 实时预览
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewHtml(content);
    }, 300);
    return () => clearTimeout(timer);
  }, [content]);

  // 同步内容到隐藏的表单字段
  useEffect(() => {
    const hiddenBody = document.querySelector('input[name="body"]') as HTMLInputElement;
    if (hiddenBody) {
      hiddenBody.value = content;
    }
  }, [content]);

  // 插入 Markdown 语法
  const insertSyntax = useCallback((prefix: string, suffix: string = prefix, placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  }, [content]);

  // 快捷键处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;

    const key = e.key.toLowerCase();

    switch (key) {
      case 'b':
        e.preventDefault();
        insertSyntax('**', '**', '粗体');
        break;
      case 'i':
        e.preventDefault();
        insertSyntax('*', '*', '斜体');
        break;
      case 'k':
        e.preventDefault();
        insertSyntax('[', '](url)', '链接文字');
        break;
      case '`':
        e.preventDefault();
        insertSyntax('`', '`', '代码');
        break;
      case 's':
        e.preventDefault();
        const form = textareaRef.current?.closest('form');
        form?.requestSubmit();
        break;
    }
  }, [insertSyntax]);

  // 工具栏按钮
  const ToolbarButton = ({ onClick, title, children, active = false }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active 
          ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' 
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-3">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton onClick={() => insertSyntax('**', '**', '粗体')} title="Ctrl+B">
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton onClick={() => insertSyntax('*', '*', '斜体')} title="Ctrl+I">
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton onClick={() => insertSyntax('~~', '~~', '删除线')} title="删除线">
            <s>S</s>
          </ToolbarButton>
          <div className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <ToolbarButton onClick={() => insertSyntax('### ', '', '标题')} title="三级标题">
            H3
          </ToolbarButton>
          <ToolbarButton onClick={() => insertSyntax('## ', '', '标题')} title="二级标题">
            H2
          </ToolbarButton>
          <ToolbarButton onClick={() => insertSyntax('# ', '', '标题')} title="一级标题">
            H1
          </ToolbarButton>
          <div className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <ToolbarButton onClick={() => insertSyntax('- ', '', '列表项')} title="无序列表">
            • 列表
          </ToolbarButton>
          <ToolbarButton onClick={() => insertSyntax('1. ', '', '列表项')} title="有序列表">
            1. 列表
          </ToolbarButton>
          <ToolbarButton onClick={() => insertSyntax('> ', '', '引用')} title="引用">
            &gt; 引用
          </ToolbarButton>
          <div className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <ToolbarButton onClick={() => insertSyntax('`', '`', '代码')} title="Ctrl+`">
            {'</>'}
          </ToolbarButton>
          <ToolbarButton onClick={() => insertSyntax('```\n', '\n```', '代码块')} title="代码块">
            {'{ }'}
          </ToolbarButton>
          <ToolbarButton onClick={() => insertSyntax('[', '](url)', '链接')} title="Ctrl+K">
            🔗
          </ToolbarButton>
          <ToolbarButton onClick={() => insertSyntax('![alt](', ')', '图片URL')} title="图片">
            🖼️
          </ToolbarButton>
          <div className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <ToolbarButton onClick={() => insertSyntax('---\n', '', '')} title="分割线">
            —
          </ToolbarButton>
        </div>

        {/* 模式切换 */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-200 p-1 dark:bg-slate-700">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              mode === 'edit' 
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            编辑
          </button>
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              mode === 'split' 
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            分栏
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              mode === 'preview' 
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            预览
          </button>
        </div>
      </div>

      {/* 编辑器和预览 */}
      <div className={`grid gap-4 ${mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* 编辑区 */}
        {(mode === 'edit' || mode === 'split') && (
          <div className={`space-y-2 ${mode === 'split' ? '' : 'col-span-1'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Markdown 编辑</span>
              <span className="text-xs text-slate-500">{content.length} 字符</span>
            </div>
            <textarea
              ref={textareaRef}
              name="body"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={24}
              className="min-h-[600px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm leading-7 text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
              required
            />
          </div>
        )}

        {/* 预览区 */}
        {(mode === 'preview' || mode === 'split') && (
          <div className={`space-y-2 ${mode === 'split' ? '' : 'col-span-1'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">实时预览</span>
              <span className="text-xs text-slate-500">自动同步</span>
            </div>
            <div className="min-h-[600px] overflow-auto rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              {previewHtml ? (
                <MarkdownRenderer content={previewHtml} />
              ) : (
                <p className="text-slate-400 dark:text-slate-500">预览区域...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
