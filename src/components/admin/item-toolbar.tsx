'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { ActionResult } from '@/app/admin/actions';

/** Edit / move / delete buttons shown on an event or text box to board members. */
export function ItemToolbar({ label, onEdit, onMove, onDelete, first, last }: {
  label: string;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => Promise<ActionResult>;
  onDelete: () => Promise<ActionResult>;
  first: boolean;
  last: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const act = (task: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await task();
      if (!result.ok) alert(result.error);
      router.refresh();
    });

  return (
    <div className="item-toolbar" aria-label={`${label} controls`}>
      <button type="button" onClick={onEdit} disabled={pending}>Edit</button>
      <button type="button" onClick={() => act(() => onMove(-1))} disabled={pending || first} aria-label="Move earlier">↑</button>
      <button type="button" onClick={() => act(() => onMove(1))} disabled={pending || last} aria-label="Move later">↓</button>
      <button
        type="button"
        className="danger"
        disabled={pending}
        onClick={() => confirm(`Delete “${label}”? This can’t be undone.`) && act(onDelete)}
      >
        Delete
      </button>
    </div>
  );
}
