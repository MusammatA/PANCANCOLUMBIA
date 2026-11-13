import { getSiteData } from '@/lib/content';
import { renderRich } from '@/lib/rich-text';
import { EditableClient, LinkEditButton, type EditableTag } from './admin/text-editor';

/**
 * A piece of site text that board members can change. The children are the original wording,
 * used until someone edits it (and again after "Restore original").
 */
export async function Editable({ k, children, as = 'span', className, multiline = false }: {
  k: string; children: string; as?: EditableTag; className?: string; multiline?: boolean;
}) {
  const { texts, admin } = await getSiteData();
  const value = texts[k] ?? children;
  const content = renderRich(value);

  if (!admin) {
    const Tag = as;
    return <Tag className={className}>{content}</Tag>;
  }
  return (
    <EditableClient k={k} value={value} fallback={children} multiline={multiline} as={as} className={className}>
      {content}
    </EditableClient>
  );
}

/** Shows a "change link" control to signed-in board members only. */
export async function EditableHref({ k, fallback, label }: { k: string; fallback: string; label?: string }) {
  const { texts, admin } = await getSiteData();
  if (!admin) return null;
  return <LinkEditButton k={k} value={texts[k] ?? fallback} fallback={fallback} label={label} />;
}
