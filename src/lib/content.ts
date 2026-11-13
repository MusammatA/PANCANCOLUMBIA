import { cache } from 'react';
import { isSupabaseConfigured } from './supabase/config';
import { createClient } from './supabase/server';

export type Admin = { email: string; name: string };

export type EventItem = {
  id: string;
  name: string;
  description: string;
  event_date: string;
  location: string;
  photo_url: string;
  is_upcoming: boolean;
  sort_order: number;
};

export type BlockDesign = 'card' | 'purple' | 'lavender' | 'quote';
export const BLOCK_PAGES = ['home', 'events', 'join', 'contact'] as const;
export type BlockPage = (typeof BLOCK_PAGES)[number];

export type Block = {
  id: string;
  page: BlockPage;
  title: string;
  body: string;
  design: BlockDesign;
  image_url: string;
  button_label: string;
  button_url: string;
  sort_order: number;
};

/** Built-in events, shown until Supabase is connected. */
const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'default-upcoming',
    name: 'First Tabling Event',
    description:
      'Introducing Columbia 4 PanCAN through its first tabling event to a Columbia student audience. Come by Lerner Ramps for some yummy Purple PanCAN Ube cookies and to learn more about pancreatic cancer research.',
    event_date: 'Friday, November 13, 2026',
    location: 'Lerner Ramps',
    photo_url: '/images/events/awareness-tabling.webp',
    is_upcoming: true,
    sort_order: 0,
  },
  ...[
    ['Expert Networking Panels', 'Meet pancreatic cancer professionals in research and medicine.', 'professional-panels'],
    ['Patient & Family Panels', 'Hear from pancreatic cancer patients and their families.', 'patient-family-panels'],
    ['Monthly Meetings', 'Bringing together campus life each month.', 'chapter-meetings'],
    ['Awareness Tabling', 'Tabling on campus to raise awareness.', 'awareness-tabling'],
    ['Fundraisers', 'Fun fundraisers throughout the year.', 'fundraisers'],
  ].map(([name, description, photo], i) => ({
    id: `default-${photo}`,
    name,
    description,
    event_date: '',
    location: '',
    photo_url: `/images/events/${photo}.webp`,
    is_upcoming: false,
    sort_order: i + 1,
  })),
];

/** Edited text and the signed-in admin, loaded once per request. */
export const getSiteData = cache(async (): Promise<{ texts: Record<string, string>; admin: Admin | null }> => {
  if (!isSupabaseConfigured) return { texts: {}, admin: null };

  const supabase = await createClient();
  const [{ data: rows }, { data: userData }] = await Promise.all([
    supabase.from('site_text').select('key, value'),
    supabase.auth.getUser(),
  ]);

  const texts = Object.fromEntries((rows ?? []).map(({ key, value }) => [key, value]));
  const user = userData?.user;
  let admin: Admin | null = null;
  if (user?.email) {
    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (isAdmin) admin = { email: user.email, name: String(user.user_metadata?.name ?? '') };
  }
  return { texts, admin };
});

export async function getText(key: string, fallback: string) {
  const { texts } = await getSiteData();
  return texts[key] ?? fallback;
}

export const getEvents = cache(async (): Promise<EventItem[]> => {
  if (!isSupabaseConfigured) return DEFAULT_EVENTS;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('sort_order')
    .order('created_at');
  return error || !data ? DEFAULT_EVENTS : (data as EventItem[]);
});

export const getBlocks = cache(async (page: BlockPage): Promise<Block[]> => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('blocks')
    .select('*')
    .eq('page', page)
    .order('sort_order')
    .order('created_at');
  return (data ?? []) as Block[];
});
