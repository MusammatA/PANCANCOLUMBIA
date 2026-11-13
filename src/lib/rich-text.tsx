import { Fragment, type ReactNode } from 'react';

/** Links may point to this site, the web, or an email address. */
export function isSafeUrl(url: string) {
  return /^(https?:\/\/[^\s]+|mailto:[^\s]+|\/(?!\/)[^\s]*)$/i.test(url.trim());
}

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const key = `${keyPrefix}-${i++}`;
    if (match[1] !== undefined) {
      nodes.push(<strong key={key}>{renderInline(match[1], key)}</strong>);
    } else if (isSafeUrl(match[3])) {
      const external = /^https?:/i.test(match[3]);
      nodes.push(
        <a key={key} href={match[3]} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {match[2]}
        </a>,
      );
    } else {
      nodes.push(match[2]);
    }
    last = start + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Plain text with **bold**, [link text](https://...) and line breaks. Never renders HTML. */
export function renderRich(text: string): ReactNode {
  return text.split('\n').map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {renderInline(line, String(i))}
    </Fragment>
  ));
}

/** Splits text into paragraphs on blank lines. */
export function renderParagraphs(text: string, className?: string): ReactNode {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map((p, i) => (
      <p key={i} className={className}>
        {renderRich(p)}
      </p>
    ));
}
