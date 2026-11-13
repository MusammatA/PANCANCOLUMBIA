'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';
import { saveText } from '@/app/admin/actions';
import { FormattingHint, Modal } from './modal';

type Props = { k: string; value: string; fallback: string; multiline: boolean; label?: string; onClose: () => void };

export function TextEditorModal({ k, value, fallback, multiline, label, onClose }: Props) {
  const router = useRouter();
  const [text, setText] = useState(value);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const isLink = k.endsWith('.url');
  const long = multiline || value.length > 70;

  const submit = (next: string | null) =>
    startTransition(async () => {
      setError('');
      const result = await saveText(k, next);
      if (!result.ok) return setError(result.error);
      router.refresh();
      onClose();
    });

  return (
    <Modal title={label ?? (isLink ? 'Edit link' : 'Edit text')} onClose={onClose}>
      <form
        className="admin-form"
        onSubmit={event => {
          event.preventDefault();
          submit(text);
        }}
      >
        {long ? (
          <textarea value={text} onChange={e => setText(e.target.value)} rows={Math.min(14, Math.max(4, Math.ceil(text.length / 70) + 2))} />
        ) : (
          <input type={isLink ? 'url' : 'text'} value={text} onChange={e => setText(e.target.value)} />
        )}
        {long && !isLink && <FormattingHint />}
        {isLink && <p className="field-hint">Starts with https://, mailto: or / for a page on this site.</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          {value !== fallback && (
            <button type="button" className="admin-button ghost" disabled={pending} onClick={() => submit(null)}>
              Restore original
            </button>
          )}
          <button type="button" className="admin-button ghost" onClick={onClose} disabled={pending}>Cancel</button>
          <button type="submit" className="admin-button" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

const TAGS = { h1: 'h1', h2: 'h2', h3: 'h3', p: 'p', span: 'span', dd: 'dd', div: 'div' } as const;
export type EditableTag = keyof typeof TAGS;

export function EditableClient({ k, value, fallback, multiline, as, className, children }: {
  k: string; value: string; fallback: string; multiline: boolean; as: EditableTag; className?: string; children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const Tag = TAGS[as];
  return (
    <Tag className={className ? `${className} editable` : 'editable'}>
      {children}
      <button
        type="button"
        className="edit-pencil"
        aria-label="Edit this text"
        title="Edit this text"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>
      </button>
      {open && <TextEditorModal k={k} value={value} fallback={fallback} multiline={multiline} onClose={() => setOpen(false)} />}
    </Tag>
  );
}

/** Admin-only button for changing where a button or link goes. */
export function LinkEditButton({ k, value, fallback, label = 'Edit link' }: { k: string; value: string; fallback: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="admin-chip" onClick={() => setOpen(true)}>{label}</button>
      {open && <TextEditorModal k={k} value={value} fallback={fallback} multiline={false} label={label} onClose={() => setOpen(false)} />}
    </>
  );
}
