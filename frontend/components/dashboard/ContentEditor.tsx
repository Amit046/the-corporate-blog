'use client';
import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { Block } from '@/types';

const BLOCK_TYPES = [
  { value: 'paragraph', label: '¶ Paragraph' },
  { value: 'heading', label: '# Heading' },
  { value: 'list', label: '• List' },
  { value: 'blockquote', label: '" Blockquote' },
  { value: 'image', label: '🖼 Image' },
  { value: 'table', label: '⊞ Table' },
  { value: 'youtube', label: '▶ YouTube' },
  { value: 'faq', label: '? FAQ' },
  { value: 'callout', label: '⚠ Callout' },
  { value: 'code', label: '</> Code' },
];

function BlockEditor({ block, onChange, onDelete, index }: {
  block: Block; onChange: (b: Block) => void; onDelete: () => void; index: number;
}) {
  const update = (fields: Partial<Block>) => onChange({ ...block, ...fields });

  return (
    <div className="group relative border border-gray-200 rounded-xl p-4 hover:border-brand-200 transition-colors bg-white">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={14} className="text-gray-300 cursor-grab" />
        </div>
        <div className="flex-1 space-y-3">
          {/* Type selector */}
          <div className="flex items-center gap-3">
            <select value={block.type} onChange={e => update({ type: e.target.value as Block['type'] })}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-gray-50">
              {BLOCK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {block.type === 'heading' && (
              <select value={block.level || 2} onChange={e => update({ level: Number(e.target.value) })}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-gray-50">
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>H{n}</option>)}
              </select>
            )}
            {block.type === 'callout' && (
              <select value={block.variant || 'info'} onChange={e => update({ variant: e.target.value as any })}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                {['info', 'warning', 'success', 'error'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            )}
          </div>

          {/* Fields by type */}
          {(block.type === 'paragraph' || block.type === 'heading' || block.type === 'blockquote' || block.type === 'callout') && (
            <textarea value={block.text || ''} onChange={e => update({ text: e.target.value })}
              placeholder={`Enter ${block.type} text...`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              rows={block.type === 'paragraph' ? 3 : 2} />
          )}

          {block.type === 'list' && (
            <div className="space-y-2">
              {(block.items || ['']).map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input value={item} onChange={e => {
                    const items = [...(block.items || [''])];
                    items[i] = e.target.value;
                    update({ items });
                  }} placeholder={`Item ${i + 1}`} className="input text-sm" />
                  <button onClick={() => {
                    const items = (block.items || ['']).filter((_, j) => j !== i);
                    update({ items: items.length ? items : [''] });
                  }} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => update({ items: [...(block.items || ['']), ''] })}
                className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                <Plus size={12} />Add item
              </button>
            </div>
          )}

          {block.type === 'image' && (
            <div className="space-y-2">
              <input value={block.src || ''} onChange={e => update({ src: e.target.value })} placeholder="Image URL (https://...)" className="input text-sm" />
              <input value={block.alt || ''} onChange={e => update({ alt: e.target.value })} placeholder="Alt text (required for SEO)" className="input text-sm" />
              <input value={block.caption || ''} onChange={e => update({ caption: e.target.value })} placeholder="Caption (optional)" className="input text-sm" />
            </div>
          )}

          {block.type === 'youtube' && (
            <input value={block.videoId || ''} onChange={e => update({ videoId: e.target.value })}
              placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" className="input text-sm" />
          )}

          {block.type === 'faq' && (
            <div className="space-y-2">
              <input value={block.question || ''} onChange={e => update({ question: e.target.value })} placeholder="Question" className="input text-sm" />
              <textarea value={block.answer || ''} onChange={e => update({ answer: e.target.value })} placeholder="Answer" className="input text-sm" rows={2} />
            </div>
          )}

          {block.type === 'code' && (
            <div className="space-y-2">
              <input value={block.language || ''} onChange={e => update({ language: e.target.value })} placeholder="Language (e.g. javascript)" className="input text-sm" />
              <textarea value={block.text || ''} onChange={e => update({ text: e.target.value })} placeholder="Paste your code here..." className="input text-sm font-mono" rows={5} />
            </div>
          )}

          {block.type === 'table' && (
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <input value={(block.headers || []).join(', ')} onChange={e => update({ headers: e.target.value.split(',').map(h => h.trim()) })}
                  placeholder="Column headers (comma-separated)" className="input text-sm flex-1" />
              </div>
              <textarea value={(block.rows || []).map(r => r.join(' | ')).join('\n')}
                onChange={e => update({ rows: e.target.value.split('\n').map(r => r.split('|').map(c => c.trim())) })}
                placeholder={"Row 1 col1 | col2 | col3\nRow 2 col1 | col2 | col3"}
                className="input text-sm font-mono" rows={4} />
              <p className="text-xs text-ink-muted">Separate columns with | and rows with new lines</p>
            </div>
          )}
        </div>

        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-1 mt-1">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

interface Props { value: Block[]; onChange: (blocks: Block[]) => void; }

export default function ContentEditor({ value, onChange }: Props) {
  const addBlock = (type: Block['type'] = 'paragraph') => {
    const newBlock: Block = { type, text: '', items: type === 'list' ? [''] : undefined };
    onChange([...value, newBlock]);
  };

  const updateBlock = (i: number, block: Block) => {
    const blocks = [...value];
    blocks[i] = block;
    onChange(blocks);
  };

  const deleteBlock = (i: number) => {
    onChange(value.filter((_, j) => j !== i));
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-ink-muted">
          <p className="font-serif mb-2">Your content starts here</p>
          <p className="text-sm">Add your first block below.</p>
        </div>
      )}

      {value.map((block, i) => (
        <BlockEditor key={i} block={block} index={i}
          onChange={b => updateBlock(i, b)}
          onDelete={() => deleteBlock(i)} />
      ))}

      <div className="flex flex-wrap gap-2 pt-2">
        {BLOCK_TYPES.map(t => (
          <button key={t.value} onClick={() => addBlock(t.value as Block['type'])}
            className="flex items-center gap-1 text-xs border border-gray-200 hover:border-brand-300 hover:text-brand-600 px-3 py-1.5 rounded-lg transition-colors text-ink-muted bg-white">
            <Plus size={11} />{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
