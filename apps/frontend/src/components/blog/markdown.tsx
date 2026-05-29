import { cn } from '@twinspire/ui';
import * as React from 'react';

export interface MarkdownProps {
  body: string;
  className?: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const SLUG_RE = /[^a-z0-9]+/g;

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(SLUG_RE, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractToc(body: string): TocItem[] {
  const lines = body.split(/\r?\n/);
  const toc: TocItem[] = [];
  for (const line of lines) {
    const h2 = /^##\s+(.*)$/.exec(line);
    const h3 = /^###\s+(.*)$/.exec(line);
    if (h2) {
      toc.push({ id: slugifyHeading(h2[1] ?? ''), text: h2[1] ?? '', level: 2 });
    } else if (h3) {
      toc.push({ id: slugifyHeading(h3[1] ?? ''), text: h3[1] ?? '', level: 3 });
    }
  }
  return toc;
}

type Inline = { type: 'text'; value: string } | { type: 'bold' | 'italic' | 'code'; value: string };

function parseInline(input: string): Inline[] {
  const tokens: Inline[] = [];
  let remaining = input;
  const patterns: { type: Inline['type']; re: RegExp }[] = [
    { type: 'code', re: /`([^`]+)`/ },
    { type: 'bold', re: /\*\*([^*]+)\*\*/ },
    { type: 'italic', re: /\*([^*]+)\*/ },
  ];

  while (remaining.length > 0) {
    let earliest: { type: Inline['type']; match: RegExpExecArray } | null = null;
    for (const { type, re } of patterns) {
      const m = re.exec(remaining);
      if (m && (!earliest || m.index < earliest.match.index)) {
        earliest = { type, match: m };
      }
    }
    if (!earliest) {
      tokens.push({ type: 'text', value: remaining });
      break;
    }
    if (earliest.match.index > 0) {
      tokens.push({ type: 'text', value: remaining.slice(0, earliest.match.index) });
    }
    tokens.push({ type: earliest.type, value: earliest.match[1] ?? '' });
    remaining = remaining.slice(earliest.match.index + earliest.match[0].length);
  }
  return tokens;
}

function renderInline(input: string, keyPrefix: string): React.ReactNode[] {
  return parseInline(input).map((token, idx) => {
    const key = `${keyPrefix}-${idx}`;
    if (token.type === 'text') return <React.Fragment key={key}>{token.value}</React.Fragment>;
    if (token.type === 'bold') return <strong key={key}>{token.value}</strong>;
    if (token.type === 'italic') return <em key={key}>{token.value}</em>;
    return (
      <code
        key={key}
        className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.85em]"
      >
        {token.value}
      </code>
    );
  });
}

interface Block {
  kind: 'h2' | 'h3' | 'p' | 'ul' | 'quote';
  lines: string[];
}

function blockify(body: string): Block[] {
  const rawLines = body.split(/\r?\n/);
  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const raw of rawLines) {
    const line = raw.trim();
    const h2 = /^##\s+(.*)$/.exec(line);
    const h3 = /^###\s+(.*)$/.exec(line);
    const ul = /^[-*]\s+(.*)$/.exec(line);
    const quote = /^>\s+(.*)$/.exec(line);

    if (!line) {
      current = null;
      continue;
    }
    if (h2) {
      blocks.push({ kind: 'h2', lines: [h2[1] ?? ''] });
      current = null;
      continue;
    }
    if (h3) {
      blocks.push({ kind: 'h3', lines: [h3[1] ?? ''] });
      current = null;
      continue;
    }
    if (ul) {
      if (current?.kind === 'ul') {
        current.lines.push(ul[1] ?? '');
      } else {
        current = { kind: 'ul', lines: [ul[1] ?? ''] };
        blocks.push(current);
      }
      continue;
    }
    if (quote) {
      if (current?.kind === 'quote') {
        current.lines.push(quote[1] ?? '');
      } else {
        current = { kind: 'quote', lines: [quote[1] ?? ''] };
        blocks.push(current);
      }
      continue;
    }
    if (current?.kind === 'p') {
      current.lines.push(line);
    } else {
      current = { kind: 'p', lines: [line] };
      blocks.push(current);
    }
  }
  return blocks;
}

export function Markdown({ body, className }: MarkdownProps): React.JSX.Element {
  const blocks = blockify(body);
  return (
    <div className={cn('text-foreground/90 space-y-5 text-[0.95rem] leading-[1.75]', className)}>
      {blocks.map((block, idx) => {
        const key = `b-${idx}`;
        if (block.kind === 'h2') {
          const text = block.lines[0] ?? '';
          return (
            <h2
              key={key}
              id={slugifyHeading(text)}
              className="type-section-heading mt-12 scroll-mt-24 first:mt-0"
            >
              {renderInline(text, key)}
            </h2>
          );
        }
        if (block.kind === 'h3') {
          const text = block.lines[0] ?? '';
          return (
            <h3
              key={key}
              id={slugifyHeading(text)}
              className="font-display mt-8 scroll-mt-24 text-xl font-semibold tracking-tight"
            >
              {renderInline(text, key)}
            </h3>
          );
        }
        if (block.kind === 'ul') {
          return (
            <ul key={key} className="ml-5 list-disc space-y-1.5">
              {block.lines.map((line, i) => (
                <li key={`${key}-${i}`}>{renderInline(line, `${key}-${i}`)}</li>
              ))}
            </ul>
          );
        }
        if (block.kind === 'quote') {
          return (
            <blockquote
              key={key}
              className="border-primary/60 bg-primary/5 text-muted-foreground border-l-2 px-5 py-3 italic"
            >
              {block.lines.map((line, i) => (
                <p key={`${key}-${i}`}>{renderInline(line, `${key}-${i}`)}</p>
              ))}
            </blockquote>
          );
        }
        return (
          <p key={key}>
            {block.lines.map((line, i) => (
              <React.Fragment key={`${key}-${i}`}>
                {renderInline(line, `${key}-${i}`)}
                {i < block.lines.length - 1 ? <br /> : null}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
