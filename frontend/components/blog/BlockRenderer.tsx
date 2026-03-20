import Image from 'next/image';
import { Block } from '@/types';
import { ChevronDown } from 'lucide-react';

function Heading({ level, text }: { level?: number; text?: string }) {
  if (!text) return null;
  const Tag = (`h${Math.min(Math.max(level || 2, 1), 6)}`) as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const classes: Record<string, string> = {
    h1: 'text-3xl font-bold font-serif mt-8 mb-4',
    h2: 'text-2xl font-bold font-serif mt-8 mb-4 pb-2 border-b border-gray-100',
    h3: 'text-xl font-semibold font-serif mt-6 mb-3',
    h4: 'text-lg font-semibold mt-5 mb-2',
    h5: 'text-base font-semibold mt-4 mb-2',
    h6: 'text-sm font-semibold mt-4 mb-2',
  };
  return <Tag className={classes[Tag]}>{text}</Tag>;
}

function Paragraph({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mb-4 text-gray-700 leading-relaxed text-base">{text}</p>;
}

function List({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="mb-4 pl-6 list-disc space-y-1.5">
      {items.map((item, i) => <li key={i} className="text-gray-700 text-base">{item}</li>)}
    </ul>
  );
}

function Blockquote({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <blockquote className="border-l-4 border-brand-500 pl-5 py-1 italic text-ink-muted my-6 bg-brand-50 rounded-r-lg">
      <p className="text-base">{text}</p>
    </blockquote>
  );
}

function BlockImage({ src, alt, caption }: { src?: string; alt?: string; caption?: string }) {
  if (!src) return null;
  return (
    <figure className="my-6">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
        <Image src={src} alt={alt || ''} fill className="object-cover" loading="lazy" sizes="(max-width: 768px) 100vw, 700px" />
      </div>
      {caption && <figcaption className="text-center text-sm text-ink-muted mt-2 italic">{caption}</figcaption>}
    </figure>
  );
}

function Table({ headers, rows }: { headers?: string[]; rows?: string[][] }) {
  if (!headers && !rows) return null;
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse text-sm">
        {headers && (
          <thead>
            <tr className="bg-gray-50">
              {headers.map((h, i) => <th key={i} className="border border-gray-200 px-4 py-2.5 text-left font-semibold text-ink">{h}</th>)}
            </tr>
          </thead>
        )}
        {rows && (
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, j) => <td key={j} className="border border-gray-200 px-4 py-2 text-gray-700">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}

function YouTube({ videoId }: { videoId?: string }) {
  if (!videoId) return null;
  return (
    <div className="my-6 aspect-video rounded-xl overflow-hidden">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        loading="lazy"
      />
    </div>
  );
}

function FAQ({ question, answer }: { question?: string; answer?: string }) {
  if (!question || !answer) return null;
  return (
    <details className="my-4 border border-gray-200 rounded-xl overflow-hidden group">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-ink bg-gray-50 hover:bg-gray-100 transition-colors list-none">
        {question}
        <ChevronDown size={16} className="text-ink-muted group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-5 py-4 text-gray-700 text-sm leading-relaxed">{answer}</div>
    </details>
  );
}

function Callout({ text, variant = 'info' }: { text?: string; variant?: string }) {
  if (!text) return null;
  const styles: Record<string, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };
  return <div className={`my-4 border rounded-xl px-5 py-4 text-sm ${styles[variant] || styles.info}`}>{text}</div>;
}

function Code({ text, language }: { text?: string; language?: string }) {
  if (!text) return null;
  return (
    <div className="my-6">
      {language && <div className="bg-gray-700 text-gray-300 text-xs px-4 py-1.5 rounded-t-xl font-mono">{language}</div>}
      <pre className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm font-mono ${language ? 'rounded-b-xl' : 'rounded-xl'}`}>
        <code>{text}</code>
      </pre>
    </div>
  );
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks?.length) return null;
  return (
    <div className="prose-content">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': return <Heading key={i} level={block.level} text={block.text} />;
          case 'paragraph': return <Paragraph key={i} text={block.text} />;
          case 'list': return <List key={i} items={block.items} />;
          case 'blockquote': return <Blockquote key={i} text={block.text} />;
          case 'image': return <BlockImage key={i} src={block.src} alt={block.alt} caption={block.caption} />;
          case 'table': return <Table key={i} headers={block.headers} rows={block.rows} />;
          case 'youtube': return <YouTube key={i} videoId={block.videoId} />;
          case 'faq': return <FAQ key={i} question={block.question} answer={block.answer} />;
          case 'callout': return <Callout key={i} text={block.text} variant={block.variant} />;
          case 'code': return <Code key={i} text={block.text} language={block.language} />;
          default: return null;
        }
      })}
    </div>
  );
}
