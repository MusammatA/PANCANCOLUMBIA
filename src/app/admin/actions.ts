'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { BLOCK_PAGES, type BlockDesign, type BlockPage } from '@/lib/content';
import { isSafeUrl } from '@/lib/rich-text';

export type ActionResult = { ok: true } | { ok: false; error: string };

const DESIGNS: BlockDesign[] = ['card', 'purple', 'lavender', 'quote'];

async function run(task: () => Promise<void>): Promise<ActionResult> {
  try {
    await task();
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Something went wrong. Please try again.' };
  }
}

function clean(value: unknown, max: number, label: string) {
  const text = typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : '';
  if (text.length > max) throw new Error(`${label} is too long (${max} characters max).`);
  return text;
}

function cleanUrl(value: unknown, label: string) {
  const url = clean(value, 2000, label);
  if (url && !isSafeUrl(url)) throw new Error(`${label} must start with https://, mailto: or /`);
  return url;
}

function check<T extends { error: { message: string } | null }>(result: T) {
  if (result.error) throw new Error(result.error.message);
  return result;
}

// ---------------------------------------------------------------------------
// Website text
// ---------------------------------------------------------------------------

/** Saves one piece of site text. Passing null puts the original wording back. */
export async function saveText(key: string, value: string | null): Promise<ActionResult> {
  return run(async () => {
    if (!/^[a-z0-9._-]{1,120}$/.test(key)) throw new Error('Unknown text field.');
    const { supabase } = await requireAdmin();
    if (value === null) {
      check(await supabase.from('site_text').delete().eq('key', key));
      return;
    }
    const text = key.endsWith('.url') ? cleanUrl(value, 'Link') : clean(value, 5000, 'Text');
    if (!text) throw new Error('Text can’t be empty. Use “Restore original” to undo your changes.');
    check(await supabase.from('site_text').upsert({ key, value: text, updated_at: new Date().toISOString() }));
  });
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type EventInput = {
  id?: string;
  name: string;
  description: string;
  event_date: string;
  location: string;
  photo_url: string;
  is_upcoming: boolean;
};

export async function saveEvent(input: EventInput): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const row = {
      name: clean(input.name, 120, 'Event name'),
      description: clean(input.description, 2000, 'Description'),
      event_date: clean(input.event_date, 120, 'Date'),
      location: clean(input.location, 160, 'Location'),
      photo_url: cleanUrl(input.photo_url, 'Photo'),
      is_upcoming: Boolean(input.is_upcoming),
    };
    if (!row.name) throw new Error('Please give the event a name.');

    if (input.id) {
      check(await supabase.from('events').update(row).eq('id', input.id));
    } else {
      // New events go to the top of their section.
      const { data } = await supabase.from('events').select('sort_order').order('sort_order').limit(1);
      check(await supabase.from('events').insert({ ...row, sort_order: (data?.[0]?.sort_order ?? 0) - 1 }));
    }
  });
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    check(await supabase.from('events').delete().eq('id', id));
  });
}

async function move(table: 'events' | 'blocks', id: string, direction: -1 | 1, scope?: { column: string; value: string | boolean }) {
  const { supabase } = await requireAdmin();
  let query = supabase.from(table).select('id').order('sort_order').order('created_at');
  if (scope) query = query.eq(scope.column, scope.value);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const ids = (data ?? []).map(row => row.id as string);
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  await Promise.all(ids.map((rowId, index) => supabase.from(table).update({ sort_order: index }).eq('id', rowId).then(check)));
}

export async function moveEvent(id: string, direction: -1 | 1, upcoming: boolean): Promise<ActionResult> {
  return run(() => move('events', id, direction, { column: 'is_upcoming', value: upcoming }));
}

// ---------------------------------------------------------------------------
// Text boxes
// ---------------------------------------------------------------------------

export type BlockInput = {
  id?: string;
  page: BlockPage;
  title: string;
  body: string;
  design: BlockDesign;
  image_url: string;
  button_label: string;
  button_url: string;
};

export async function saveBlock(input: BlockInput): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    if (!BLOCK_PAGES.includes(input.page)) throw new Error('Unknown page.');
    if (!DESIGNS.includes(input.design)) throw new Error('Please choose a design.');
    const row = {
      page: input.page,
      design: input.design,
      title: clean(input.title, 200, 'Title'),
      body: clean(input.body, 5000, 'Text'),
      image_url: cleanUrl(input.image_url, 'Photo'),
      button_label: clean(input.button_label, 60, 'Button text'),
      button_url: cleanUrl(input.button_url, 'Button link'),
    };
    if (!row.title && !row.body) throw new Error('Add a title or some text.');
    if (row.button_label && !row.button_url) throw new Error('Add a link for the button, or clear the button text.');

    if (input.id) {
      check(await supabase.from('blocks').update(row).eq('id', input.id));
    } else {
      const { data } = await supabase
        .from('blocks')
        .select('sort_order')
        .eq('page', row.page)
        .order('sort_order', { ascending: false })
        .limit(1);
      check(await supabase.from('blocks').insert({ ...row, sort_order: (data?.[0]?.sort_order ?? -1) + 1 }));
    }
  });
}

export async function deleteBlock(id: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    check(await supabase.from('blocks').delete().eq('id', id));
  });
}

export async function moveBlock(id: string, direction: -1 | 1, page: BlockPage): Promise<ActionResult> {
  return run(() => move('blocks', id, direction, { column: 'page', value: page }));
}

// ---------------------------------------------------------------------------
// Who can log in
// ---------------------------------------------------------------------------

export async function addAdmin(name: string, email: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const address = clean(email, 254, 'Email').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error('Please enter a valid email address.');
    const result = await supabase.from('admins').insert({ email: address, name: clean(name, 80, 'Name') });
    if (result.error?.code === '23505') throw new Error('That email is already on the list.');
    check(result);
  });
}

export async function removeAdmin(email: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase, user } = await requireAdmin();
    if (email.toLowerCase() === user.email?.toLowerCase()) throw new Error('You can’t remove yourself.');
    check(await supabase.from('admins').delete().eq('email', email.toLowerCase()));
  });
}
