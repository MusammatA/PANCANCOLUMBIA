'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

/** How long a code stays valid. Match "Email OTP Expiration" (seconds) in Supabase Auth settings. */
const CODE_LIFETIME_SECONDS = 120;
const PENDING_COOKIE = 'pancan_login';

type Pending = { email: string; name: string; sentAt: number };

export type RequestCodeResult = { ok: true; expiresAt: number } | { ok: false; error: string };
export type VerifyCodeResult = { ok: true } | { ok: false; error: string; expired?: boolean };

const NOT_READY = 'Board login isn’t set up yet.';

export async function requestCode(nameInput: string, emailInput: string): Promise<RequestCodeResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_READY };

  const name = nameInput.trim().slice(0, 80);
  const email = emailInput.trim().toLowerCase();
  if (!name) return { ok: false, error: 'Please enter your name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  const supabase = await createClient();
  const { data: allowed, error: lookupError } = await supabase.rpc('is_board_email', { check_email: email });
  if (lookupError) return { ok: false, error: 'Login isn’t available right now. Please try again later.' };
  if (!allowed) {
    return { ok: false, error: 'This email isn’t on the board list. Ask a board member to add you from the admin page.' };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, data: { name } },
  });
  if (error) {
    return {
      ok: false,
      error:
        error.status === 429
          ? 'Too many code requests. Please wait a minute, then try again.'
          : 'We couldn’t send the code. Please try again.',
    };
  }

  const sentAt = Date.now();
  const pending: Pending = { email, name, sentAt };
  (await cookies()).set(PENDING_COOKIE, JSON.stringify(pending), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CODE_LIFETIME_SECONDS,
  });
  return { ok: true, expiresAt: sentAt + CODE_LIFETIME_SECONDS * 1000 };
}

export async function verifyCode(codeInput: string): Promise<VerifyCodeResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_READY };

  const cookieStore = await cookies();
  let pending: Pending | null = null;
  try {
    pending = JSON.parse(cookieStore.get(PENDING_COOKIE)?.value ?? 'null');
  } catch {
    pending = null;
  }
  if (!pending || Date.now() - pending.sentAt > CODE_LIFETIME_SECONDS * 1000) {
    return { ok: false, expired: true, error: 'This code has expired. Please send yourself a new one.' };
  }

  const code = codeInput.replace(/\s/g, '');
  if (!/^\d{6,10}$/.test(code)) return { ok: false, error: 'Enter the code from the email (numbers only).' };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email: pending.email, token: code, type: 'email' });
  if (error) return { ok: false, error: 'That code isn’t right, or it has expired.' };

  cookieStore.delete(PENDING_COOKIE);
  await supabase.auth.updateUser({ data: { name: pending.name } });
  await supabase.from('admins').update({ name: pending.name }).eq('email', pending.email);
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath('/', 'layout');
  redirect('/');
}
