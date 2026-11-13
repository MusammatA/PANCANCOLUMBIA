'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteEvent, moveEvent, saveEvent, type EventInput } from '@/app/admin/actions';
import type { EventItem } from '@/lib/content';
import { ImageField } from './image-field';
import { ItemToolbar } from './item-toolbar';
import { Modal } from './modal';

const EMPTY: EventInput = { name: '', description: '', event_date: '', location: '', photo_url: '', is_upcoming: false };

function EventForm({ event, onClose }: { event: EventInput; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState(event);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof EventInput>(key: K, value: EventInput[K]) => setForm(current => ({ ...current, [key]: value }));

  return (
    <Modal title={event.id ? 'Edit event' : 'Add an event'} onClose={onClose} wide>
      <form
        className="admin-form"
        onSubmit={e => {
          e.preventDefault();
          startTransition(async () => {
            setError('');
            const result = await saveEvent(form);
            if (!result.ok) return setError(result.error);
            router.refresh();
            onClose();
          });
        }}
      >
        <label className="field">
          <span className="field-label">Event name</span>
          <input value={form.name} onChange={e => set('name', e.target.value)} required maxLength={120} />
        </label>
        <label className="field">
          <span className="field-label">Description</span>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} maxLength={2000} />
        </label>
        <div className="field-row">
          <label className="field">
            <span className="field-label">Date and time <small>(optional)</small></span>
            <input value={form.event_date} onChange={e => set('event_date', e.target.value)} placeholder="Friday, November 13, 2026 · 12–3 PM" maxLength={120} />
          </label>
          <label className="field">
            <span className="field-label">Location <small>(optional)</small></span>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Lerner Ramps" maxLength={160} />
          </label>
        </div>
        <ImageField value={form.photo_url} onChange={url => set('photo_url', url)} />
        <label className="check-field">
          <input type="checkbox" checked={form.is_upcoming} onChange={e => set('is_upcoming', e.target.checked)} />
          <span>
            <strong>Show as an upcoming event</strong>
            <small>Featured in the large box at the top of the Events page. Untick it once the event is over.</small>
          </span>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" className="admin-button ghost" onClick={onClose} disabled={pending}>Cancel</button>
          <button type="submit" className="admin-button" disabled={pending}>{pending ? 'Saving…' : event.id ? 'Save changes' : 'Add event'}</button>
        </div>
      </form>
    </Modal>
  );
}

export function AddEventButton({ upcoming = false, label = '+ Add an event' }: { upcoming?: boolean; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="admin-add" onClick={() => setOpen(true)}>{label}</button>
      {open && <EventForm event={{ ...EMPTY, is_upcoming: upcoming }} onClose={() => setOpen(false)} />}
    </>
  );
}

export function EventToolbar({ event, first, last }: { event: EventItem; first: boolean; last: boolean }) {
  const [open, setOpen] = useState(false);
  const isDefault = event.id.startsWith('default-');
  if (isDefault) return null;
  return (
    <>
      <ItemToolbar
        label={event.name}
        first={first}
        last={last}
        onEdit={() => setOpen(true)}
        onMove={direction => moveEvent(event.id, direction, event.is_upcoming)}
        onDelete={() => deleteEvent(event.id)}
      />
      {open && <EventForm event={event} onClose={() => setOpen(false)} />}
    </>
  );
}
