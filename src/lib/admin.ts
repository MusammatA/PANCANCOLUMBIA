import { isSupabaseConfigured } from './supabase/config';
import { createClient } from './supabase/server';

/** Every admin action calls this first; the database rules check again on each write. */
export async function requireAdmin() {
  if (!isSupabaseConfigured) throw new Error('Admin editing is not set up yet.');
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) throw new Error('Please log in again.');
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) throw new Error('Only board members can make changes.');
  return { supabase, user: data.user };
}
