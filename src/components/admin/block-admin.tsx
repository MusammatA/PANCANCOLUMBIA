'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteBlock, moveBlock, saveBlock, type BlockInput } from '@/app/admin/actions';
import type { Block, BlockDesign, BlockPage } from '@/lib/content';
import { ImageField } from './image-field';
import { ItemToolbar } from './item-toolbar';
import { FormattingHint, Modal } from './modal';

const DESIGNS: { value: BlockDesign; name: string; note: string }[] = [
  { value: 'card', name: 'White card', note: 'Purple top border, like “What is PanCAN?”' },
  { value: 'purple', name: 'Purple panel', note: 'White text on dark purple' },
  { value: 'lavender', name: 'Lavender band', note: 'Full-width soft purple section' },
  { value: 'quote', name: 'Highlight', note: 'Large text with a purple side bar' },
];

function BlockForm({ block, onClose }: { block: BlockInput; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState(block);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof BlockInput>(key: K, value: BlockInput[K]) => setForm(current => ({ ...current, [key]: value }));

  return (
    <Modal title={block.id ? 'Edit text box' : 'Add a text box'} onClose={onClose} wide>
      <form
        className="admin-form"
        onSubmit={e => {
          e.preventDefault();
          startTransition(async () => {
            setError('');
            const result = await saveBlock(form);
            if (!result.ok) return setError(result.error);
            router.refresh();
            onClose();
          });
        }}
      >
        <fieldset className="field">
          <legend className="field-label">Design</legend>
          <div className="design-picker">
            {DESIGNS.map(design => (
              <label key={design.value} className={`design-option${form.design === design.value ? ' selected' : ''}`}>
                <input type="radio" name="design" value={design.value} checked={form.design === design.value} onChange={() => set('design', design.value)} />
                <span className={`design-swatch swatch-${design.value}`} aria-hidden="true"><i /><i /><i /></span>
                <strong>{design.name}</strong>
                <small>{design.note}</small>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field">
          <span className="field-label">Title <small>(optional)</small></span>
          <input value={form.title} onChange={e => set('title', e.target.value)} maxLength={200} />
        </label>
        <label className="field">
          <span className="field-label">Text</span>
          <textarea value={form.body} onChange={e => set('body', e.target.value)} rows={6} maxLength={5000} />
          <FormattingHint />
        </label>
        <ImageField value={form.image_url} onChange={url => set('image_url', url)} label="Photo (optional)" />
        <div className="field-row">
          <label className="field">
            <span className="field-label">Button text <small>(optional)</small></span>
            <input value={form.button_label} onChange={e => set('button_label', e.target.value)} placeholder="Learn more" maxLength={60} />
          </label>
          <label className="field">
            <span className="field-label">Button link</span>
            <input value={form.button_url} onChange={e => set('button_url', e.target.value)} placeholder="https://…" />
          </label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" className="admin-button ghost" onClick={onClose} disabled={pending}>Cancel</button>
          <button type="submit" className="admin-button" disabled={pending}>{pending ? 'Saving…' : block.id ? 'Save changes' : 'Add text box'}</button>
        </div>
      </form>
    </Modal>
  );
}

export function AddBlockButton({ page }: { page: BlockPage }) {
  const [open, setOpen] = useState(false);
  const empty: BlockInput = { page, title: '', body: '', design: 'card', image_url: '', button_label: '', button_url: '' };
  return (
    <>
      <button type="button" className="admin-add" onClick={() => setOpen(true)}>+ Add a text box to this page</button>
      {open && <BlockForm block={empty} onClose={() => setOpen(false)} />}
    </>
  );
}

export function BlockToolbar({ block, first, last }: { block: Block; first: boolean; last: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ItemToolbar
        label={block.title || 'this text box'}
        first={first}
        last={last}
        onEdit={() => setOpen(true)}
        onMove={direction => moveBlock(block.id, direction, block.page)}
        onDelete={() => deleteBlock(block.id)}
      />
      {open && <BlockForm block={block} onClose={() => setOpen(false)} />}
    </>
  );
}
